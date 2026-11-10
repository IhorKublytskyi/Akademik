"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/features/auth/store/useAuthStore"

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const router = useRouter()
    const user = useAuthStore((state) => state.user)
    const isAuthorized = user && allowedRoles.includes(user.role)

    useEffect(() => {
        if (!isAuthorized) {
            router.push("/dashboard")
        }
    }, [isAuthorized, router])

    if (!isAuthorized) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
                Checking permissions...
            </div>
        )
    }

    return <>{children}</>
}