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

    public AkademikDbContext(DbContextOptions<AkademikDbContext> options) : base(options) {}

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
        
        optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=Akademik;Username=postgres;Password=arma03042003");

        return new AkademikDbContext(optionsBuilder.Options);
    }
}
