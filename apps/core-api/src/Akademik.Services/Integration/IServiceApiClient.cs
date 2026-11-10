namespace Akademik.Services.Integration;

public interface IServiceApiClient
{
	Task NotifyUserDeletedAsync(int userId, CancellationToken cancellationToken = default);
}
