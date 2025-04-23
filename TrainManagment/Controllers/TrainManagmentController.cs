using Microsoft.AspNetCore.Mvc;

namespace TrainManagment.Controllers;

[Route("[controller]/[action]")]
[ApiController]
public class TrainManagmentController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok();
    }
    
}