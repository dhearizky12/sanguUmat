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
        public DbSet<Article> Articles {get;set;}
        public DbSet<Kajian> Kajian {get;set;}
        public DbSet<Notification> Notifications {get;set;}

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

            modelBuilder.Entity<Question>()
                .HasOne(x => x.DirectedTo)
                .WithMany()
                .HasForeignKey(x => x.DirectedToId)
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

            modelBuilder.Entity<Article>(e =>
            {
                e.Property(x => x.Title).HasMaxLength(160);
                e.Property(x => x.Summary).HasMaxLength(300);
                e.Property(x => x.Status).HasMaxLength(16);
                e.HasOne(x => x.Category).WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.SetNull);
                e.HasOne(x => x.Author).WithMany().HasForeignKey(x => x.AuthorId).OnDelete(DeleteBehavior.Cascade);
                e.HasIndex(x => new { x.Status, x.PublishedAt });
                e.HasIndex(x => x.AuthorId);
            });

            modelBuilder.Entity<Kajian>(e =>
            {
                e.Property(x => x.Title).HasMaxLength(160);
                e.Property(x => x.Description).HasMaxLength(1000);
                e.Property(x => x.Series).HasMaxLength(60);
                e.Property(x => x.YoutubeId).HasMaxLength(11);
                e.HasOne(x => x.Ustadz).WithMany().HasForeignKey(x => x.UstadzId).OnDelete(DeleteBehavior.Cascade);
                e.HasIndex(x => x.StartsAt);
                e.HasIndex(x => x.UstadzId);
                e.HasIndex(x => x.Series);
            });

            modelBuilder.Entity<Notification>(e =>
            {
                e.Property(x => x.Type).HasMaxLength(32);
                e.Property(x => x.Actor).HasMaxLength(200);
                e.Property(x => x.Text).HasMaxLength(300);
                e.Property(x => x.Link).HasMaxLength(300);
                e.HasOne(x => x.Recipient).WithMany().HasForeignKey(x => x.RecipientId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne(x => x.Question).WithMany().HasForeignKey(x => x.QuestionId).OnDelete(DeleteBehavior.SetNull);
                e.HasOne(x => x.Answer).WithMany().HasForeignKey(x => x.AnswerId).OnDelete(DeleteBehavior.SetNull);
                e.HasIndex(x => new { x.RecipientId, x.ReadAt });
                e.HasIndex(x => new { x.RecipientId, x.CreatedAt });
            });
        }
    }
}
#pragma warning restore format