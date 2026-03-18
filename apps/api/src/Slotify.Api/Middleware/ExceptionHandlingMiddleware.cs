using System.Text.Json;
using Slotify.Application.Common.Exceptions;

namespace Slotify.Api.Middleware;

public sealed class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, response) = exception switch
        {
            NotFoundException e => (StatusCodes.Status404NotFound, new ErrorResponse("NOT_FOUND", e.Message)),
            ValidationException e => (StatusCodes.Status400BadRequest, new ErrorResponse("VALIDATION_ERROR", "Validation failed", e.Errors)),
            ConflictException e => (StatusCodes.Status409Conflict, new ErrorResponse("CONFLICT", e.Message)),
            UnauthorizedException e => (StatusCodes.Status401Unauthorized, new ErrorResponse("UNAUTHORIZED", e.Message)),
            PlanLimitExceededException e => (StatusCodes.Status402PaymentRequired, new ErrorResponse("PLAN_LIMIT_EXCEEDED", e.Message)),
            InvalidOperationException e => (StatusCodes.Status422UnprocessableEntity, new ErrorResponse("BUSINESS_RULE_VIOLATION", e.Message)),
            _ => (StatusCodes.Status500InternalServerError, new ErrorResponse("INTERNAL_ERROR", "An unexpected error occurred."))
        };

        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsync(JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        }));
    }
}

public sealed record ErrorResponse(
    string Code,
    string Message,
    IDictionary<string, string[]>? Errors = null
);
