import { api } from "@/shared/api/api-client"
import { QRCode, QRCodeCreateRequest, QRCodeListResponse } from "@/shared/types/qr"

export const getQRCodes = async (page = 1, size = 20): Promise<QRCodeListResponse> => {
    const response = await api.get("/api/service/v1/qr-codes", { params: { page, size } })
    return response.data
}

export const createQRCode = async (data: QRCodeCreateRequest): Promise<QRCode> => {
    const response = await api.post("/api/service/v1/qr-codes", data)
    return response.data
}

export const revokeQRCode = async (id: number): Promise<QRCode> => {
    const response = await api.patch(`/api/service/v1/qr-codes/${id}/revoke`)
    return response.data
}