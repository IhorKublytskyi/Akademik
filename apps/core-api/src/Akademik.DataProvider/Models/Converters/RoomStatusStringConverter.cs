using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Akademik.DataProvider.Models.Converters;

public class RoomStatusStringConverter : ValueConverter<RoomStatus, string>
{
	public RoomStatusStringConverter() : base (e => e.ToString(), s => (RoomStatus)Enum.Parse(typeof(RoomStatus), s, true)){ }
}