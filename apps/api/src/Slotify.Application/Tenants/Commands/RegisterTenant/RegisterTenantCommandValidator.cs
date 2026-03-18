using FluentValidation;

namespace Slotify.Application.Tenants.Commands.RegisterTenant;

public sealed class RegisterTenantCommandValidator : AbstractValidator<RegisterTenantCommand>
{
    public RegisterTenantCommandValidator()
    {
        RuleFor(x => x.BusinessName).NotEmpty().MaximumLength(200);

        RuleFor(x => x.Slug)
            .NotEmpty()
            .Matches(@"^[a-z0-9][a-z0-9-]{2,48}[a-z0-9]$")
            .WithMessage("Slug must be 4-50 lowercase alphanumeric characters or hyphens.");

        RuleFor(x => x.OwnerEmail).NotEmpty().EmailAddress();

        RuleFor(x => x.OwnerPassword)
            .NotEmpty()
            .MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain at least one digit.")
            .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character.");

        RuleFor(x => x.OwnerFullName).NotEmpty().MaximumLength(200);
    }
}
