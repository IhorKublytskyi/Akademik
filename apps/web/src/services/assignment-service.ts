import { api } from "@/shared/api/api-client"
import { Assignment, CreateAssignmentRequest, RoommatesResponse } from "@/shared/types/assignment"

export const getAssignmentsList = async (pageNumber = 1, pageSize = 10): Promise<Assignment[]> => {
    const response = await api.post<Assignment[]>("/api/core/assignments-get", {
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

export const getRoommates = async (): Promise<RoommatesResponse> => {
    const response = await api.get<RoommatesResponse>("/api/core/assignments/roommates")
    return response.data
}

export const deleteAssignment = async (id: number): Promise<void> => {
    await api.delete(`/api/core/assignments/${id}`)
}