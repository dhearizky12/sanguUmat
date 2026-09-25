using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class CategoriesAsData : Migration
    {
        // The design's twelve topics, in canvas order. The first five keep the keys the old
        // hard-coded list used, so stored data, links and ?category= filters stay valid.
        private static readonly (string Key, string Name)[] InitialCategories =
        {
            ("sholat", "Sholat"),
            ("puasa", "Puasa"),
            ("zakat", "Zakat"),
            ("thaharah", "Thaharah"),
            ("keluarga", "Keluarga & Pernikahan"),
            ("muamalah", "Keuangan & Muamalah"),
            ("makanan-minuman", "Makanan & Minuman"),
            ("haji-umrah", "Haji & Umrah"),
            ("akhlak", "Akhlak"),
            ("aqidah", "Aqidah"),
            ("jenazah", "Jenazah"),
            ("isu-kontemporer", "Isu Kontemporer"),
        };

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Order matters: seed and backfill before the old string column is dropped, or
            // every question would lose its category.
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Key = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Key",
                table: "Categories",
                column: "Key",
                unique: true);

            for (var i = 0; i < InitialCategories.Length; i++)
            {
                migrationBuilder.InsertData(
                    table: "Categories",
                    columns: new[] { "Key", "Name", "SortOrder", "CreatedAt" },
                    values: new object[] { InitialCategories[i].Key, InitialCategories[i].Name, i + 1, DateTime.UtcNow });
            }

            migrationBuilder.AddColumn<int>(
                name: "CategoryId",
                table: "Questions",
                type: "integer",
                nullable: true);

            // Unknown strings match nothing and stay NULL — what the old code showed as "Lainnya".
            migrationBuilder.Sql("""
                UPDATE "Questions" AS q
                SET "CategoryId" = c."Id"
                FROM "Categories" AS c
                WHERE c."Key" = q."Category";
                """);

            migrationBuilder.DropColumn(
                name: "Category",
                table: "Questions");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_CategoryId",
                table: "Questions",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Questions_Categories_CategoryId",
                table: "Questions",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Questions",
                type: "text",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE "Questions" AS q
                SET "Category" = c."Key"
                FROM "Categories" AS c
                WHERE c."Id" = q."CategoryId";
                """);

            migrationBuilder.DropForeignKey(
                name: "FK_Questions_Categories_CategoryId",
                table: "Questions");

            migrationBuilder.DropIndex(
                name: "IX_Questions_CategoryId",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Questions");

            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}
