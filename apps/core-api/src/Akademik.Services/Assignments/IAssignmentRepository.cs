using Akademik.DataProvider.Models;

namespace Akademik.Services.Assignments;

public interface IAssignmentRepository
{
	ValueTask CreateAsync(Assignment assignment, CancellationToken cancellationToken);
	ValueTask<PagedResult<Assignment>> GetAllAsync(Pagination pagination, CancellationToken cancellationToken);
}