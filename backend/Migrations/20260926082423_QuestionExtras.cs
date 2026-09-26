using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class QuestionExtras : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AllowPublish",
                table: "Questions",
                type: "boolean",
                nullable: false,
                // Every question asked before this choice existed counts as consented.
                defaultValue: true);

            migrationBuilder.AddColumn<int>(
                name: "DirectedToId",
                table: "Questions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsAnonymous",
                table: "Questions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Questions_DirectedToId",
                table: "Questions",
                column: "DirectedToId");

            migrationBuilder.AddForeignKey(
                name: "FK_Questions_Users_DirectedToId",
                table: "Questions",
                column: "DirectedToId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Questions_Users_DirectedToId",
                table: "Questions");

            migrationBuilder.DropIndex(
                name: "IX_Questions_DirectedToId",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "AllowPublish",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "DirectedToId",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "IsAnonymous",
                table: "Questions");
        }
    }
}
