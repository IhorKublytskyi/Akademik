using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Akademik.DataProvider.Models;
using Akademik.Models;
using Xunit;

namespace Akademik.IntegrationTests;

public class AssignmentTests : IClassFixture<AkademikApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

    public AssignmentTests(AkademikApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task AuthenticateAsAdminAsync()
    {
        var loginRequest = new LoginRequest("admin@akademik.com", "admin123");
        var response = await _client.PostAsJsonAsync("/api/core/auth/login", loginRequest);
        var result = await response.Content.ReadFromJsonAsync<LoginResponse>(_jsonOptions);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", result!.Token.AccessToken);
    }

    [Fact]
    public async Task CreateAssignment_WhenRoomIsFull_ReturnsBadRequest()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        // Room 101 has capacity 2 (seeded in DbInitializer)
        var req1 = new CreateAssignmentRequest(1, 1, DateTime.UtcNow); 
        var req2 = new CreateAssignmentRequest(2, 1, DateTime.UtcNow); 
        
        await _client.PostAsJsonAsync("/api/core/assignments-add", req1);
        await _client.PostAsJsonAsync("/api/core/assignments-add", req2);

        // Act - try to add same student again or another person (room is full)
        var req3 = new CreateAssignmentRequest(1, 1, DateTime.UtcNow);
        var response = await _client.PostAsJsonAsync("/api/core/assignments-add", req3);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
