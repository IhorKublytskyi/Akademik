using Akademik.DataProvider.Models;

namespace Akademik.Services.Models;

public class UserModel
{
	public int Id { get; set; }
	
	public string FirstName { get; set; } = string.Empty;
	
	public string LastName { get; set; } = string.Empty;
	
	public string Email { get; set; } = string.Empty;
	
	public string PhoneNumber { get; set; } = string.Empty;

	public string Role { get; set; } = string.Empty;

	public string Status { get; set; } = string.Empty;
	
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