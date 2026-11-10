using Akademik.DataProvider.Models;
using FluentValidation;

namespace Akademik.Validators;

public class PaginationValidator : AbstractValidator<Pagination>
{
	public PaginationValidator()
	{
		RuleFor(p => p.Page)
			.GreaterThan(0)
			.WithMessage("Page must be greater than 0");

		RuleFor(p => p.PageSize)
			.GreaterThan(0)
			.WithMessage("PageSize must be greater than 0")
			.LessThan(50)
			.WithMessage("PageSize must be less than 50");
	}
}