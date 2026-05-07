using Akademik.DataProvider.Models;
using Akademik.DataProvider.Repositories;

namespace Akademik.Services.Assignments;

public sealed class AssignmentService : IAssignmentService
{
	private readonly IAssignmentRepository _repository;
	private readonly IRoomRepository _roomRepository;
	private readonly IUserRepository _userRepository;

	public AssignmentService(IAssignmentRepository repository, IRoomRepository roomRepository, IUserRepository userRepository)
	{
		_repository = repository;
		_roomRepository = roomRepository;
		_userRepository = userRepository;
	}

	public async ValueTask<Assignment> CreateAsync(Assignment assignment, CancellationToken cancellationToken)
	{
		cancellationToken.ThrowIfCancellationRequested();

		var hasActiveAssignment = await _repository.HasActiveAssignmentByUserIdAsync(assignment.UserId, cancellationToken);
		if (hasActiveAssignment)
		{
			throw new InvalidOperationException("User already has an active assignment.");
		}

		var user = await _userRepository.GetByIdAsync(assignment.UserId, cancellationToken);

		if(user is null || user.Status == UserStatus.Blocked)
		{
			throw new InvalidOperationException("Couldn't assign this user to this room.");
		}

		var room = await _roomRepository.GetByIdAsync(assignment.RoomId, cancellationToken);
		if (room == null)
		{
			throw new ArgumentException("Room not found.");
		}

		var activeAssignmentsCount = await _repository.GetActiveAssignmentsCountByRoomIdAsync(assignment.RoomId, cancellationToken);
		if (activeAssignmentsCount >= room.Capacity)
		{
			throw new InvalidOperationException("Room capacity exceeded.");
		}

		await _repository.CreateAsync(assignment, cancellationToken);

		return assignment;
	}

	public async ValueTask<PagedResult<Assignment>> GetAllAsync(Pagination pagination, CancellationToken cancellationToken)
	{
		cancellationToken.ThrowIfCancellationRequested();

		return await _repository.GetAllAsync(pagination, cancellationToken);
	}

	public async ValueTask<List<User>> GetRoommatesAsync(int userId, CancellationToken cancellationToken)
	{
		cancellationToken.ThrowIfCancellationRequested();

		var assignment = await _repository.GetActiveAssignmentByUserIdAsync(userId, cancellationToken);
		if (assignment == null)
		{
			return new List<User>();
		}

		return await _repository.GetRoommatesByRoomIdAsync(assignment.RoomId, userId, cancellationToken);
	}

	public async ValueTask DeleteAsync(int id, CancellationToken cancellationToken)
	{
		await _repository.DeleteAsync(id, cancellationToken);
	}
}