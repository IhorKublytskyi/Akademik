"use client"

import { api } from "@/shared/api/api-client"
import { Button } from "@/shared/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import clsx from "clsx"
import { Edit, MoreHorizontal, ShieldCheck, Trash, UserX } from "lucide-react"
import { toast } from "sonner"

interface UserActionsProps {
    user: {
        id: string
        name: string
        status: string
    }
}

export default function UserActions({ user }: UserActionsProps) {

    const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
            try {
                await api.delete(`/api/core/users/${user.id}`)
                toast.success("User deleted")
            } catch (error) {
                toast.error("Error during deletion")
            }
        }
    }

    const handleToggleStatus = () => {
        const action = user.status === "Active" ? "blocked" : "activated"
        toast.success(`The user ${user.name} has been ${action}`)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                    <span className="sr-only">Open the menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                <DropdownMenuItem className="cursor-pointer" onClick={() => toast("Editing coming soon...")}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </DropdownMenuItem>

                <DropdownMenuItem
                    variant={`${user.status === "Active" ? "destructive" : "default"}`}
                    onClick={handleToggleStatus}
                >
                    {user.status === "Active" ? (
                        <>
                            <UserX className="mr-2 h-4 w-4" />
                            Block
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Activate
                        </>
                    )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem variant="destructive" onClick={handleDelete} className="focus:bg-destructive/10 cursor-pointer">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}