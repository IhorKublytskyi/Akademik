using Microsoft.Extensions.Logging;

namespace Akademik.Services.Integration;

/// <summary>
/// Typed HTTP client for service-api. BaseAddress, the X-Api-Key header and
/// the retry policy are configured at registration in Program.cs.
/// </summary>
public sealed class ServiceApiClient : IServiceApiClient
{
	private readonly HttpClient _httpClient;
	private readonly ILogger<ServiceApiClient> _logger;

	public ServiceApiClient(HttpClient httpClient, ILogger<ServiceApiClient> logger)
	{
		_httpClient = httpClient;
		_logger = logger;
	}

	public async Task NotifyUserDeletedAsync(int userId, CancellationToken cancellationToken = default)
	{
		string path = $"internal/users/{userId}/deleted";

		_logger.LogInformation("Integration: POST {BaseAddress}{Path} (user deleted)", _httpClient.BaseAddress, path);

		using HttpResponseMessage response = await _httpClient.PostAsync(path, content: null, cancellationToken);

		_logger.LogInformation("Integration: service-api answered {StatusCode} for deleted user {UserId}",
			(int)response.StatusCode, userId);

		response.EnsureSuccessStatusCode();
	}
}
