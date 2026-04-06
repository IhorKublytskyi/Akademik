using System.Threading;
using System.Threading.Tasks;
using Akademik.DataProvider.Models;
using Akademik.Services.Models;

namespace Akademik.Services.JwtAuthorization;

public interface IJwtService
{
    string GenerateJwtToken(User? user, CancellationToken cancellationToken = default);
    ValueTask<TokenModel> GenerateTokensAsync(User? user, CancellationToken cancellationToken = default);
    ValueTask<RefreshToken> GetByBodyAsync(string tokenBody, CancellationToken cancellationToken = default);
}