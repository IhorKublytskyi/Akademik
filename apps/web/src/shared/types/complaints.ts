export type ComplaintStatus = "NEW" | "REVIEW" | "RESOLVED" | "CLOSED"

export interface Complaint {
    id: number
    user_id: number | null
    room_id: number | null
    content: string
    is_anonymous: boolean
    status: ComplaintStatus
    created_at: string
    closed_at: string | null
    user?: {
        first_name: string
        last_name: string
        email: string
    } | null
}

export interface CreateComplaintRequest {
    room_id?: number | null
    content: string
    is_anonymous: boolean
}

export interface UpdateComplaintStatusRequest {
    status: ComplaintStatus
}