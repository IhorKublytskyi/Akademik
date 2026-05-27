"use client"

import { deleteAssignment } from "@/services/assignment-service"
import { Assignment } from "@/shared/types/assignment"

import { Button } from "@/shared/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { MoreHorizontal, LogOut } from "lucide-react"
import { toast } from "sonner"

interface AssignmentActionsProps {
    assignment: Assignment
}

export default function AssignmentActions({ assignment }: AssignmentActionsProps) {
    const queryClient = useQueryClient()

    // Налаштовуємо мутацію для видалення
    const { mutate: handleTerminate, isPending } = useMutation({
        mutationFn: () => deleteAssignment(assignment.id),
        onSuccess: () => {
            toast.success("Resident moved out successfully")
            queryClient.invalidateQueries({ queryKey: ["assignments"] })
            queryClient.invalidateQueries({ queryKey: ["rooms"] })
        },
        onError: () => {
            toast.error("Failed to terminate assignment")
        }
    })

    if (!assignment.isActive) {
        return <span className="text-muted-foreground text-sm">No actions</span>
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                    variant="destructive"
                    onClick={() => handleTerminate()}
                    disabled={isPending}
                    className="focus:bg-destructive/10 cursor-pointer"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isPending ? "Terminating..." : "Terminate (Move out)"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}