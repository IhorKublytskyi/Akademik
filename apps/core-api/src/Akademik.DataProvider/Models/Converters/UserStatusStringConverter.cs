using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Akademik.DataProvider.Models.Converters;

public sealed class UserStatusStringConverter : ValueConverter<UserStatus, string>
{
	public UserStatusStringConverter() : base(e => e.ToString(), s => (UserStatus)Enum.Parse(typeof(UserStatus), s, true)){}
}