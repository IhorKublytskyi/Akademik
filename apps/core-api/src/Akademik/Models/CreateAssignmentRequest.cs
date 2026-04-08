namespace Akademik.Models;

public record CreateAssignmentRequest(int UserId, int RoomId, DateTime StartDate);