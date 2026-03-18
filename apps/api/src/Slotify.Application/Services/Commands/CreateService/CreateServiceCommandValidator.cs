using FluentValidation;

namespace Slotify.Application.Services.Commands.CreateService;

public sealed class CreateServiceCommandValidator : AbstractValidator<CreateServiceCommand>
{
    public CreateServiceCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DurationMinutes).GreaterThan(0).LessThanOrEqualTo(480);
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Currency).NotEmpty().Length(3);
        RuleFor(x => x.MaxCapacity).GreaterThan(0).LessThanOrEqualTo(500);
        RuleFor(x => x.Description).MaximumLength(1000).When(x => x.Description is not null);
    }
}
