using Akademik.DataProvider.Models;
using Akademik.DataProvider.Repositories;

namespace Akademik.Services.Users;

public class UserService : IUserService
{
	private readonly IUserRepository _repository;
	
	public UserService(IUserRepository repository)
	{
		_repository = repository;
	}

	public async ValueTask<PagedResult<User>> GetAllAsync(Pagination pagination, CancellationToken cancellationToken)
	{
		cancellationToken.ThrowIfCancellationRequested();

		return await _repository.GetAllAsync(pagination, cancellationToken);
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

	public async ValueTask<User?> GetByIdAsync(int id, CancellationToken cancellationToken)
	{
		cancellationToken.ThrowIfCancellationRequested();

		return await  _repository.GetByIdAsync(id, cancellationToken);
	}

	public async ValueTask<User?> UpdateAsync(User user, CancellationToken cancellationToken = default)
	{
		await _repository.UpdateAsync(user, cancellationToken);
		
		return user;
	}

    public async ValueTask DeleteAsync(int id, CancellationToken cancellationToken)
    {
        await _repository.DeleteAsync(id, cancellationToken);
    }
}