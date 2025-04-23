using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TrainManagment.Data;
using TrainManagment.Entities;
using TrainManagment.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgresConnection")));

builder.Services.AddIdentity<AppUser, AppRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddScoped(typeof(IRepository<>), typeof(PostgresRepository<>));

builder.Services.AddControllers();

builder.Services.AddRazorPages();


builder.Services.AddAntiforgery();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    // app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();

app.UseAuthorization();


app.MapControllers();

app.Run();