"use client"

import { useState } from "react"
import { Room } from "@/shared/types/room"

import { Button } from "@/shared/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Users } from "lucide-react"
import EditRoomDialog from "./edit-room-dialog"

interface RoomActionsProps {
    room: Room
}

export default function RoomActions({ room }: RoomActionsProps) {
    const [isEditOpen, setIsEditOpen] = useState(false)

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="cursor-pointer" onClick={() => setIsEditOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Room
                    </DropdownMenuItem>

                    <DropdownMenuItem className="cursor-pointer" onClick={() => console.log("Navigate to residents")}>
                        <Users className="mr-2 h-4 w-4" />
                        View Residents
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditRoomDialog
                room={room}
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
            />
        </>
    )
}