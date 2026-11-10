using Akademik.DataProvider.Configurations;
using Akademik.DataProvider.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Akademik.DataProvider;

public sealed class AkademikDbContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<Room> Rooms { get; set; }
    public DbSet<Assignment> Assignments { get; set; }

    public AkademikDbContext(DbContextOptions<AkademikDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new RoomConfiguration());
        modelBuilder.ApplyConfiguration(new AssignmentConfiguration());
        modelBuilder.ApplyConfiguration(new RefreshTokenConfiguration());
    }
}

public class DbConextDesignTimeFactory : IDesignTimeDbContextFactory<AkademikDbContext>
{
    public AkademikDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AkademikDbContext>();

        // Used by `dotnet ef`. `migrations add` needs no connection; `database update` needs the
        // real one, passed via the same variable Docker uses (no password is committed here).
        string connectionString =
            Environment.GetEnvironmentVariable("ConnectionStrings__AkademikConnectionString")
            ?? "Host=localhost;Port=5432;Database=Akademik;Username=postgres";

        optionsBuilder.UseNpgsql(connectionString);

        return new AkademikDbContext(optionsBuilder.Options);
    }
}
