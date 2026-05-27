import { api } from "@/shared/api/api-client"
import { AppEvent, EventCreateRequest, EventUpdateRequest, RoomInspectionCreateRequest } from "@/shared/types/events"

export const getMyEvents = async (): Promise<AppEvent[]> => {
    const response = await api.get("/api/service/v1/events")
    return response.data
}

export const createEvent = async (data: EventCreateRequest): Promise<AppEvent> => {
    const response = await api.post("/api/service/v1/events", data)
    return response.data
}

export const updateEvent = async (id: number, data: EventUpdateRequest): Promise<AppEvent> => {
    const response = await api.patch(`/api/service/v1/events/${id}`, data)
    return response.data
}

export const deleteEvent = async (id: number): Promise<void> => {
    await api.delete(`/api/service/v1/events/${id}`)
}

export const createRoomInspection = async (data: RoomInspectionCreateRequest): Promise<AppEvent[]> => {
    const response = await api.post("/api/service/v1/admin/events/room-inspections", data)
    return response.data
}