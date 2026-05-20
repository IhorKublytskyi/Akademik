export type EventSource = "USER" | "ADMIN"
export type EventType = "ROOM_INSPECTION" | "PAYMENT" | "OTHER"

export interface AppEvent {
    id: number
    user_id: number
    title: string
    description: string | null
    start_at: string
    end_at: string
    source: EventSource
    type: EventType
    created_at: string
}

export interface EventCreateRequest {
    title: string
    description?: string | null
    start_at: string
    end_at: string
    type?: EventType
}

export interface EventUpdateRequest {
    title?: string
    description?: string | null
    start_at?: string
    end_at?: string
}

export interface RoomInspectionCreateRequest {
    user_ids: number[]
    title: string
    description?: string | null
    start_at: string
    end_at: string
}