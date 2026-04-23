import { api } from "@/shared/api/api-client"
import { UpdateUserRequest, UsersListResponse } from "@/shared/types/user"

export interface PaginationParams {
    pageNumber: number
    pageSize: number
}

export const getUsersList = async (pageNumber = 1, pageSize = 10): Promise<UsersListResponse> => {
    const response = await api.post("/api/core/users-get", {
        pagination: {
            pageNumber,
            pageSize
        }
    })
    return response.data
}

export const updateUser = async (data: UpdateUserRequest) => {
    const response = await api.post("/api/core/users-edit", data)
    return response.data
}