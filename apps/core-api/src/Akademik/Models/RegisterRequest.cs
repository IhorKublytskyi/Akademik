using Akademik.DataProvider.Models;

namespace Akademik.Models;

public record RegisterRequest(
	string Email, 
	string Password, 
	string FirstName, 
	string LastName, 
	UserRole Role, 
	string? Phone);