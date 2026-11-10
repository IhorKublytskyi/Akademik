export type NotificationChannel = "EMAIL" | "SMS" | "APP"
export type NotificationStatus = "PENDING" | "SENT" | "FAILED"

export interface AppNotification {
    id: number
    user_id: number
    channel: NotificationChannel
    title: string
    content: string | null
    status: NotificationStatus
    scheduled_at: string | null
    sent_at: string | null
}
