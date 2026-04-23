using Akademik.DataProvider.Models;

namespace Akademik.Services.Assignments;

public interface IAssignmentRepository
{
	ValueTask CreateAsync(Assignment assignment, CancellationToken cancellationToken);
	ValueTask<PagedResult<Assignment>> GetAllAsync(Pagination pagination, CancellationToken cancellationToken);
	ValueTask<int> GetActiveAssignmentsCountByRoomIdAsync(int roomId, CancellationToken cancellationToken);
	ValueTask<bool> HasActiveAssignmentByUserIdAsync(int userId, CancellationToken cancellationToken);
	ValueTask<Assignment?> GetActiveAssignmentByUserIdAsync(int userId, CancellationToken cancellationToken);
	ValueTask<List<User>> GetRoommatesByRoomIdAsync(int roomId, int currentUserId, CancellationToken cancellationToken);
}