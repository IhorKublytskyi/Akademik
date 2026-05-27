using Akademik.DataProvider.Models;

namespace Akademik.Services.Models;

public class AssignmentModel
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int RoomId { get; set; }
    
    // Примечание: если в вашей базе данных используется DateTime вместо DateOnly, 
    // поменяйте типы данных у StartDate и EndDate на DateTime
    public DateOnly StartDate { get; set; } 
    public DateOnly? EndDate { get; set; }
    
    public bool IsActive { get; set; }
    
    public UserModel User { get; set; } = null!;
    public RoomModel Room { get; set; } = null!;

    public static AssignmentModel FromAssignment(Assignment assignment)
    {
        return new AssignmentModel
        {
            Id = assignment.Id,
            UserId = assignment.UserId,
            RoomId = assignment.RoomId,
            StartDate = assignment.StartDate,
            EndDate = assignment.EndDate,
            IsActive = assignment.IsActive,
            User = UserModel.FromUser(assignment.User),
            Room = RoomModel.FromRoom(assignment.Room)
        };
    }
}