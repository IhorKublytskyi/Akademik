using System.Diagnostics;
using Akademik.DataProvider.Models;

namespace Akademik.Services.Models;

public record RoomModel
{
	public int Id { get; set; }

	public string Number { get; set; } = string.Empty;
	
	public int Floor { get; set; }
	
	public int Capacity { get; set; }
	
	public RoomStatus Status { get; set; }

	public static RoomModel FromRoom(Room room)
	{
		return new RoomModel
		{
			Id = room.Id,
			Number = room.Number,
			Floor = room.Floor,
			Capacity = room.Capacity,
			Status = room.Status
		};
	}
}