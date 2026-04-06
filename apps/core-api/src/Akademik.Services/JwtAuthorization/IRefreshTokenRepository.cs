using System.Threading;
using System.Threading.Tasks;
using Akademik.DataProvider.Models;

namespace Akademik.Services.JwtAuthorization;

public interface IRefreshTokenRepository
{
	Task<RefreshToken> AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default);	
	Task<RefreshToken?> GetByBodyAsync(string tokenBody, CancellationToken cancellationToken = default);
}