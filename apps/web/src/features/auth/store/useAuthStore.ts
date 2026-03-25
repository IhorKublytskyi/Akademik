import { create } from 'zustand'
import Cookies from 'js-cookie'

interface User {
    id: string;
    email: string;
    role: "admin" | "user";
    name?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: Cookies.get("auth_token") || null,
    isAuthenticated: !!Cookies.get("auth_token"),
    setAuth: (user, token) => {
        Cookies.set("auth_token", token, { expires: 7, secure: true, sameSite: "strict" })
        set({ user, token, isAuthenticated: true })
    },
    logout: () => {
        Cookies.remove("auth_token")
        set({ user: null, token: null, isAuthenticated: false })
        window.location.href = "/login"
    },
}))