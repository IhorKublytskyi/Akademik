using Akademik.Models;
using FluentValidation;

namespace Akademik.Validators;

public class CreateAssignmentRequestValidator : AbstractValidator<CreateAssignmentRequest>
{
    public CreateAssignmentRequestValidator()
    {
        RuleFor(x => x.UserId).GreaterThan(0);
        RuleFor(x => x.RoomId).GreaterThan(0);
        RuleFor(x => x.StartDate).NotEmpty();
    }
}
