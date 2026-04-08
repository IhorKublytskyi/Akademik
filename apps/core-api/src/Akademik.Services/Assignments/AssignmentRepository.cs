using Akademik.DataProvider;
using Akademik.DataProvider.Models;
using Microsoft.EntityFrameworkCore;

namespace Akademik.Services.Assignments;

public sealed class AssignmentRepository : IAssignmentRepository
{
	private readonly AkademikDbContext _dbContext;

	public AssignmentRepository(AkademikDbContext dbContext)
	{
		_dbContext = dbContext;
	}
	public async ValueTask CreateAsync(Assignment assignment, CancellationToken cancellationToken)
	{
		await _dbContext.Assignments.AddAsync(assignment, cancellationToken);
		await _dbContext.SaveChangesAsync(cancellationToken);
	}

	public async ValueTask<PagedResult<Assignment>> GetAllAsync(Pagination pagination, CancellationToken cancellationToken)
	{
		IQueryable<Assignment> query = _dbContext.Assignments.AsNoTracking();

		Task<int> countTask = query.CountAsync();

		List<Assignment> assignments = await _dbContext.Assignments
			.Skip(pagination.Skip)
			.Take(pagination.PageSize)
			.Select(a => new Assignment
			{
				Id = a.Id,
				UserId = a.UserId,
				RoomId = a.RoomId,
				StartDate = a.StartDate,
				EndDate = a.EndDate,
				IsActive = a.IsActive,
			})
			.ToListAsync(cancellationToken);

		return new PagedResult<Assignment>()
		{
			Items = assignments,
			Count = await countTask,
		};
	}
}