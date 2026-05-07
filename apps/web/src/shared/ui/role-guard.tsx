"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/features/auth/store/useAuthStore"

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const router = useRouter()
    const { user, isAuthenticated } = useAuthStore()
    const [isAuthorized, setIsAuthorized] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace("/login")
            return
        }

        if (isAuthenticated && user === null) {
            return
        }

        if (user && !allowedRoles.includes(user.role)) {
            router.replace("/dashboard")
            return
        }

        setIsAuthorized(true)
    }, [user, isAuthenticated, allowedRoles, router])

    if (!isAuthorized) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
                Checking permissions...
            </div>
        )
    }

    return <>{children}</>
}