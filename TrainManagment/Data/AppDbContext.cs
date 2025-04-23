using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TrainManagment.Entities;

namespace TrainManagment.Data;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<TrainComponents> TrainComponents { get; set; }
    
}

// public class IdentityContext : IdentityDbContext<AppUser>
// {
//     public IdentityContext(DbContextOptions<IdentityContext> options)
//         : base(options)
//     {
//     }
// }