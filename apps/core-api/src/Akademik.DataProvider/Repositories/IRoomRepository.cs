using Akademik.DataProvider.Models;

namespace Akademik.DataProvider.Repositories;

public interface IRoomRepository
{
    ValueTask<Room?> GetByIdAsync(int id, CancellationToken cancellationToken);
    ValueTask CreateAsync(Room room, CancellationToken cancellationToken);
    ValueTask UpdateAsync(Room room, CancellationToken cancellationToken);
    ValueTask<PagedResult<Room>> GetAllAsync(Pagination pagination, CancellationToken cancellationToken);
}
