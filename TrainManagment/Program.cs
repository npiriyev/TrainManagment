using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using TrainManagment.Data;
using TrainManagment.Entities;
using TrainManagment.Repositories;
using TrainManagment.Services;

var builder = WebApplication.CreateBuilder(args);

// Add logging first
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Configure services
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]);

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", builder =>
    {
        builder.WithOrigins("http://localhost:4200",
                "https://localhost:4200",
                "https://localhost:7233",
                "http://localhost:5080",
                "http://localhost:8080")  
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});


builder.Services.AddScoped<TokenService>();


builder.Services.AddIdentity<AppUser, AppRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();


builder.Services.ConfigureApplicationCookie(options =>
{
    // Completely disable cookie authentication redirects
    options.Cookie.Name = ".TrainManagement";
    options.LoginPath = null;
    options.LogoutPath = null;
    options.AccessDeniedPath = null;
    
    // Return 401/403 instead of redirects
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
});

// Configure JWT authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme; // Make JWT the default
}).AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero,
        NameClaimType = "nameid", 
       
    };

    options.Events = new JwtBearerEvents
    {
        OnChallenge = context =>
        {
    
            context.HttpContext.RequestServices
                .GetRequiredService<ILogger<Program>>()
                .LogWarning("JWT authentication challenge for {Method} {Path}",
                    context.Request.Method, context.Request.Path);
            
            // Add a header for debug purposes
            context.Response.Headers.Append("X-Auth-Required", "true");
            
      
            return Task.CompletedTask;
        },
        
        OnAuthenticationFailed = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogError(context.Exception, 
                "JWT Authentication failed: {ExceptionType}, {Message}",
                context.Exception.GetType().Name, context.Exception.Message);
            
            return Task.CompletedTask;
        },
        
        OnTokenValidated = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            var userId = context.Principal?.FindFirst("nameid")?.Value;
            var email = context.Principal?.FindFirst("email")?.Value;
            
            logger.LogInformation(
                "JWT Token validated for user: {Email} ({UserId})", 
                email, userId);
            
    
            var claims = context.Principal?.Claims.Select(c => new { c.Type, c.Value }).ToList();
            logger.LogDebug("JWT Claims: {@Claims}", claims);
            
            return Task.CompletedTask;
        },
        
  
        OnMessageReceived = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            var authHeader = context.Request.Headers["Authorization"].ToString();
            logger.LogDebug(
                "Auth header for {Method} {Path}: {HasHeader}", 
                context.Request.Method, 
                context.Request.Path,
                !string.IsNullOrEmpty(authHeader) ? "Present" : "Missing");
            
            return Task.CompletedTask;
        }
    };
});

// Add database context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgresConnection")));

// Add repositories
builder.Services.AddScoped(typeof(IRepository<>), typeof(PostgresRepository<>));

// Add controllers
builder.Services.AddControllers();

// Configure Swagger with JWT support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Train Management API",
        Version = "v1",
        Description = "API for managing train components"
    });
    
    // Define JWT security scheme
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    // Add JWT requirement
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Build app
var app = builder.Build();


app.UseRouting();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Train Management API v1");
        c.RoutePrefix = "swagger";
    });
    app.UseDeveloperExceptionPage();
    
    // Add detailed request logging
    app.Use(async (context, next) =>
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        logger.LogInformation(
            "Request: {Method} {Path}", 
            context.Request.Method, 
            context.Request.Path);
        
        // Check for Authorization header
        if (context.Request.Headers.ContainsKey("Authorization"))
        {
            var auth = context.Request.Headers["Authorization"].ToString();
            var truncated = auth.Length > 15 ? auth.Substring(0, 15) + "..." : auth;
            logger.LogDebug("Authorization header: {Header}", truncated);
        }
        
        // Process request
        await next();
        
        // Log response
        logger.LogInformation(
            "Response: {StatusCode} for {Method} {Path}", 
            context.Response.StatusCode,
            context.Request.Method,
            context.Request.Path);
    });
}


app.UseCors("AllowAngular");


app.UseAuthentication();
app.UseAuthorization();

// Map controllers
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        
        // This will create the database if it doesn't exist
        context.Database.EnsureCreated();
        
        // This will apply any pending migrations
        if (context.Database.GetPendingMigrations().Any())
        {
            context.Database.Migrate();
        }
        
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating or seeding the database.");
    }
}

// Run the app
app.Run();