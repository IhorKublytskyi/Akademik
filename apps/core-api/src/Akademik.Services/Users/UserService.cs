using System.Threading;
using System.Threading.Tasks;
using Akademik.DataProvider.Models;

namespace Akademik.Services.Users;

public class UserService : IUserService
{
	private readonly IUserRepository _repository;
	
	public UserService(IUserRepository repository)
	{
		_repository = repository;
	}
	
	public async ValueTask<User> CreateAsync(User user, CancellationToken cancellationToken = default)
	{
		cancellationToken.ThrowIfCancellationRequested();
		
		//TODO: Add validation
		await _repository.CreateAsync(user, cancellationToken);
			
		return user;
	}
	
	public async ValueTask<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
	{
		cancellationToken.ThrowIfCancellationRequested();
		
		return await _repository.GetByEmailAsync(email, cancellationToken);
	}
}