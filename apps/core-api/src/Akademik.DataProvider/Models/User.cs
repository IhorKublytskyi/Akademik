namespace Akademik.DataProvider.Models;

public sealed class User
{
    public int Id { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; } 
    public required string Email { get; set; }
    public string? PasswordHash { get; set; }
    public string? PhoneNumber { get; set; }
    public UserRole Role { get; set; } = UserRole.Resident;
    public UserStatus Status { get; set; } = UserStatus.Active;
    public DateTime CreatedAt { get; set; }
    public Assignment? Assignment { get; set; }
}
