"use client"

import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { getNotifications } from "@/services/notification-service"
import { AppNotification, NotificationChannel, NotificationStatus } from "@/shared/types/notification"
import { Badge } from "@/shared/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { Bell } from "lucide-react"

const CHANNEL_COLORS: Record<NotificationChannel, string> = {
    APP: "bg-blue-500 hover:bg-blue-600",
    EMAIL: "bg-purple-500 hover:bg-purple-600",
    SMS: "bg-teal-500 hover:bg-teal-600",
}

const STATUS_COLORS: Record<NotificationStatus, string> = {
    SENT: "bg-green-500 hover:bg-green-600",
    PENDING: "bg-yellow-500 hover:bg-yellow-600",
    FAILED: "bg-red-500 hover:bg-red-600",
}

const formatDate = (notification: AppNotification) => {
    const value = notification.sent_at ?? notification.scheduled_at
    return value ? format(new Date(value), "dd.MM.yyyy HH:mm") : "—"
}

export default function NotificationsPage() {
    const currentUser = useAuthStore((state) => state.user)
    const isAdmin = currentUser?.role === "Admin"

    const { data: notifications = [], isLoading, error } = useQuery({
        queryKey: ["notifications"],
        queryFn: getNotifications,
        refetchInterval: 5000,
    })

    if (isLoading) return <div>Loading notifications...</div>
    if (error) return <div>Error loading notifications</div>

    const columnCount = isAdmin ? 6 : 5

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                <p className="text-muted-foreground">
                    {isAdmin ? "All notifications sent to residents." : "Messages about your issues, events and complaints."}
                </p>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {isAdmin && <TableHead>User</TableHead>}
                            <TableHead>Title</TableHead>
                            <TableHead>Content</TableHead>
                            <TableHead>Channel</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {notifications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columnCount} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 py-10">
                                        <div className="rounded-full bg-secondary p-3">
                                            <Bell className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-base font-medium">No notifications yet</p>
                                        <p className="text-sm text-muted-foreground">
                                            New messages will appear here automatically.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            notifications.map((notification) => (
                                <TableRow key={notification.id}>
                                    {isAdmin && <TableCell className="font-medium">#{notification.user_id}</TableCell>}
                                    <TableCell className="max-w-50 truncate font-medium" title={notification.title}>
                                        {notification.title}
                                    </TableCell>
                                    <TableCell className="max-w-80 truncate" title={notification.content ?? ""}>
                                        {notification.content ?? "—"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`text-white ${CHANNEL_COLORS[notification.channel] ?? ""}`}>
                                            {notification.channel}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`text-white ${STATUS_COLORS[notification.status] ?? ""}`}>
                                            {notification.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap text-muted-foreground">
                                        {formatDate(notification)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
