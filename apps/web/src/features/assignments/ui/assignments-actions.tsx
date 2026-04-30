"use client"

import { useState } from "react"
import { Assignment } from "@/shared/types/assignment"

import { Button } from "@/shared/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { MoreHorizontal, LogOut, AlertCircle } from "lucide-react"

interface AssignmentActionsProps {
    assignment: Assignment
}

export default function AssignmentActions({ assignment }: AssignmentActionsProps) {
    const [isTerminating, setIsTerminating] = useState(false)

    const handleTerminate = () => {
        // TODO: Підключити мутацію React Query, коли бекенд зробить ендпоїнт
        console.log("Terminating assignment ID:", assignment.id)
        alert(`This will terminate assignment #${assignment.id}. Waiting for backend API!`)
    }

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
                    onClick={handleTerminate}
                    className="focus:bg-destructive/10 cursor-pointer"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Terminate (Move out)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}