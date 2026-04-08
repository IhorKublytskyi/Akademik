"use client"

import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { ReactNode, useEffect, useState } from "react"
import Cookies from "js-cookie"

export function AuthProvider({ children }: { children: ReactNode }) {
    const fetchProfile = useAuthStore(s => s.fetchProfile)
    const user = useAuthStore(s => s.user)
    const [isInitializing, setIsInitializing] = useState(true)

    useEffect(() => {
        const initAuth = async () => {
            const token = Cookies.get("auth_token")

            if (token && !user) {
                await fetchProfile()
            }

            setIsInitializing(false)
        }

        initAuth()
    }, [user, fetchProfile])

    if (isInitializing) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return <>{children}</>
}