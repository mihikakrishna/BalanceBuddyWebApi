using BalanceBuddyWebApi.Services.Plaid;
using Microsoft.AspNetCore.Mvc;

namespace BalanceBuddyWebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlaidController : ControllerBase
{
    private readonly IPlaidLinkService _plaidLinkService;

    public PlaidController(IPlaidLinkService plaidLinkService)
    {
        _plaidLinkService = plaidLinkService;
    }

    [HttpPost("link-token")]
    public async Task<ActionResult<PlaidLinkTokenResponse>> CreateLinkToken([FromBody] CreatePlaidLinkTokenRequest? request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = string.IsNullOrWhiteSpace(request?.UserId)
                ? HttpContext.TraceIdentifier
                : request.UserId!;

            var result = await _plaidLinkService.CreateLinkTokenAsync(new PlaidCreateLinkTokenCommand(userId), cancellationToken);
            return Ok(new PlaidLinkTokenResponse(result.LinkToken, result.Expiration, result.RequestId));
        }
        catch (PlaidConfigurationException ex)
        {
            return Problem(title: "Plaid is not configured.", detail: ex.Message, statusCode: StatusCodes.Status503ServiceUnavailable);
        }
        catch (PlaidApiException ex)
        {
            return BuildProblem("Plaid request failed.", ex.Message, ex.StatusCode, ex.RequestId);
        }
    }

    [HttpPost("exchange-public-token")]
    public async Task<ActionResult<PlaidExchangePublicTokenResponse>> ExchangePublicToken([FromBody] ExchangePlaidPublicTokenRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.PublicToken))
            return BadRequest("publicToken is required.");

        try
        {
            var result = await _plaidLinkService.ExchangePublicTokenAsync(new PlaidExchangePublicTokenCommand(request.PublicToken), cancellationToken);
            return Ok(new PlaidExchangePublicTokenResponse(result.AccessToken, result.ItemId, result.RequestId));
        }
        catch (PlaidConfigurationException ex)
        {
            return Problem(title: "Plaid is not configured.", detail: ex.Message, statusCode: StatusCodes.Status503ServiceUnavailable);
        }
        catch (PlaidApiException ex)
        {
            return BuildProblem("Plaid request failed.", ex.Message, ex.StatusCode, ex.RequestId);
        }
        catch (PlaidCredentialPersistenceException ex)
        {
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                new PlaidExchangePersistenceFailureResponse(
                    "Plaid exchange succeeded but local persistence failed.",
                    StatusCodes.Status503ServiceUnavailable,
                    ex.Message,
                    ex.AccessToken,
                    ex.ItemId,
                    ex.RequestId));
        }
    }

    private ObjectResult BuildProblem(string title, string detail, int statusCode, string? requestId)
    {
        var problem = new ProblemDetails
        {
            Title = title,
            Detail = detail,
            Status = statusCode
        };

        if (!string.IsNullOrWhiteSpace(requestId))
        {
            problem.Extensions["requestId"] = requestId;
        }

        return StatusCode(statusCode, problem);
    }

    public sealed record CreatePlaidLinkTokenRequest(string? UserId);
    public sealed record PlaidLinkTokenResponse(string LinkToken, DateTimeOffset Expiration, string RequestId);
    public sealed record ExchangePlaidPublicTokenRequest(string PublicToken);
    public sealed record PlaidExchangePublicTokenResponse(string AccessToken, string ItemId, string RequestId);
    public sealed record PlaidExchangePersistenceFailureResponse(
        string Title,
        int Status,
        string Detail,
        string AccessToken,
        string ItemId,
        string RequestId);
}
