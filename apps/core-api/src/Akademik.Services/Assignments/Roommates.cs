using Akademik.DataProvider.Models;

namespace Akademik.Services.Assignments;

public record Roommates
{
    public int RoomNumber { get; set; }
    public List<Assignment>? Assignments { get; set; }
}