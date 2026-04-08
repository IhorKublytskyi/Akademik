namespace Akademik.DataProvider.Models;

public sealed class Assignment
{
	public int Id { get; set; }
	public required int UserId { get; set; }
	public required int RoomId { get; set; }
	public DateOnly StartDate { get; set; }
	public DateOnly? EndDate { get; set; }
	public bool IsActive { get; set; }
	public User? User { get; set; }
	public Room? Room { get; set; }
}