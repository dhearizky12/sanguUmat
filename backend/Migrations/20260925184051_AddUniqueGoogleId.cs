using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueGoogleId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Databases created before this index can already hold duplicate Google ids
            // (a sign-in race created a second row). Keep the oldest row for each id and
            // retire the later ones by suffixing their id, so no data is lost and the
            // unique index can be built. Retired rows can no longer be signed into.
            migrationBuilder.Sql("""
                UPDATE "Users" AS u
                SET "GoogleId" = u."GoogleId" || '-duplicate-' || u."Id"
                WHERE EXISTS (
                    SELECT 1 FROM "Users" AS older
                    WHERE older."GoogleId" = u."GoogleId" AND older."Id" < u."Id"
                );
                """);

            migrationBuilder.CreateIndex(
                name: "IX_Users_GoogleId",
                table: "Users",
                column: "GoogleId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_GoogleId",
                table: "Users");
        }
    }
}
