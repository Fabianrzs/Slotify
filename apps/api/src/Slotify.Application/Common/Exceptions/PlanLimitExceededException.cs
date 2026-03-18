namespace Slotify.Application.Common.Exceptions;

/// <summary>
/// Thrown when a tenant attempts to exceed a limit defined by their subscription plan.
/// Maps to HTTP 402 Payment Required.
/// </summary>
public sealed class PlanLimitExceededException(string message) : Exception(message);
