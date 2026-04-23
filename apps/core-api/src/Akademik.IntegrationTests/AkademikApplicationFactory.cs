using Akademik.DataProvider;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Linq;

namespace Akademik.IntegrationTests;

public class AkademikApplicationFactory : WebApplicationFactory<Program>
{
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
                { "ConnectionStrings:AkademikConnectionString", "Host=localhost;Database=testing" } // Dummy
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
                // Seeding is done by DbInitializer called in Program.cs
            }
        });
    }
}
