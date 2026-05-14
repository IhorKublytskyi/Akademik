import { api } from "@/shared/api/api-client"
import { CreateIssueRequest, Issue, UpdateIssueStatusRequest } from "@/shared/types/issues"

export const getIssuesList = async (statusFilter?: string): Promise<Issue[]> => {
    const params = statusFilter ? { issue_status: statusFilter } : {}
    const response = await api.get("/api/service/v1/issues", { params })
    return response.data
}

export const createIssue = async (data: CreateIssueRequest): Promise<Issue> => {
    const response = await api.post("/api/service/v1/issues", data)
    return response.data
}

export const updateIssueStatus = async (id: number, data: UpdateIssueStatusRequest): Promise<Issue> => {
    const response = await api.patch(`/api/service/v1/issues/${id}/status`, data)
    return response.data
}