using Akademik.DataProvider.Models;
using Microsoft.EntityFrameworkCore;

namespace Akademik.DataProvider.Repositories;

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

        int count = await query.CountAsync(cancellationToken);

        List<Assignment> assignments = await query
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
            Count = count,
        };
    }

    public async ValueTask<int> GetActiveAssignmentsCountByRoomIdAsync(int roomId, CancellationToken cancellationToken)
    {
        return await _dbContext.Assignments
            .CountAsync(a => a.RoomId == roomId && a.IsActive, cancellationToken);
    }

    public async ValueTask<bool> HasActiveAssignmentByUserIdAsync(int userId, CancellationToken cancellationToken)
    {
        return await _dbContext.Assignments
            .AnyAsync(a => a.UserId == userId && a.IsActive, cancellationToken);
    }

    public async ValueTask<Assignment?> GetActiveAssignmentByUserIdAsync(int userId, CancellationToken cancellationToken)
    {
        return await _dbContext.Assignments
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.UserId == userId && a.IsActive, cancellationToken);
    }

    public async ValueTask<List<User>> GetRoommatesByRoomIdAsync(int roomId, int currentUserId, CancellationToken cancellationToken)
    {
        return await _dbContext.Assignments
            .Where(a => a.RoomId == roomId && a.IsActive && a.UserId != currentUserId)
            .Select(a => a.User!)
            .ToListAsync(cancellationToken);
    }

    public async ValueTask DeleteAsync(int id, CancellationToken cancellationToken)
    {
        await _dbContext.Assignments
        .Where(a => a.Id == id)
        .ExecuteDeleteAsync(cancellationToken);
    }
}
