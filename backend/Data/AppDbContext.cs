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
    }
}
#pragma warning restore format