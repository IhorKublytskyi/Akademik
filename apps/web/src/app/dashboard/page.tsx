"use client"

import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Button } from "@/shared/ui/button"
import { LogOut, User as UserIcon } from "lucide-react"

export default function DashboardPage() {
    const user = useAuthStore((state) => state.user)
    const logout = useAuthStore((state) => state.logout)
    const username = user?.firstName + " " +user?.lastName;
    console.log(user)
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Main panel</h1>
                <p className="text-muted-foreground">
                    Welcome to the Akademik management system. Select the desired section from the menu.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Your profile</CardTitle>
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold mt-2">
                            {user?.firstName + " " + user?.lastName || "User"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Email: {user?.email}
                        </p>
                        <div className="mt-3 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                            Role: {user?.role.toUpperCase()}
                        </div>

                        <Button
                            variant="outline"
                            className="w-full mt-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={logout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}