export type UserRole = "Admin" | "Resident"
export type UserStatus = "Active" | "Blocked"

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    role: UserRole;
    status: UserStatus;
    createdAt: string;
}

export interface UsersListResponse {
    items: User[];
    count: number;
    page: number;
    pageSize: number;
}

export interface UpdateUserRequest {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    status: string;
}