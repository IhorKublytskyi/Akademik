namespace Akademik.DataProvider.Models;

public sealed record PagedResult<T>
{
	public required IEnumerable<T> Items { get; set; }	
	public required int Count { get; set; }
}