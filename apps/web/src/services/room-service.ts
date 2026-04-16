import { api } from "@/shared/api/api-client"
import { RoomsListResponse } from "@/shared/types/room"

export const getRoomsList = async (pageNumber = 1, pageSize = 10): Promise<RoomsListResponse> => {
    const response = await api.post<RoomsListResponse>("/api/core/rooms-get", {
        pagination: {
            pageNumber,
            pageSize
        }
    })
    return response.data
}