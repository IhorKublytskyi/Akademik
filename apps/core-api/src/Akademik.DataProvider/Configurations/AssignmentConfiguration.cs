using Akademik.DataProvider.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Akademik.DataProvider.Configurations;

public class AssignmentConfiguration : IEntityTypeConfiguration<Assignment>
{
	public void Configure(EntityTypeBuilder<Assignment> builder)
	{
		builder.ToTable("assignments");

		builder.HasKey(a => a.Id);

		builder
			.HasOne(a => a.User)
			.WithOne(u => u.Assignment)
			.HasForeignKey<Assignment>(a => a.UserId)
			.OnDelete(DeleteBehavior.Cascade);
		
		builder
			.HasOne(a => a.Room)
			.WithOne(r => r.Assignment)
			.HasForeignKey<Assignment>(a => a.RoomId);
		
		builder
			.Property(a => a.StartDate)
			.IsRequired();
	}
}