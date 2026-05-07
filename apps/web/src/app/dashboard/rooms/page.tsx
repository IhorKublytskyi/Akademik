"use client"

import { useQuery } from "@tanstack/react-query"
import { getRoomsList } from "@/services/room-service"
import { Room } from "@/shared/types/room"
import { Badge } from "@/shared/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import clsx from "clsx"
import { Building, Users } from "lucide-react"

import RoomActions from "@/features/rooms/ui/room-actions"
import RoleGuard from "@/shared/ui/role-guard"

export default function RoomsPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["rooms", 1],
        queryFn: () => getRoomsList(1, 10)
    })

    const rooms = data?.items || []

    if (isLoading) return <div>Loading rooms...</div>
    if (error) return <div>Error: {(error as any).message}</div>

    return (
        <RoleGuard allowedRoles={["Admin"]}>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Rooms</h1>
                        <p className="text-muted-foreground">Manage dormitory rooms, floors, and capacities.</p>
                    </div>
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Room Number</TableHead>
                                <TableHead>Floor</TableHead>
                                <TableHead>Capacity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rooms.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center gap-1 py-10">
                                            <Building className="h-8 w-8 text-muted-foreground mb-2" />
                                            <p className="text-sm font-medium">No rooms found</p>
                                            <p className="text-sm text-muted-foreground">
                                                Add your first room to the dormitory.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rooms.map((room: Room) => (
                                    <TableRow key={room.id}>
                                        <TableCell className="font-medium text-md">{room.number}</TableCell>
                                        <TableCell>Floor {room.floor}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span>{room.capacity} beds</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={clsx(
                                                    room.status === "Available" && "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-700",
                                                    room.status === "Occupied" && "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-700",
                                                    room.status === "Maintenance" && "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-700",
                                                    !["Available", "Occupied", "Closed"].includes(room.status as string) && "bg-secondary"
                                                )}
                                                variant="outline"
                                            >
                                                {room.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <RoomActions room={room} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </RoleGuard>
    )
}