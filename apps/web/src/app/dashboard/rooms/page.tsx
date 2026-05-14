"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getRoomsList } from "@/services/room-service"
import { Room } from "@/shared/types/room"
import { Badge } from "@/shared/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import clsx from "clsx"
import { Building, Users, ChevronLeft, ChevronRight } from "lucide-react"

import RoomActions from "@/features/rooms/ui/room-actions"
import RoleGuard from "@/shared/ui/role-guard"
import { useAuthStore } from "@/features/auth/store/useAuthStore"

export default function RoomsPage() {
    const currentUser = useAuthStore(s => s.user)

    const [page, setPage] = useState(1)
    const pageSize = 10

    const { data, isLoading, error, isPlaceholderData } = useQuery({
        queryKey: ["rooms", page],
        queryFn: () => getRoomsList(page, pageSize),
        enabled: currentUser?.role === "Admin",
        placeholderData: (previousData) => previousData,
    })

    const rooms = data?.items || []
    const totalPages = Math.ceil((data?.count || 0) / pageSize)

    console.log(rooms)

    return (
        <RoleGuard allowedRoles={["Admin"]}>
            {isLoading ? (
                <div className="text-muted-foreground mt-4">Loading rooms...</div>
            ) : error ? (
                <div className="text-destructive mt-4">Error: {(error as any).message}</div>
            ) : (
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
                                                        room.status === 0 && "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-700",
                                                        room.status === 1 && "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-700",
                                                        room.status === 2 && "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-700",
                                                    )}
                                                    variant="outline"
                                                >
                                                    {
                                                        room.status === 0 ? "Available" :
                                                        room.status === 1 ? "Occupied" :
                                                        "Closed"
                                                    }
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

                    <div className="flex items-center justify-between px-2">
                        <div className="text-sm text-muted-foreground">
                            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((old) => Math.max(old - 1, 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((old) => old + 1)}
                                disabled={page >= totalPages || isPlaceholderData}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </RoleGuard>
    )
}