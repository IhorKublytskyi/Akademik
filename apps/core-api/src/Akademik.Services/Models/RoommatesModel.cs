using Akademik.DataProvider.Models;

namespace Akademik.Services.Models;

public record RoommatesModel
{
    public string RoomNumber { get; set; } = string.Empty;
    public List<Assignment>? Assignments { get; set; }
}