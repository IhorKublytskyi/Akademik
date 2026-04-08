import { useAuthStore } from "@/features/auth/store/useAuthStore"
import axios from "axios"
import Cookies from "js-cookie"

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
    headers: {
        "Content-Type": "application/json",
    }
})

api.interceptors.request.use((config) => {
    const token = Cookies.get("auth_token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshResponse = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/core/auth/refresh`,
                    {},
                    { withCredentials: true }
                )

                const newToken = refreshResponse.data.token
                const currentUser = useAuthStore.getState().user

                if (currentUser) {
                    useAuthStore.getState().setAuth(currentUser, newToken.accessToken, newToken.refreshToken)
                }

                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return api(originalRequest)

            } catch (refreshError) {
                useAuthStore.getState().logout()
                if (typeof window !== "undefined") {
                    window.location.href = "/login"
                }
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)