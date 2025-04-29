namespace TrainManagment.Models;

public class CreateComponentModel
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string UniqueNumber { get; set; }
    public bool CanAssign { get; set; }
}