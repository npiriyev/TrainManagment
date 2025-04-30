using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainManagment.Entities;
using TrainManagment.Models;
using TrainManagment.Repositories;

namespace TrainManagment.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
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
                dbItem.CanAssign = item.CanAssign;
                dbItem.Name = item.Name;
                dbItem.UniqueNumber = item.UniqueNumber;
                await _repository.UpdateAsync(dbItem);
                resultEntity = dbItem;
            }
    
            await _repository.SaveChangesAsync();
            
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
    
    [HttpGet("GetAll")]
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
    
    [HttpPost("SearchByUniqueNumber")]
    public async Task<ActionResult<TrainComponent>> SearchByUniqueNumber([FromBody] string item)
    {
        
        try
        {
            var dbItem = await _repository.GetAsync(x => x.UniqueNumber == item);
            if (dbItem != null)
            {
                return Ok(dbItem);
            }
            else
            {
                return NotFound(new { message = "Component not found" });
            }
        }catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving data" });
        }
    }
    
    [HttpPost("SearchByName")]
    public async Task<ActionResult<IEnumerable<TrainComponent>>> SearchByName([FromBody] string item)
    {
        
        try
        {
            var dbItem = await _repository.GetAllAsync(x => x.Name.Contains(item));
            if (dbItem != null)
            {
                return Ok(dbItem);
            }
            else
            {
                return NotFound(new { message = "Component not found" });
            }
        }catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving data" });
        }
    }
    
    [HttpGet("GetPaged")]
    public async Task<ActionResult<PaginatedResponse<TrainComponent>>> GetPaged([FromQuery] PaginationParameters parameters)
    {
        _logger.LogInformation($"GetPaged called with PageNumber: {parameters.PageNumber}, PageSize: {parameters.PageSize}");
    
        try
        {
            // Get paged data from repository
            var (components, totalCount) = await _repository.GetPagedAsync(
                parameters.PageNumber, 
                parameters.PageSize,
                null,
                q => q.OrderBy(c => c.Id) 
            );
        
            
            var response = new PaginatedResponse<TrainComponent>(
                components.ToList(),
                totalCount,
                parameters.PageNumber,
                parameters.PageSize
            );
        
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetPaged");
            return StatusCode(500, new { message = "An error occurred retrieving components" });
        }
    }
    
    [HttpGet("Ping")]
    [AllowAnonymous]
    public IActionResult Ping()
    {
        return Ok(new { message = "Controller is working", time = DateTime.UtcNow });
    }
}