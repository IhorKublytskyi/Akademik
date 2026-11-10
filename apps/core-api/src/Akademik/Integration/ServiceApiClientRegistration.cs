using Akademik.Services.Integration;

namespace Akademik.Integration;

public static class ServiceApiClientRegistration
{
	// Upper bound for how long a request (e.g. DELETE /api/core/users/{id}) can wait on service-api.
	public static readonly TimeSpan AttemptTimeout = TimeSpan.FromSeconds(2);
	public static readonly TimeSpan TotalTimeout = TimeSpan.FromSeconds(5);

	/// <summary>
	/// Typed client for service-api with a bounded retry policy: short per-attempt timeout,
	/// two retries with exponential backoff, and a 5 s total budget, so a down service-api
	/// delays the caller by seconds, not by the default 30 s.
	/// </summary>
	public static IHttpClientBuilder AddServiceApiClient(this IServiceCollection services, IConfiguration configuration)
	{
		IHttpClientBuilder builder = services.AddHttpClient<IServiceApiClient, ServiceApiClient>(client =>
		{
			string baseUrl = configuration["Integration:ServiceApiUrl"] ?? "http://service-api:3002";
			client.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/api/service/");
			client.DefaultRequestHeaders.Add("X-Api-Key", configuration["Integration:ApiKey"] ?? string.Empty);
		});

		builder.AddStandardResilienceHandler(options =>
		{
			options.AttemptTimeout.Timeout = AttemptTimeout;
			options.Retry.MaxRetryAttempts = 2;
			options.Retry.Delay = TimeSpan.FromMilliseconds(200);
			options.TotalRequestTimeout.Timeout = TotalTimeout;
		});

		return builder;
	}
}
