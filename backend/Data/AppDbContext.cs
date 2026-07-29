using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    // IDataProtectionKeyContext lets the Data Protection stack keep its key ring in
    // Postgres. On Cloud Run the container is destroyed whenever the service scales
    // to zero, so filesystem-backed keys would be regenerated on every cold start
    // and every previously issued auth cookie would stop decrypting.
    public class AppDbContext : DbContext, IDataProtectionKeyContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {

        }

        public DbSet<User> Users {get; set;}
        public DbSet<Question>Questions {get;set;}

        public DbSet<Answer> Answers {get;set;}

        public DbSet<DataProtectionKey> DataProtectionKeys {get;set;}
    }
}
#pragma warning restore format