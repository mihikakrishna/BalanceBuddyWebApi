using BalanceBuddyWebApi.Services.Plaid;
using Xunit;

namespace BalanceBuddy.UnitTests;

public class PlaidItemCredentialStoreTests
{
    [Fact]
    public async Task SaveAsync_PersistsCredentialAcrossFreshContexts()
    {
        using var scope = new TestDatabaseScope();
        var service = scope.CreateServiceWithNewDatabase();

        await using (var saveContext = service.CreateDbContext())
        {
            var sut = new DbPlaidItemCredentialStore(saveContext);

            await sut.SaveAsync(new BalanceBuddyWebApi.Models.PlaidItemCredential
            {
                ItemId = "item-123",
                AccessToken = "access-token-123",
                StoredAtUtc = new DateTime(2026, 5, 17, 12, 0, 0, DateTimeKind.Utc)
            }, CancellationToken.None);
        }

        var reopenedService = new BalanceBuddyWebApi.Services.DatabaseService();
        reopenedService.OpenExisting(scope.DatabasePath);

        await using (var readContext = reopenedService.CreateDbContext())
        {
            var sut = new DbPlaidItemCredentialStore(readContext);

            var credential = await sut.GetByItemIdAsync("item-123", CancellationToken.None);

            Assert.NotNull(credential);
            Assert.Equal("item-123", credential!.ItemId);
            Assert.Equal("access-token-123", credential.AccessToken);
            Assert.Equal(new DateTime(2026, 5, 17, 12, 0, 0, DateTimeKind.Utc), credential.StoredAtUtc);
        }
    }
}
