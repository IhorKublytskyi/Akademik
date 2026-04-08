namespace Akademik.Models;

public record UpdateUserRequest(
	int Id,
	string FirstName, 
	string LastName, 
	string PhoneNumber, 
	string Email, 
	string Status );