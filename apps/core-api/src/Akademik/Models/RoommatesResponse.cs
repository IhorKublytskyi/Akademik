namespace Akademik.Models;

public record RoommatesResponse
{
    public int RoomNumber { get; set; }
    public List<UserDto> Roommates {get; set;} = [];
}

public record UserDto
{
    public int Id {get;set;}
    public string Email {get;set;} = string.Empty;
    public string FirstName {get;set;} = string.Empty;
    public string LastName {get;set;} = string.Empty;
}