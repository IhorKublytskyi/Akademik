"use client"

import { Button } from "@/shared/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Wrench, Plus } from "lucide-react"

export default function IssuesPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Maintenance Issues</h1>
                    <p className="text-muted-foreground">Track and manage technical problems and repair requests.</p>
                </div>
                <Button disabled className="cursor-pointer opacity-50">
                    <Plus className="mr-2 h-4 w-4" />
                    Report Issue
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ticket ID</TableHead>
                            <TableHead>Room</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center">
                                <div className="flex flex-col items-center justify-center gap-2 py-10">
                                    <div className="rounded-full bg-secondary p-3">
                                        <Wrench className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-base font-medium">No issues reported yet</p>
                                    <p className="text-sm text-muted-foreground">
                                        The maintenance tracking module is currently under development.
                                    </p>
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}