"use client"

import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { NAV_ITEMS } from "../constants/navigation"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    useSidebar
} from "@/shared/ui/sidebar"
import Link from "next/link"

export function AppSidebar() {
    const user = useAuthStore((s) => s.user)

    const { state } = useSidebar()

    const userRole = user?.role || "Resident"
    const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(userRole))

    return (
        <Sidebar variant="inset" collapsible="icon" className="border-r border-border">
            <SidebarHeader className="p-4 flex items-center justify-center border-b">
                {state === "expanded" ? (
                    <span className="font-bold text-xl tracking-tight transition-all">
                        Akademik<span className="text-primary">.</span>
                    </span>
                ) : (
                    <span className="font-bold text-xl text-primary transition-all">
                        A.
                    </span>
                )}
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {filteredNav.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <Link href={item.href}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}