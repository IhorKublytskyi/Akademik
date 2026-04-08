using Akademik.DataProvider.Models;

namespace Akademik.Services.Rooms;

public interface IRoomService
{
	ValueTask<PagedResult<Room>> GetAllAsync(Pagination pagination, CancellationToken cancellationToken);
	ValueTask<Room?> GetByIdAsync(int id, CancellationToken cancellationToken);
	ValueTask<Room> CreateAsync(Room room, CancellationToken cancellationToken);
}