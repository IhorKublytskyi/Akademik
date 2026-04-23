using Akademik.Services.Models;

namespace Akademik.Models;

public class LoginResponse
{
    public UserModel User { get; set; } = null!;
    public TokenModel Token { get; set; } = null!;
}
