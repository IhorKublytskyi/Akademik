using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Akademik.Models;
using Xunit;

namespace Akademik.IntegrationTests;

public class InternalApiTests : IClassFixture<AkademikApplicationFactory>
{
    private const string ApiKeyHeader = "X-Api-Key";

    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

    public InternalApiTests(AkademikApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private record InternalUserResponse(int Id, string Email, string FirstName, string LastName);

    private async Task<int> GetAdminIdAsync()
    {
        var response = await _client.PostAsJsonAsync("/api/core/auth/login", new LoginRequest("admin@akademik.com", "admin123"));
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<LoginResponse>(_jsonOptions);
        return result!.User.Id;
    }

    private static HttpRequestMessage InternalUserRequest(int id, string? apiKey)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, $"/api/core/internal/users/{id}");
        if (apiKey is not null)
        {
            request.Headers.Add(ApiKeyHeader, apiKey);
        }
        return request;
    }

    [Fact]
    public async Task GetInternalUser_WithoutApiKey_ReturnsUnauthorized()
    {
        int adminId = await GetAdminIdAsync();

        var response = await _client.SendAsync(InternalUserRequest(adminId, apiKey: null));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetInternalUser_WithWrongApiKey_ReturnsUnauthorized()
    {
        int adminId = await GetAdminIdAsync();

        var response = await _client.SendAsync(InternalUserRequest(adminId, "wrong-key"));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetInternalUser_WithValidApiKey_ReturnsUser()
    {
        int adminId = await GetAdminIdAsync();

        var response = await _client.SendAsync(InternalUserRequest(adminId, AkademikApplicationFactory.TestApiKey));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var user = await response.Content.ReadFromJsonAsync<InternalUserResponse>(_jsonOptions);
        Assert.NotNull(user);
        Assert.Equal(adminId, user.Id);
        Assert.Equal("admin@akademik.com", user.Email);
        Assert.False(string.IsNullOrEmpty(user.FirstName));
        Assert.False(string.IsNullOrEmpty(user.LastName));
    }

    [Fact]
    public async Task GetInternalUser_UnknownId_ReturnsNotFound()
    {
        var response = await _client.SendAsync(InternalUserRequest(999_999, AkademikApplicationFactory.TestApiKey));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
