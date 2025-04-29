using System.ComponentModel.DataAnnotations;

namespace TrainManagment.Models;

public class AccountCreateModel
{
    [Required]
    [EmailAddress]
    public string Email { get; set; }
    
    [Required]
    [DataType(DataType.Password)]
    public string Password { get; set; }
}