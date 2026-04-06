using System.Threading;
using System.Threading.Tasks;
using Akademik.DataProvider.Models;

namespace Akademik.Services.Users;

public interface IUserRepository
{
	ValueTask<User> CreateAsync(User user, CancellationToken cancellationToken = default);
	ValueTask<PagedResult<User>> GetAsync(Pagination pagination, CancellationToken cancellationToken = default);
	ValueTask<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
	ValueTask DeleteAsync(int id, CancellationToken cancellationToken = default);
	ValueTask UpdateAsync(User user, CancellationToken cancellationToken = default);
}