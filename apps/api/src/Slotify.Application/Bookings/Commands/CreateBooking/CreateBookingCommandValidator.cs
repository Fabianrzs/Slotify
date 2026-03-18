using FluentValidation;

namespace Slotify.Application.Bookings.Commands.CreateBooking;

public sealed class CreateBookingCommandValidator : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingCommandValidator()
    {
        RuleFor(x => x.ServiceId)
            .NotEmpty().WithMessage("Service is required.");

        RuleFor(x => x.BranchId)
            .NotEmpty().WithMessage("Branch is required.");

        RuleFor(x => x.StartAt)
            .GreaterThan(DateTime.UtcNow).WithMessage("Booking must be in the future.")
            .Must(d => d.Minute % 15 == 0).WithMessage("Start time must be on a 15-minute boundary.");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notes cannot exceed 500 characters.")
            .When(x => x.Notes is not null);
    }
}
