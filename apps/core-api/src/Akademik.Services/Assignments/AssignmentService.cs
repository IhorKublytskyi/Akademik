using Akademik.DataProvider.Models;

namespace Akademik.Services.Assignments;

public sealed class AssignmentService : IAssignmentService
{
	private readonly IAssignmentRepository _repository;

	public AssignmentService(IAssignmentRepository repository)
	{
		_repository = repository;
	}
	public async ValueTask<Assignment> CreateAsync(Assignment assignment, CancellationToken cancellationToken)
	{
		cancellationToken.ThrowIfCancellationRequested();
		
		await _repository.CreateAsync(assignment, cancellationToken);
		
		return  assignment;
	}

	public async ValueTask<PagedResult<Assignment>> GetAllAsync(Pagination pagination, CancellationToken cancellationToken)
	{
		cancellationToken.ThrowIfCancellationRequested();
		
		return await _repository.GetAllAsync(pagination, cancellationToken);
	}
}