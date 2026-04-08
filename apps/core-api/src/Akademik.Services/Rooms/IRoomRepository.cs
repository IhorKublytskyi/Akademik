using Akademik.DataProvider.Models;

namespace Akademik.Services.Rooms;

public interface IRoomRepository
{
	public ValueTask<Room?> GetByIdAsync(int id, CancellationToken cancellationToken);
	public ValueTask CreateAsync(Room room, CancellationToken cancellationToken);
	public ValueTask<PagedResult<Room>> GetAllAsync(Pagination pagination, CancellationToken cancellationToken);
}