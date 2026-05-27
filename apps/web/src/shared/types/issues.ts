export type IssueStatus = "NEW" | "IN_PROGRESS" | "PENDING" | "CLOSED"
export type IssuePriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL"

export interface Issue {
    id: number
    room_id: number
    user_id: number
    title: string
    category: string
    priority: IssuePriority
    status: IssueStatus
    description: string
    createdAt: string
}

export interface CreateIssueRequest {
    room_id: number
    title: string
    category: string
    priority: IssuePriority
    description: string
}

export interface UpdateIssueStatusRequest {
    status: IssueStatus
}