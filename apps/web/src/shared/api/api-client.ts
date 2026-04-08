import { useAuthStore } from "@/features/auth/store/useAuthStore"
import axios from "axios"
import Cookies from "js-cookie"
import { Chokokutai } from "next/font/google"

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5202",
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
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5202'}/api/core/auth/refresh`,
                    {
                        refreshToken: Cookies.get("refresh_token")
                    },
                    { withCredentials: true }
                )

                console.log("Token refreshed successfully:", refreshResponse.data)

                const { accessToken, refreshToken } = refreshResponse.data;
                const currentUser = useAuthStore.getState().user

                useAuthStore.getState().setAuth(currentUser, accessToken, refreshToken)

                originalRequest.headers.Authorization = `Bearer ${accessToken}`
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