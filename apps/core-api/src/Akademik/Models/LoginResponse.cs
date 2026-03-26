namespace Akademik.Models;

public sealed record LoginResponse(string Token, string Role, string Expiry);