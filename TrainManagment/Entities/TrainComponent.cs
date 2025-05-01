using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace TrainManagment.Entities;

public class TrainComponent
{
    public int Id { get; set; }
    public string Name { get; set; }
    [Key]
    public string UniqueNumber { get; set; }
    public bool CanAssign { get; set; }
    
    [Range(0, int.MaxValue)] 
    public int? Quantity { get; set; } = null;
    
}