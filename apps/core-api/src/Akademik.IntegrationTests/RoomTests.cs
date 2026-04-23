using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Akademik.DataProvider.Models;
using Akademik.Models;
using Xunit;

namespace Akademik.IntegrationTests;

public class RoomTests : IClassFixture<AkademikApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

    public RoomTests(AkademikApplicationFactory factory)
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
    public async Task CreateRoom_AsAdmin_ReturnsOk()
    {
        // Arrange
        await AuthenticateAsAdminAsync();
        var request = new CreateRoomRequest("303", 3, 2);

        // Act
        var response = await _client.PostAsJsonAsync("/api/core/rooms-add", request);

        // Assert
        response.EnsureSuccessStatusCode();
        var room = await response.Content.ReadFromJsonAsync<Room>(_jsonOptions);
        Assert.Equal("303", room!.Number);
    }

    [Fact]
    public async Task UpdateRoom_AsAdmin_ReturnsOk()
    {
        // Arrange
        await AuthenticateAsAdminAsync();
        var request = new UpdateRoomRequest(1, "101-Updated", 1, 2, RoomStatus.Occupied);

        // Act
        var response = await _client.PostAsJsonAsync("/api/core/rooms-edit", request);

        // Assert
        response.EnsureSuccessStatusCode();
        var room = await response.Content.ReadFromJsonAsync<Room>(_jsonOptions);
        Assert.Equal("101-Updated", room!.Number);
    }
}
