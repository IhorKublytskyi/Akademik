import { api } from "@/shared/api/api-client"
import { AppNotification } from "@/shared/types/notification"

export const getNotifications = async (): Promise<AppNotification[]> => {
    const response = await api.get("/api/service/v1/notifications")
    return response.data
}
