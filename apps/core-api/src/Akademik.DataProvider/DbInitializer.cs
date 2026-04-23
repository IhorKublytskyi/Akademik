using Akademik.DataProvider.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace Akademik.DataProvider;

public static class DbInitializer
{
    public static async Task InitializeAsync(AkademikDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (await context.Users.AnyAsync())
        {
            return; // DB has been seeded
        }

        var admin = new User
        {
            FirstName = "Admin",
            LastName = "System",
            Email = "admin@akademik.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Role = UserRole.Admin,
            Status = UserStatus.Active,
            PhoneNumber = "+70000000000",
            CreatedAt = DateTime.UtcNow
        };

        var student = new User
        {
            FirstName = "Ivan",
            LastName = "Ivanov",
            Email = "ivan@student.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"),
            Role = UserRole.Resident,
            Status = UserStatus.Active,
            PhoneNumber = "+79998887766",
            CreatedAt = DateTime.UtcNow
        };

        await context.Users.AddRangeAsync(admin, student);

        var rooms = new List<Room>
        {
            new Room { Number = "101", Floor = 1, Capacity = 2, Status = RoomStatus.Available },
            new Room { Number = "102", Floor = 1, Capacity = 3, Status = RoomStatus.Available },
            new Room { Number = "201", Floor = 2, Capacity = 2, Status = RoomStatus.Available },
            new Room { Number = "202", Floor = 2, Capacity = 4, Status = RoomStatus.Occupied }
        };

        await context.Rooms.AddRangeAsync(rooms);
        await context.SaveChangesAsync();
    }
}
