using Akademik.DataProvider.Models;

namespace Akademik.Models;

public record UpdateRoomRequest(int Id, string Number, int Floor, int Capacity, RoomStatus Status);
