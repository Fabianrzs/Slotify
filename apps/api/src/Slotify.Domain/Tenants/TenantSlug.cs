using System.Text.RegularExpressions;
using Slotify.Domain.Common;

namespace Slotify.Domain.Tenants;

public sealed class TenantSlug : ValueObject
{
    public string Value { get; }

    private static readonly Regex SlugRegex = new(@"^[a-z0-9][a-z0-9-]{2,48}[a-z0-9]$", RegexOptions.Compiled);

    private TenantSlug(string value) => Value = value;

    public static TenantSlug Create(string value)
    {
        var normalized = value.ToLowerInvariant().Trim();
        if (!SlugRegex.IsMatch(normalized))
            throw new ArgumentException($"Invalid slug: '{value}'. Must be 4-50 lowercase alphanumeric characters or hyphens.");

        return new TenantSlug(normalized);
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}
