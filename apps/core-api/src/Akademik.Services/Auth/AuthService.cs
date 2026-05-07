using Akademik.DataProvider.Models;
using Akademik.Services.JwtAuthorization;
using Akademik.Services.Models;
using Akademik.Services.Security;
using Akademik.Services.Users;

namespace Akademik.Services.Auth;

public sealed class AuthService : IAuthService
{
    private readonly IUserService _userService;
    private readonly IJwtService _jwtService;
    private readonly IPasswordHasher _passwordHasher;

    public AuthService(
        IUserService userService,
        IJwtService jwtService,
        IPasswordHasher passwordHasher)
    {
        _userService = userService;
        _jwtService = jwtService;
        _passwordHasher = passwordHasher;
    }

    public async ValueTask<(User User, TokenModel Tokens)> LoginAsync(string email, string password, CancellationToken cancellationToken)
    {
        var user = await _userService.GetByEmailAsync(email, cancellationToken);
        
        if (user is null || string.IsNullOrEmpty(user.PasswordHash) || !_passwordHasher.VerifyPassword(password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        if (user.Status == UserStatus.Blocked)
        {
            throw new UnauthorizedAccessException("User is blocked");
        }

        var tokens = await _jwtService.GenerateTokensAsync(user, cancellationToken);
        
        return (user, tokens);
    }

    public async ValueTask<User> RegisterAsync(User user, string password, CancellationToken cancellationToken)
    {
        var existingUser = await _userService.GetByEmailAsync(user.Email, cancellationToken);
        if (existingUser is not null)
        {
            throw new InvalidOperationException("User already exists");
        }

        user.PasswordHash = _passwordHasher.HashPassword(password);
        user.CreatedAt = DateTime.UtcNow;
        user.Status = UserStatus.Active;

        return await _userService.CreateAsync(user, cancellationToken);
    }
}
