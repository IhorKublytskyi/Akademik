using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Akademik.Models;
using Xunit;
using Xunit.Abstractions;

namespace Akademik.IntegrationTests;

public class AuthTests : IClassFixture<AkademikApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly ITestOutputHelper _output;
    private readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

    public AuthTests(AkademikApplicationFactory factory, ITestOutputHelper output)
    {
        _client = factory.CreateClient();
        _output = output;
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOkAndToken()
    {
        // Arrange
        var request = new LoginRequest("admin@akademik.com", "admin123");

        // Act
        var response = await _client.PostAsJsonAsync("/api/core/auth/login", request);

        // Assert
        if (response.StatusCode != HttpStatusCode.OK)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            _output.WriteLine($"Login failed with status {response.StatusCode} and body: {errorBody}");
        }
        
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<LoginResponse>(_jsonOptions);
        Assert.NotNull(result);
        Assert.NotNull(result.Token.AccessToken);
    }
}
