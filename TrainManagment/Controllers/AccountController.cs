using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TrainManagment.Entities;
using TrainManagment.Models;
using TrainManagment.Services;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace TrainManagment.Controllers;

[Route("[controller]/[action]")]
[ApiController]
public class AccountController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly TokenService _tokenService;

    public AccountController(
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        TokenService tokenService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] AccountCreateModel model)
    {
        if (ModelState.IsValid)
        {
            var newUser = new AppUser { UserName = model.Email, Email = model.Email };
            var result = await _userManager.CreateAsync(newUser, model.Password);

            if (result.Succeeded)
            {
                var user = await _userManager.FindByEmailAsync(model.Email);
                var token = _tokenService.CreateToken(user);
                
                return Ok(new AuthResponseModel { Token = token });
            }
            else
            {
                return BadRequest(result.Errors);
            }
        }
        else
        {
            return BadRequest(ModelState);
        }
    }
    
    [HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        if (ModelState.IsValid)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }
            
            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            
            if (result.Succeeded)
            {
                var token = _tokenService.CreateToken(user);
                return Ok(new AuthResponseModel { Token = token });
            }
            
            return Unauthorized(new { message = "Invalid email or password" });
        }
        
        return BadRequest(ModelState);
    }
    
}