using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Akademik.DataProvider.Models.Converters;

public sealed class UserRoleStringConverter : ValueConverter<UserRole, string>
{
    public UserRoleStringConverter() : base(e => e.ToString(), s => (UserRole)Enum.Parse(typeof(UserRole), s, true)){}
}