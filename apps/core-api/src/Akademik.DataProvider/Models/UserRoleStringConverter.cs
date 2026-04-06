using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Akademik.DataProvider.Models;

public sealed class UserRoleStringConverter : ValueConverter<UserRole, string>
{
    public UserRoleStringConverter() : base(e => nameof(e), s => (UserRole)Enum.Parse(typeof(UserRole), s, true)){}
}

public sealed class UserStatusStringConverter : ValueConverter<UserStatus, string>
{
    public UserStatusStringConverter() : base(e => nameof(e), s => (UserStatus)Enum.Parse(typeof(UserStatus), s, true)){}
}
