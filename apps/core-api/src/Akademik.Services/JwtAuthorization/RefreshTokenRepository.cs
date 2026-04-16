using Akademik.DataProvider;
using Akademik.DataProvider.Models;
using Microsoft.EntityFrameworkCore;

namespace Akademik.Services.JwtAuthorization;

public sealed class RefreshTokenRepository : IRefreshTokenRepository
{
	private readonly AkademikDbContext _context;

	public RefreshTokenRepository(AkademikDbContext context)
	{
		_context = context;
	}

	public async ValueTask<RefreshToken> AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
	{
		await _context.RefreshTokens.AddAsync(refreshToken, cancellationToken);
		await _context.SaveChangesAsync(cancellationToken);
		
		return refreshToken;
	}

	public async ValueTask<RefreshToken?> GetByBodyAsync(string tokenBody, CancellationToken cancellationToken = default)
	{
		var token =await _context.RefreshTokens
			.AsNoTracking()
			.Include(rt => rt.User)
			.FirstOrDefaultAsync(rt => rt.TokenBody == tokenBody, cancellationToken);

		return token;
	}

    public async ValueTask UpdateAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
    {
        await _context.RefreshTokens
		.Where(rt => rt.Id == refreshToken.Id)
		.ExecuteUpdateAsync(setPropertyCalls => setPropertyCalls.SetProperty(rt => rt.Revoked, refreshToken.Revoked), cancellationToken);
    }
}