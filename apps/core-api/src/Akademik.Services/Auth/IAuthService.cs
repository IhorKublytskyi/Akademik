using Akademik.DataProvider.Models;
using Akademik.Services.Models;

namespace Akademik.Services.Auth;

public interface IAuthService
{
    ValueTask<(User User, TokenModel Tokens)> LoginAsync(string email, string password, CancellationToken cancellationToken);
    ValueTask<User> RegisterAsync(User user, string password, CancellationToken cancellationToken);
}
