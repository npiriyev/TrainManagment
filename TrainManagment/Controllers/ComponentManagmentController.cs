using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainManagment.Entities;
using TrainManagment.Models;
using TrainManagment.Repositories;

namespace TrainManagment.Controllers;

// Fix 1: Simplify the routing - either use separate routes or pattern matching
[ApiController]
[Route("[controller]")]
[Authorize] // Apply authorization to all endpoints by default
public class ComponentManagmentController : ControllerBase
{
    private readonly IRepository<TrainComponent> _repository;
    private readonly ILogger<ComponentManagmentController> _logger;
    
    public ComponentManagmentController(
        IRepository<TrainComponent> repository,
        ILogger<ComponentManagmentController> logger)
    {
        _repository = repository;
        _logger = logger;
    }
    
    // Fix 2: Use specific HTTP verb and route
    [HttpPost("CreateComponent")]
    public async Task<IActionResult> CreateComponent([FromBody] CreateComponentModel item)
    {
        _logger.LogInformation("CreateComponent called with model: {@Model}", item);
        
        try
        {
            TrainComponent resultEntity;
            var dbItem = await _repository.GetAsync(x => x.UniqueNumber == item.UniqueNumber);
        
            if (dbItem == null)
            {
                // Create new entity
                var newEntity = new TrainComponent()
                {
                    Id = item.Id,
                    UniqueNumber = item.UniqueNumber,
                    Name = item.Name,
                    CanAssign = item.CanAssign
                };
                await _repository.AddAsync(newEntity);
                resultEntity = newEntity;
            }
            else
            {
                // Update existing entity
                dbItem.CanAssign = item.CanAssign;
                dbItem.Name = item.Name;
                dbItem.UniqueNumber = item.UniqueNumber;
                await _repository.UpdateAsync(dbItem);
                resultEntity = dbItem;
            }
    
            await _repository.SaveChangesAsync();
        
            // Return the created/updated entity
            return Ok(new {
                id = resultEntity.Id,
                uniqueNumber = resultEntity.UniqueNumber,
                name = resultEntity.Name,
                canAssign = resultEntity.CanAssign
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in CreateComponent");
            return StatusCode(500, new { message = "An error occurred creating component" });
        }
    }
    
    // Fix 3: Use proper HTTP GET attribute and explicit route
    [HttpGet("GetAll")]
    [AllowAnonymous] // Test with this first, then change back to [Authorize]
    public async Task<ActionResult<IEnumerable<TrainComponent>>> GetAll()
    {
        _logger.LogInformation("GetAll called");
        
        try {
            var components = await _repository.GetAllAsync();
            return Ok(components);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetAll");
            return StatusCode(500, new { message = "An error occurred retrieving components" });
        }
    }
    
    // Fix 4: Use proper HTTP POST attribute and explicit route
    [HttpPost("UpdateComponent")]
    public async Task<ActionResult<TrainComponent>> UpdateComponent([FromBody] UpdateComponentModel item)
    {
        _logger.LogInformation("UpdateComponent called with model: {@Model}", item);
        
        try
        {
            var dbItem = await _repository.GetAsync(x => x.UniqueNumber == item.UniqueNumber);
            if (dbItem != null)
            {
                dbItem.Quantity = item.Quantity;
                await _repository.UpdateAsync(dbItem);
                await _repository.SaveChangesAsync();
                return Ok(dbItem);
            }
            else
            {
                return NotFound(new { message = "Component not found" });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in UpdateComponent");
            return StatusCode(500, new { message = "An error occurred updating component" });
        }
    }
    
    // Fix 5: Add a test endpoint that doesn't return data
    [HttpGet("Ping")]
    [AllowAnonymous]
    public IActionResult Ping()
    {
        return Ok(new { message = "Controller is working", time = DateTime.UtcNow });
    }
}