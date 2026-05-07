"use client"

import { useAuthStore } from "@/features/auth/store/useAuthStore"
import AdminDashboard from "@/features/dashboard/ui/admin-dashboard"
import ProfileCard from "@/features/dashboard/ui/profile-card"
import ResidentDashboard from "@/features/dashboard/ui/resident-dashboard"

export default function DashboardPage() {
    const user = useAuthStore((state) => state.user)
    const logout = useAuthStore((state) => state.logout)

    if (!user) {
        return null
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Main panel</h1>
                <p className="text-muted-foreground">
                    Welcome to the Akademik management system.
                </p>
            </div>
            {user.role === "Admin" && <AdminDashboard />}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ProfileCard user={user} logout={logout} />
                {user.role === "Resident" && <ResidentDashboard />}
            </div>
        </div>
    )
}