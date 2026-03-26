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

	public async Task<RefreshToken> AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
	{
		await _context.RefreshTokens.AddAsync(refreshToken, cancellationToken);
		await _context.SaveChangesAsync(cancellationToken);
		
		return refreshToken;
	}

	public async Task<RefreshToken?> GetByBodyAsync(string tokenBody, CancellationToken cancellationToken = default)
	{
		return await _context.RefreshTokens
			.AsNoTracking()
			.FirstOrDefaultAsync(rt => rt.TokenBody == tokenBody, cancellationToken);
	}
}