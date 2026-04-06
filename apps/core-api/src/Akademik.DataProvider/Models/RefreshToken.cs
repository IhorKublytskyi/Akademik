namespace Akademik.DataProvider.Models;

public sealed class RefreshToken
{
    public int Id { get; set; }
    public string TokenBody { get; set; } = string.Empty;
    public DateTime Expires { get; set; }
    public bool IsExpired => DateTime.UtcNow >= Expires;
    public DateTime Created { get; set; }
    public DateTime? Revoked { get; set; }
    public bool IsActive => Revoked == null && !IsExpired;

    public required int UserId { get; set; }
    public User? User { get; set; }
}
