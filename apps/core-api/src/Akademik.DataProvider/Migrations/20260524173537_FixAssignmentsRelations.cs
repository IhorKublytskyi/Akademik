using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Akademik.DataProvider.Migrations
{
    /// <inheritdoc />
    public partial class FixAssignmentsRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_assignments_RoomId",
                table: "assignments");

            migrationBuilder.DropIndex(
                name: "IX_assignments_UserId",
                table: "assignments");

            migrationBuilder.CreateIndex(
                name: "IX_assignments_RoomId",
                table: "assignments",
                column: "RoomId");

            migrationBuilder.CreateIndex(
                name: "IX_assignments_UserId",
                table: "assignments",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_assignments_RoomId",
                table: "assignments");

            migrationBuilder.DropIndex(
                name: "IX_assignments_UserId",
                table: "assignments");

            migrationBuilder.CreateIndex(
                name: "IX_assignments_RoomId",
                table: "assignments",
                column: "RoomId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_assignments_UserId",
                table: "assignments",
                column: "UserId",
                unique: true);
        }
    }
}
