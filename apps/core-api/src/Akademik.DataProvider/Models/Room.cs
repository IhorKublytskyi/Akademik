using System.ComponentModel.DataAnnotations;

namespace Akademik.DataProvider.Models;

public sealed class Room
{
	public int Id { get; set; }
	public required string Number { get; set; }
	public int Floor { get; set; }
	[Range(0, 2)]
	public required int Capacity { get; set; }
	public RoomStatus Status { get; set; } = RoomStatus.Closed;
	public Assignment? Assignment { get; set; }
}