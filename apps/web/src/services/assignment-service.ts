import { api } from "@/shared/api/api-client"
import { Assignment, CreateAssignmentRequest, PagedResult } from "@/shared/types/assignment"
import { User } from "@/shared/types/user"

export const getAssignmentsList = async (pageNumber = 1, pageSize = 10): Promise<PagedResult<Assignment>> => {
    const response = await api.post<PagedResult<Assignment>>("/api/core/assignments-get", {
        pagination: {
            pageNumber,
            pageSize
        }
    })

    return response.data
}

export const createAssignment = async (data: CreateAssignmentRequest): Promise<Assignment> => {
    const payload = {
        ...data,
        startDate: data.startDate instanceof Date
            ? data.startDate.toISOString()
            : data.startDate
    }

    const response = await api.post<Assignment>("/api/core/assignments-add", payload)

    return response.data
}

export const getRoommates = async (): Promise<User[]> => {
    const response = await api.get<User[]>("/api/core/assignments/roommates")
    return response.data
}