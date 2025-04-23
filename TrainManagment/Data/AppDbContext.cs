using Microsoft.EntityFrameworkCore;

namespace TrainManagment.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }
    
}