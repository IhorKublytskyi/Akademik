using Akademik.DataProvider.Models;

namespace Akademik.Services.Users;

public interface IUserService
{
	ValueTask<PagedResult<User>> GetAllAsync (Pagination pagination, CancellationToken cancellationToken);
	ValueTask<User> CreateAsync(User user, CancellationToken cancellationToken = default);
	ValueTask<User?> GetByEmailAsync(string email, CancellationToken cancellationToken);
	ValueTask<User?> GetByIdAsync(int id, CancellationToken cancellationToken);
	ValueTask<User?> UpdateAsync(User user, CancellationToken cancellationToken = default);
}