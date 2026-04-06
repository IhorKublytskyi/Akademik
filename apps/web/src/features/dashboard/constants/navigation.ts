import { LayoutDashboard, Users, DoorOpen, ClipboardList, QrCode, MessageSquare } from "lucide-react"

export const NAV_ITEMS = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "user"] },
    { title: "Users", href: "/dashboard/users", icon: Users, roles: ["admin"] },
    { title: "Rooms", href: "/dashboard/rooms", icon: DoorOpen, roles: ["admin"] },
    { title: "Issues", href: "/dashboard/issues", icon: ClipboardList, roles: ["admin", "user"] },
    { title: "Complaints", href: "/dashboard/complaints", icon: MessageSquare, roles: ["admin", "user"] },
    { title: "My QR", href: "/dashboard/qr", icon: QrCode, roles: ["user"] },
]