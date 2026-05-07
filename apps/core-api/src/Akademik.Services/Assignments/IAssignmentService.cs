using Akademik.DataProvider.Models;

namespace Akademik.Services.Assignments;

public interface IAssignmentService
{
	ValueTask<Assignment> CreateAsync(Assignment assignment, CancellationToken cancellationToken);
	ValueTask<PagedResult<Assignment>> GetAllAsync(Pagination pagination, CancellationToken cancellationToken);
	ValueTask<List<User>> GetRoommatesAsync(int userId, CancellationToken cancellationToken);
	ValueTask DeleteAsync(int id, CancellationToken cancellationToken); 
}