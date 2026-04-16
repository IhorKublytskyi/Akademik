using Akademik.DataProvider;
using Akademik.DataProvider.Models;
using Microsoft.EntityFrameworkCore;

namespace Akademik.Services.Users;

public sealed class UserRepository : IUserRepository
{
    private readonly AkademikDbContext _dbContext;

    public UserRepository(AkademikDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async ValueTask<User> CreateAsync(User user, CancellationToken cancellationToken = default)
    {
        await _dbContext.Users.AddAsync(user, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return user;
    }

    public async ValueTask<PagedResult<User>> GetAllAsync(Pagination pagination, CancellationToken cancellationToken = default)
    {
        IQueryable<User> query = _dbContext.Users.AsNoTracking();

        int count = await query.CountAsync(cancellationToken);

        List<User> users = await query
            .OrderBy(u => u.Id)
            .Skip(pagination.Skip)
            .Take(pagination.PageSize)
            .Select(u => new User
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Role = u.Role,
                Status = u.Status,
                PhoneNumber = u.PhoneNumber,
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<User>()
        {
            Items = users,
            Count = count,
        };
    }

    public async ValueTask<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async ValueTask<User?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        return await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async ValueTask DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public async ValueTask UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        await _dbContext.Users
            .Where(u => u.Id == user.Id)
            .ExecuteUpdateAsync(builder =>
                builder
                    .SetProperty(u => u.FirstName, user.FirstName)
                    .SetProperty(u => u.LastName, user.LastName)
                    .SetProperty(u => u.Email, user.Email)
                    .SetProperty(u => u.Status, user.Status)
                    .SetProperty(u => u.PhoneNumber, user.PhoneNumber), cancellationToken);
    }
}