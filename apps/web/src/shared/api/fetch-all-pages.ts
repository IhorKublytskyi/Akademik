// core-api PaginationValidator rejects PageSize >= 50
export const MAX_PAGE_SIZE = 49

interface Page<T> {
    items: T[]
    count: number
}

export async function fetchAllPages<T>(
    fetchPage: (page: number, pageSize: number) => Promise<Page<T>>
): Promise<Page<T>> {
    const first = await fetchPage(1, MAX_PAGE_SIZE)
    const items = [...first.items]
    const totalPages = Math.ceil(first.count / MAX_PAGE_SIZE)

    for (let page = 2; page <= totalPages; page++) {
        const next = await fetchPage(page, MAX_PAGE_SIZE)
        if (next.items.length === 0) break
        items.push(...next.items)
    }

    return { items, count: first.count }
}
