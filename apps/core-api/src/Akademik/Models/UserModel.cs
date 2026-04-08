using Akademik.DataProvider.Models;

namespace Akademik.Models;

public sealed record UserModel
{
    public int Id { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; } 
    public required string Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Role { get; set; } 
    public string? Status { get; set; } 
    public DateTime CreatedAt { get; set; }

    public static UserModel FromUser(User user)
    {
        return new UserModel
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            Role = user.Role.ToString(),
            Status = user.Status.ToString(),
            CreatedAt = user.CreatedAt
        };
    }
}
