using Akademik.DataProvider.Models;
using Akademik.DataProvider.Models.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Akademik.DataProvider.Configurations;

public class RoomConfiguration : IEntityTypeConfiguration<Room>
{
	public void Configure(EntityTypeBuilder<Room> builder)
	{
		builder.ToTable("rooms");

		builder.HasKey(r => r.Id);

		builder
			.Property(r => r.Number)
			.HasMaxLength(10)
			.IsRequired();

		builder
			.Property(r => r.Status)
			.HasConversion<RoomStatusStringConverter>()
			.HasMaxLength(20)
			.IsRequired();
	}
}