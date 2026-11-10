using Akademik.DataProvider;
using Akademik.Services.Integration;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Akademik.IntegrationTests;

public class AkademikApplicationFactory : WebApplicationFactory<Program>
{
    public const string TestApiKey = "test-internal-api-key";

    public FakeServiceApiClient ServiceApiClient { get; } = new();

    // One database per factory: test classes run in parallel and each factory
    // deletes and reseeds its database on startup.
    private readonly string _databaseName = $"IntegrationTestDb-{Guid.NewGuid()}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Force testing environment
        builder.UseEnvironment("Development");

        // UseSetting (not ConfigureAppConfiguration) so Program.cs sees these values
        // before builder.Build(), e.g. the Jwt:Key startup check.
        builder.UseSetting("Jwt:Key", "SuperSecretKeyForIntegrationTesting1234567890");
        builder.UseSetting("Jwt:Issuer", "AkademikCore");
        builder.UseSetting("Jwt:Audience", "AkademikApp");
        builder.UseSetting("ConnectionStrings:AkademikConnectionString", "Host=localhost;Database=testing"); // Dummy
        builder.UseSetting("Integration:ApiKey", TestApiKey);
        builder.UseSetting("Integration:ServiceApiUrl", "http://service-api.test");

        builder.ConfigureServices(services =>
        {
            var descriptors = services.Where(
                d => d.ServiceType == typeof(DbContextOptions) || 
                     d.ServiceType == typeof(DbContextOptions<AkademikDbContext>) ||
                     d.ServiceType.FullName?.Contains("EntityFrameworkCore") == true).ToList();

            foreach (var descriptor in descriptors)
            {
                services.Remove(descriptor);
            }

            // Tests must not call a real service-api (the resilience handler would keep retrying).
            services.RemoveAll<IServiceApiClient>();
            services.AddSingleton<IServiceApiClient>(ServiceApiClient);

            services.AddDbContext<AkademikDbContext>(options =>
            {
                options.UseInMemoryDatabase(_databaseName);
            });

            var sp = services.BuildServiceProvider();
            using (var scope = sp.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AkademikDbContext>();
                db.Database.EnsureDeleted();
                db.Database.EnsureCreated();
                DbInitializer.InitializeAsync(db).GetAwaiter().GetResult();
            }
        });
    }
}

public sealed class FakeServiceApiClient : IServiceApiClient
{
    public List<int> DeletedUserIds { get; } = new();

    public Task NotifyUserDeletedAsync(int userId, CancellationToken cancellationToken = default)
    {
        lock (DeletedUserIds)
        {
            DeletedUserIds.Add(userId);
        }

        return Task.CompletedTask;
    }
}
