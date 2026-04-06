using Akademik.DataProvider.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Akademik.DataProvider.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(u => u.Id);


        builder
            .Property(u => u.FirstName)
            .HasMaxLength(50)
            .IsRequired();

        builder
            .Property(u => u.LastName)
            .HasMaxLength(50)
            .IsRequired();

        builder
            .Property(u => u.Email)
            .HasMaxLength(100)
            .IsRequired();

        builder
            .Property(u => u.PasswordHash)
            .HasMaxLength(255)
            .IsRequired();

        builder
            .Property(u => u.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP")
            .IsRequired();

        builder
            .Property(u => u.PhoneNumber)
            .HasMaxLength(20)
            .IsRequired(false);

        builder
            .Property(u => u.Status)
            .HasConversion<UserStatusStringConverter>()
            .HasMaxLength(20)
            .IsRequired();

        builder
            .Property(u => u.Role)
            .HasConversion<UserRoleStringConverter>()
            .HasMaxLength(20)
            .IsRequired();

        builder
            .HasIndex(u => u.Email)
            .HasDatabaseName("Index_Email_Unique")
            .IsUnique();

        builder
            .HasIndex(u => new { u.FirstName, u.LastName })
            .HasDatabaseName("Index_Fullname");

        builder
            .HasIndex(u => u.Status)
            .HasFilter("\"Status\" = 'Active'")
            .HasDatabaseName("Index_ActiveOnly");
    }   
}
