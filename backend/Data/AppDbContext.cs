using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {

        }

        public DbSet<User> Users {get; set;}
        public DbSet<Question>Questions {get;set;}

        public DbSet<Answer> Answers {get;set;}
        public DbSet<Comment> Comments {get;set;}
        public DbSet<Category> Categories {get;set;}
        public DbSet<UstadzProfile> UstadzProfiles {get;set;}
        public DbSet<UstadzExpertise> UstadzExpertise {get;set;}
        public DbSet<UstadzEducation> UstadzEducation {get;set;}

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Sign-in finds the account by Google id, so two rows with the same id would
            // make it ambiguous which account a person lands in.
            modelBuilder.Entity<User>()
                .HasIndex(x => x.GoogleId)
                .IsUnique();

            modelBuilder.Entity<Category>()
                .HasIndex(x => x.Key)
                .IsUnique();

            // Deleting a category leaves its questions uncategorised ("Lainnya").
            modelBuilder.Entity<Question>()
                .HasOne(x => x.Category)
                .WithMany(x => x.Questions)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<UstadzProfile>().HasKey(x => x.UserId);
            modelBuilder.Entity<UstadzProfile>()
                .HasOne(x => x.User)
                .WithOne()
                .HasForeignKey<UstadzProfile>(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Deleting a category drops it from every ustadz's expertise.
            modelBuilder.Entity<UstadzExpertise>().HasKey(x => new { x.UserId, x.CategoryId });
            modelBuilder.Entity<UstadzExpertise>()
                .HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<UstadzExpertise>()
                .HasOne(x => x.Category).WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UstadzEducation>()
                .HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<UstadzEducation>().HasIndex(x => new { x.UserId, x.SortOrder });
        }
    }
}
#pragma warning restore format