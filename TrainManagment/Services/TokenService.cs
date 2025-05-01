using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TrainManagment.Entities;

namespace TrainManagment.Services;

public class TokenService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<TokenService> _logger;

    public TokenService(IConfiguration configuration, ILogger<TokenService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public string CreateToken(AppUser user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]);
        
        
        var claims = new List<Claim>
        {
            // Standard JWT claims
            new Claim("email", user.Email), 
            new Claim("unique_name", user.UserName), 
            
         
        };

        _logger.LogInformation("Creating token for user {UserId} with claims: {@Claims}", 
            user.Id, claims.Select(c => new { c.Type, c.Value }));

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtSettings["ExpiryInMinutes"])),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key), 
                SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);
      
        var jwtToken = new JwtSecurityToken(tokenString);
        _logger.LogInformation("Token created with expiry: {Expiry}", jwtToken.ValidTo);
        
        return tokenString;
    }
}