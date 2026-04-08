using Akademik.DataProvider.Models;

namespace Akademik.Services.Rooms;

public sealed class RoomService : IRoomService
{
	private readonly IRoomRepository _repository;

	public RoomService(IRoomRepository repository)
	{
		_repository = repository;
	}
		
	public async ValueTask<PagedResult<Room>> GetAllAsync(Pagination pagination, CancellationToken cancellationToken)
	{
		cancellationToken.ThrowIfCancellationRequested();
		
		return await _repository.GetAllAsync(pagination, cancellationToken);
	}

	public async ValueTask<Room?> GetByIdAsync(int id, CancellationToken cancellationToken)
	{
		cancellationToken.ThrowIfCancellationRequested();
		
		return await _repository.GetByIdAsync(id, cancellationToken);
	}

	public async ValueTask<Room> CreateAsync(Room room, CancellationToken cancellationToken)
	{
		await _repository.CreateAsync(room, cancellationToken);

		return room;
	}
}