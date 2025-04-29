using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainManagment.Entities;
using TrainManagment.Models;
using TrainManagment.Repositories;

namespace TrainManagment.Controllers;

[Route("[controller]/[action]")]
[ApiController]
public class ComponentManagmentController : ControllerBase
{

    private readonly IRepository<TrainComponent> _repository;
    
    public ComponentManagmentController(IRepository<TrainComponent> repository)
    {
        _repository = repository;
    }
    
    
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> CreateComponentAsync([FromBody] CreateComponentModel item)
    {
       var dbItem = await _repository.GetAsync(x=>x.UniqueNumber == item.UniqueNumber);
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
       }
       else
       {
           dbItem.CanAssign = item.CanAssign;
           dbItem.Name = item.Name;
           dbItem.CanAssign = item.CanAssign;
           dbItem.UniqueNumber = item.UniqueNumber;
           await _repository.UpdateAsync(dbItem);
       }

       await _repository.SaveChangesAsync();
       return Ok();
    }
    
    [HttpGet]
    [Authorize]
    public async Task<IEnumerable<TrainComponent>> GetAllAsync()
    {
       return await _repository.GetAllAsync();
    }
    
    [HttpPost]
    [Authorize]
    public async Task<TrainComponent> UpdateComponentAsync([FromBody] UpdateComponentModel item)
    {
        var dbItem = await _repository.GetAsync(x => x.UniqueNumber == item.UniqueNumber);
        if (dbItem != null)
        {
            dbItem.Quantity=item.Quantity;
            await _repository.UpdateAsync(dbItem);
            await _repository.SaveChangesAsync();
        }
        else
        {
            BadRequest();
        }
        return dbItem;
    }
    
}