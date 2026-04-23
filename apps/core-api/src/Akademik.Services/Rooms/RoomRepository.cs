using Akademik.DataProvider;
using Akademik.DataProvider.Models;
using Microsoft.EntityFrameworkCore;

namespace Akademik.Services.Rooms;

public class RoomRepository : IRoomRepository
{
    private readonly AkademikDbContext _dbContext;

    public RoomRepository(AkademikDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async ValueTask<PagedResult<Room>> GetAllAsync(Pagination pagination, CancellationToken cancellationToken)
    {
        IQueryable<Room> query = _dbContext.Rooms.AsNoTracking();

        int count = await query.CountAsync(cancellationToken);

        List<Room> rooms = await query
            .Skip(pagination.Skip)
            .Take(pagination.PageSize)
            .Select(r => new Room
            {
                Id = r.Id,
                Capacity = r.Capacity,
                Floor = r.Floor,
                Number = r.Number,
                Status = r.Status,
            })
            .OrderBy(r => r.Number)
            .ToListAsync(cancellationToken);

        return new PagedResult<Room>()
        {
            Items = rooms,
            Count = count
        };
    }

    public async ValueTask<Room?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        return await _dbContext.Rooms
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async ValueTask CreateAsync(Room room, CancellationToken cancellationToken)
    {
        await _dbContext.Rooms.AddAsync(room, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async ValueTask UpdateAsync(Room room, CancellationToken cancellationToken)
    {
        _dbContext.Rooms.Update(room);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}