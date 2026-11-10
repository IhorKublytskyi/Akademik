using Akademik.DataProvider;
using Akademik.Services.Integration;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Configuration;

namespace Akademik.IntegrationTests;

public class AkademikApplicationFactory : WebApplicationFactory<Program>
{
    public const string TestApiKey = "test-internal-api-key";

    public FakeServiceApiClient ServiceApiClient { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Force testing environment
        builder.UseEnvironment("Development");

        builder.ConfigureAppConfiguration((context, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "Jwt:Key", "SuperSecretKeyForIntegrationTesting1234567890" }, // Longer key
                { "Jwt:Issuer", "AkademikCore" },
                { "Jwt:Audience", "AkademikApp" },
                { "ConnectionStrings:AkademikConnectionString", "Host=localhost;Database=testing" }, // Dummy
                { "Integration:ApiKey", TestApiKey },
                { "Integration:ServiceApiUrl", "http://service-api.test" }
            });
        });

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
                options.UseInMemoryDatabase("IntegrationTestDb");
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
