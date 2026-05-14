"use client"

import { api } from "@/shared/api/api-client"
import { UpdateUserRequest, User } from "@/shared/types/user"
import { Button } from "@/shared/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { Edit, MoreHorizontal, ShieldCheck, Trash, UserX } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import EditUserDialog from "./edit-user-dialog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateUser } from "@/services/user-service"

interface UserActionsProps {
    user: User
}

export default function UserActions({ user }: UserActionsProps) {
    const [isEditOpen, setIsEditOpen] = useState(false)
    const queryClient = useQueryClient()

    const { mutate: toggleStatus } = useMutation({
        mutationFn: (data: UpdateUserRequest) => updateUser(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
            toast.success(`${user.firstName}'s status changed to ${variables.status}`)
        },
        onError: () => {
            toast.error("Failed to change user status")
        }
    })

    const { mutate: deleteUser } = useMutation({
        mutationFn: () => api.delete(`/api/core/users/${user.id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
            toast.success("User deleted")
        },
        onError: () => {
            toast.error("Error during deletion")
        }
    })

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
            deleteUser()
        }
    }

    const handleToggleStatus = () => {
        const newStatus = user.status === "Active" ? "Blocked" : "Active"

        toggleStatus({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            status: newStatus
        })
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                        <span className="sr-only">Open the menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>

                    <DropdownMenuItem className="cursor-pointer" onClick={() => setIsEditOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        className="cursor-pointer"
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
            <EditUserDialog
                user={user}
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
            />
        </>
    )
}