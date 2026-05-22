import { api } from "@/shared/api/api-client"
import { Complaint, CreateComplaintRequest, UpdateComplaintStatusRequest } from "@/shared/types/complaints"
import { User } from "@/shared/types/user"

export const getComplaintsList = async (statusFilter?: string): Promise<Complaint[]> => {
    const params = statusFilter ? { complaint_status: statusFilter } : {}
    const response = await api.get("/api/service/v1/complaints", { params })
    return response.data
}

export const createComplaint = async (data: CreateComplaintRequest): Promise<Complaint> => {
    const response = await api.post("/api/service/v1/complaints", data)
    return response.data
}

export const updateComplaintStatus = async (id: number, data: UpdateComplaintStatusRequest): Promise<Complaint> => {
    const response = await api.patch(`/api/service/v1/complaints/${id}/status`, data)
    return response.data
}

export const getUser = async (id: number): Promise<User> => {
    const response = await api.get(`/api/core/users-get/${id}`)
    return response.data
}