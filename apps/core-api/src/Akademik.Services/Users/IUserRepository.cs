using Akademik.DataProvider.Models;

namespace Akademik.Services.Users;

public interface IUserRepository
{
	ValueTask<User> CreateAsync(User user, CancellationToken cancellationToken);
	ValueTask<PagedResult<User>> GetAllAsync(Pagination pagination, CancellationToken cancellationToken);
	ValueTask<User?> GetByEmailAsync(string email, CancellationToken cancellationToken);
	ValueTask<User?> GetByIdAsync(int id, CancellationToken cancellationToken);
	
	ValueTask DeleteAsync(int id, CancellationToken cancellationToken);
	ValueTask UpdateAsync(User user, CancellationToken cancellationToken);
}