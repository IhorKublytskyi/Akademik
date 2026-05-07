export interface PaginationParams {
    pageNumber: number;
    pageSize: number;
}

export interface PagedResult<T> {
    items: T[];
    count: number;
}

export interface Assignment {
    id: number;
    userId: number;
    roomId: number;
    startDate: string;
    endDate?: string | null;
    isActive: boolean;
}

export interface CreateAssignmentRequest {
    userId: number;
    roomId: number;
    startDate: string | Date;
}