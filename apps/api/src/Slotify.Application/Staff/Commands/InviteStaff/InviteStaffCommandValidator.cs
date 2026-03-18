using FluentValidation;

namespace Slotify.Application.Staff.Commands.InviteStaff;

public sealed class InviteStaffCommandValidator : AbstractValidator<InviteStaffCommand>
{
    private static readonly string[] ValidRoles = ["Admin", "Staff"];

    public InviteStaffCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Role)
            .NotEmpty()
            .Must(r => ValidRoles.Contains(r))
            .WithMessage("Role must be 'Admin' or 'Staff'.");
    }
}
