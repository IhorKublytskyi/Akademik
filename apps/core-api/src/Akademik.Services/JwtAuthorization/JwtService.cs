using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Akademik.DataProvider.Models;
using Akademik.Services.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Akademik.Services.JwtAuthorization;

public sealed class JwtService : IJwtService
{
	private readonly IConfiguration _configuration;
	private readonly IRefreshTokenRepository _repository;
	
	public JwtService(IConfiguration configuration, IRefreshTokenRepository repository)
	{
		_configuration = configuration;
		_repository = repository;
	}
	
	public string GenerateJwtToken(User? user, CancellationToken cancellationToken = default)
	{
		cancellationToken.ThrowIfCancellationRequested();
		
		if (user is null)
		{
			throw new ArgumentNullException(nameof(user));
		}
		
		var claims = new List<Claim>
		{
			new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
			new(JwtRegisteredClaimNames.Email, user.Email),
			new(ClaimTypes.Role, user.Role.ToString()),
			new("status", user.Status.ToString())
		};

		var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
		var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

		var token = new JwtSecurityToken(
			issuer: _configuration["Jwt:Issuer"],
			audience: _configuration["Jwt:Audience"],
			claims: claims,
			expires: DateTime.UtcNow.AddHours(2),
			signingCredentials: credentials);

		return new JwtSecurityTokenHandler().WriteToken(token);
	}

	public Claim? ExtractClaim(string token, string claimName)
	{
		var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
		
		var claim = jwt.Claims.First(c => c.Type == claimName);

		return claim;
	}

	public async ValueTask<TokenModel> GenerateTokensAsync(User? user, CancellationToken cancellationToken = default)
	{
		cancellationToken.ThrowIfCancellationRequested();

		if (user is null)
		{
			throw new ArgumentNullException(nameof(user));
		}
		
		var accessToken = GenerateJwtToken(user); 
    
		var refreshToken = new RefreshToken
		{
			TokenBody = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
			Expires = DateTime.UtcNow.AddDays(7),
			Created = DateTime.UtcNow,
			UserId = user.Id,
		};

		await _repository.AddAsync(refreshToken);
		
		return new TokenModel(accessToken, refreshToken.TokenBody);
	}

	public async ValueTask<RefreshToken> GetByBodyAsync(string tokenBody, CancellationToken cancellationToken = default)
	{
		cancellationToken.ThrowIfCancellationRequested();
		
		var token = await _repository.GetByBodyAsync(tokenBody);

		if (token is null)
		{
			throw new ArgumentException(nameof(tokenBody));
		}

		return token;
	}
}