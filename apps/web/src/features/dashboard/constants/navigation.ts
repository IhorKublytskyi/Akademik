import { LayoutDashboard, Users, DoorOpen, ClipboardList, QrCode, MessageSquare } from "lucide-react"

export const NAV_ITEMS = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["Admin", "Resident"] },
    { title: "Users", href: "/dashboard/users", icon: Users, roles: ["Admin"] },
    { title: "Rooms", href: "/dashboard/rooms", icon: DoorOpen, roles: ["Admin"] },
    { title: "Issues", href: "/dashboard/issues", icon: ClipboardList, roles: ["Admin", "Resident"] },
    { title: "Complaints", href: "/dashboard/complaints", icon: MessageSquare, roles: ["Admin", "Resident"] },
    { title: "My QR", href: "/dashboard/qr", icon: QrCode, roles: ["Resident"] },
]