using System;
using System.Threading;
using System.Threading.Tasks;
using Akademik.DataProvider;
using Akademik.DataProvider.Models;
using Microsoft.EntityFrameworkCore;

namespace Akademik.Services.Users;

public sealed class UserRepository : IUserRepository
{
	private readonly AkademikDbContext _context;

	public UserRepository(AkademikDbContext context)
	{
		_context = context;
	}

	public async ValueTask<User> CreateAsync(User user, CancellationToken cancellationToken = default)
	{
		await _context.Users.AddAsync(user, cancellationToken);
		await _context.SaveChangesAsync(cancellationToken);
		
		return user;
	}

	public async ValueTask<PagedResult<User>> GetAsync(Pagination pagination, CancellationToken cancellationToken = default)
	{
		throw new NotImplementedException();
	}

	public async ValueTask<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
	{
		return await _context.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
	}

	public async ValueTask DeleteAsync(int id, CancellationToken cancellationToken = default)
	{
		throw new NotImplementedException();
	}

	public async ValueTask UpdateAsync(User user, CancellationToken cancellationToken = default)
	{
		throw new NotImplementedException();
	}
}