using Akademik.DataProvider.Models;

namespace Akademik.DataProvider.Repositories;

public interface IRefreshTokenRepository
{
    ValueTask<RefreshToken> AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default);
    ValueTask<RefreshToken?> GetByBodyAsync(string tokenBody, CancellationToken cancellationToken = default);
    ValueTask UpdateAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default);
}
