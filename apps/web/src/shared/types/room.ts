export type RoomStatus = "Available" | "Occupied" | "Closed" | string

export interface Room {
    id: number;
    number: string;
    floor: number;
    capacity: number;
    status: RoomStatus;
}

export interface RoomsListResponse {
    items: Room[];
    count: number;
}

export interface UpdateRoomRequest {
    id: number;
    number: string;
    floor: number;
    capacity: number;
    status: string;
}