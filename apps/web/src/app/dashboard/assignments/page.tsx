"use client"

import { useQuery } from "@tanstack/react-query"
import { getAssignmentsList } from "@/services/assignment-service"
import { Assignment } from "@/shared/types/assignment"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Badge } from "@/shared/ui/badge"
import { ClipboardList } from "lucide-react"

import AssignStudentDialog from "@/features/assignments/ui/assign-student-dialog"
import AssignmentActions from "@/features/assignments/ui/assignments-actions"
import RoleGuard from "@/shared/ui/role-guard"

export default function AssignmentsPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["assignments", 1],
        queryFn: () => getAssignmentsList(1, 10)
    })

    const assignments = data?.items || []

    if (isLoading) return <div>Loading assignments...</div>
    if (error) return <div>Error loading assignments</div>

    return (
        <RoleGuard allowedRoles={["Admin"]}>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
                        <p className="text-muted-foreground">Manage room allocations and resident move-ins.</p>
                    </div>
                    <AssignStudentDialog />
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Assignment ID</TableHead>
                                <TableHead>User ID</TableHead>
                                <TableHead>Room ID</TableHead>
                                <TableHead>Move-in Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 py-10">
                                            <div className="rounded-full bg-secondary p-3">
                                                <ClipboardList className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <p className="text-base font-medium">No assignments yet</p>
                                            <p className="text-sm text-muted-foreground">
                                                Click the button above to assign a student to a room.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                assignments.map((assignment: Assignment) => (
                                    <TableRow key={assignment.id}>
                                        <TableCell className="font-medium">#{assignment.id}</TableCell>

                                        <TableCell>Resident ID: {assignment.userId}</TableCell>
                                        <TableCell>Room ID: {assignment.roomId}</TableCell>

                                        <TableCell>{new Date(assignment.startDate).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={assignment.isActive ? "default" : "secondary"}>
                                                {assignment.isActive ? "Active" : "Past"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <AssignmentActions assignment={assignment} />
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