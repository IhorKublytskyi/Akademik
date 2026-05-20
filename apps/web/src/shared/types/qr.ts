export type QRAccessType = "BUILDING" | "ROOM"
export type QRStatus = "ACTIVE" | "USED" | "REVOKED"

export interface QRCode {
    id: number
    user_id: number
    room_id: number
    token: string
    access_type: QRAccessType
    valid_from: string
    valid_to: string
    status: QRStatus
}

export interface QRCodeCreateRequest {
    room_id: number
    access_type: QRAccessType
    valid_from: string
    valid_to: string
}

export interface QRCodeListResponse {
    items: QRCode[]
    total: number
    page: number
    size: number
}