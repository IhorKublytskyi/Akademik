using Akademik.DataProvider.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace Akademik.DataProvider;

public static class DbInitializer
{
    public static async Task InitializeAsync(AkademikDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (!await context.Users.AnyAsync())
        {
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
            await context.SaveChangesAsync();
        }

        if (!await context.Rooms.AnyAsync())
        {
            var rooms = new List<Room>
            {
                new Room { Number = "101", Floor = 1, Capacity = 2, Status = RoomStatus.Available },
                new Room { Number = "102", Floor = 1, Capacity = 3, Status = RoomStatus.Available },
                new Room { Number = "103", Floor = 1, Capacity = 2, Status = RoomStatus.Available },
                new Room { Number = "104", Floor = 1, Capacity = 4, Status = RoomStatus.Closed },
                new Room { Number = "105", Floor = 1, Capacity = 2, Status = RoomStatus.Available },
                new Room { Number = "106", Floor = 1, Capacity = 3, Status = RoomStatus.Available },
                new Room { Number = "107", Floor = 1, Capacity = 2, Status = RoomStatus.Available },
                new Room { Number = "108", Floor = 1, Capacity = 4, Status = RoomStatus.Available },
                new Room { Number = "109", Floor = 1, Capacity = 2, Status = RoomStatus.Closed },
                new Room { Number = "110", Floor = 1, Capacity = 3, Status = RoomStatus.Available },

                new Room { Number = "201", Floor = 2, Capacity = 2, Status = RoomStatus.Available },
                new Room { Number = "202", Floor = 2, Capacity = 4, Status = RoomStatus.Available },
                new Room { Number = "203", Floor = 2, Capacity = 2, Status = RoomStatus.Closed },
                new Room { Number = "204", Floor = 2, Capacity = 3, Status = RoomStatus.Available },
                new Room { Number = "205", Floor = 2, Capacity = 2, Status = RoomStatus.Available },
                new Room { Number = "206", Floor = 2, Capacity = 4, Status = RoomStatus.Available },
                new Room { Number = "207", Floor = 2, Capacity = 2, Status = RoomStatus.Available },
                new Room { Number = "208", Floor = 2, Capacity = 3, Status = RoomStatus.Available },
                new Room { Number = "209", Floor = 2, Capacity = 2, Status = RoomStatus.Available },
                new Room { Number = "210", Floor = 2, Capacity = 4, Status = RoomStatus.Available },

                new Room { Number = "301", Floor = 3, Capacity = 2, Status = RoomStatus.Available },
                new Room { Number = "302", Floor = 3, Capacity = 3, Status = RoomStatus.Available },
                new Room { Number = "303", Floor = 3, Capacity = 2, Status = RoomStatus.Available },
                new Room { Number = "304", Floor = 3, Capacity = 4, Status = RoomStatus.Available },
                new Room { Number = "305", Floor = 3, Capacity = 2, Status = RoomStatus.Closed },
                new Room { Number = "306", Floor = 3, Capacity = 3, Status = RoomStatus.Available },
                new Room { Number = "307", Floor = 3, Capacity = 2, Status = RoomStatus.Available },
                new Room { Number = "308", Floor = 3, Capacity = 4, Status = RoomStatus.Closed },
                new Room { Number = "309", Floor = 3, Capacity = 2, Status = RoomStatus.Available },
                new Room { Number = "310", Floor = 3, Capacity = 3, Status = RoomStatus.Available },

                new Room { Number = "401", Floor = 4, Capacity = 2, Status = RoomStatus.Closed },
                new Room { Number = "402", Floor = 4, Capacity = 4, Status = RoomStatus.Available },
                new Room { Number = "403", Floor = 4, Capacity = 2, Status = RoomStatus.Available },
                new Room { Number = "404", Floor = 4, Capacity = 3, Status = RoomStatus.Available },
                new Room { Number = "405", Floor = 4, Capacity = 2, Status = RoomStatus.Available },
                new Room { Number = "406", Floor = 4, Capacity = 4, Status = RoomStatus.Available },
                new Room { Number = "407", Floor = 4, Capacity = 2, Status = RoomStatus.Available },
                new Room { Number = "408", Floor = 4, Capacity = 3, Status = RoomStatus.Available },
                new Room { Number = "409", Floor = 4, Capacity = 2, Status = RoomStatus.Available },
                new Room { Number = "410", Floor = 4, Capacity = 4, Status = RoomStatus.Available },

                new Room { Number = "501", Floor = 5, Capacity = 2, Status = RoomStatus.Available },
                new Room { Number = "502", Floor = 5, Capacity = 3, Status = RoomStatus.Available },
                new Room { Number = "503", Floor = 5, Capacity = 2, Status = RoomStatus.Available },
                new Room { Number = "504", Floor = 5, Capacity = 4, Status = RoomStatus.Available },
                new Room { Number = "505", Floor = 5, Capacity = 2, Status = RoomStatus.Available },
                new Room { Number = "506", Floor = 5, Capacity = 3, Status = RoomStatus.Available },
                new Room { Number = "507", Floor = 5, Capacity = 2, Status = RoomStatus.Closed },
                new Room { Number = "508", Floor = 5, Capacity = 4, Status = RoomStatus.Available },
                new Room { Number = "509", Floor = 5, Capacity = 2, Status = RoomStatus.Available },
                new Room { Number = "510", Floor = 5, Capacity = 3, Status = RoomStatus.Available }
            };

            await context.Rooms.AddRangeAsync(rooms);
            await context.SaveChangesAsync();
        }
    }
}