using System.Threading;
using System.Threading.Tasks;
using Akademik.DataProvider.Models;

namespace Akademik.Services.Users;

public interface IUserService
{
	ValueTask<User> CreateAsync(User user, CancellationToken cancellationToken = default);
	ValueTask<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
}