using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Akademik.DataProvider.Models;
using Akademik.Services.Models;

namespace Akademik.Services.JwtAuthorization;

public interface IJwtService
{
    string GenerateJwtToken(User? user, CancellationToken cancellationToken);
    Claim? ExtractClaim(string token, string claimName);
    ValueTask<TokenModel> GenerateTokensAsync(User? user, CancellationToken cancellationToken);
    ValueTask<RefreshToken?> GetByBodyAsync(string tokenBody, CancellationToken cancellationToken);
    ValueTask<TokenModel> RotateTokensAsync(string refreshTokenBody, CancellationToken cancellationToken);
}