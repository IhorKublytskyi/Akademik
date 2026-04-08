import { create } from "zustand"
import Cookies from "js-cookie"
import { api } from "@/shared/api/api-client";

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: "Admin" | "Resident";
    status: "Active" | "Blocked";
    createdAt: number;
}

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    fetchProfile: () => void;
    setAuth: (user: User | null, token: string, refreshToken: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: Cookies.get("auth_token") || null,
    refreshToken: Cookies.get("refresh_token") || null,
    isAuthenticated: !!Cookies.get("auth_token"),

    fetchProfile: async () => {
        try {
            const response = await api.get("/api/core/me")

            set({
                user: response.data,
                isAuthenticated: true
            })
        } catch (error) {
            set({
                user: null,
                isAuthenticated: false
            })
        }
    },

    setAuth: (user, token, refreshToken) => {
        Cookies.set("auth_token", token, { expires: 1 / 48 })
        Cookies.set("refresh_token", refreshToken, { expires: 7 })
        set({ user, token, refreshToken, isAuthenticated: true })
    },

    logout: () => {
        Cookies.remove("auth_token")
        Cookies.remove("refresh_token")
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false })

        if (typeof window !== "undefined") {
            window.location.href = "/login"
        }
    },
}))