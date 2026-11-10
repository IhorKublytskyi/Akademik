using System.Diagnostics;
using Akademik.Integration;
using Akademik.Services.Integration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Akademik.IntegrationTests;

public class ServiceApiClientResilienceTests
{
    /// <summary>Simulates a service-api that accepts the connection but never answers.</summary>
    private sealed class HangingHandler : HttpMessageHandler
    {
        public int Attempts;

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            Interlocked.Increment(ref Attempts);
            await Task.Delay(Timeout.Infinite, cancellationToken);
            throw new UnreachableException();
        }
    }

    [Fact]
    public async Task NotifyUserDeleted_WhenServiceApiHangs_GivesUpWithinTotalTimeout()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "Integration:ServiceApiUrl", "http://service-api.test" },
                { "Integration:ApiKey", "test-key" }
            })
            .Build();

        var handler = new HangingHandler();
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddServiceApiClient(configuration).ConfigurePrimaryHttpMessageHandler(() => handler);

        using var provider = services.BuildServiceProvider();
        var client = provider.GetRequiredService<IServiceApiClient>();

        var stopwatch = Stopwatch.StartNew();
        await Assert.ThrowsAnyAsync<Exception>(() => client.NotifyUserDeletedAsync(42));
        stopwatch.Stop();

        // Default standard handler would wait up to 30 s; ours must stop at ~5 s.
        Assert.True(stopwatch.Elapsed < ServiceApiClientRegistration.TotalTimeout + TimeSpan.FromSeconds(2),
            $"Took {stopwatch.Elapsed}");
        Assert.True(handler.Attempts >= 2, $"Expected retries, got {handler.Attempts} attempt(s)");
    }
}
