using System.Linq.Expressions;

namespace TrainManagment.Repositories;

public interface IRepository<T> where T:class
{
    Task<IEnumerable<T>> GetAllAsync<T>();
    Task<IEnumerable<T>> GetAllAsync(Expression<Func<T, bool>> predicate);
    Task<T> GetByIdAsync(int id);
    Task<T> GetAsync(Expression<Func<T, bool>> predicate);
    Task<T> AddAsync(T entity);
    Task<T> UpdateAsync(T entity);
    Task DeleteAsync(T entity);
}