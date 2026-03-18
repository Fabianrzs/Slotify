namespace Slotify.Domain.Common;

public interface IHasTenantId
{
    Guid TenantId { get; }
}
