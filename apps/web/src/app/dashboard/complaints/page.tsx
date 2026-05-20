"use client"

import { useAuthStore } from "@/features/auth/store/useAuthStore"
import FileComplaintDialog from "@/features/complaints/ui/file-complaint-dialog"
import { getComplaintsList, updateComplaintStatus } from "@/services/complaints-service"
import { Complaint, ComplaintStatus } from "@/shared/types/complaints"
import { Badge } from "@/shared/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query"
import { MessageSquareWarning } from "lucide-react"
import { toast } from "sonner"

export default function ComplaintsPage() {
    const queryClient = useQueryClient()
    const currentUser = useAuthStore((state) => state.user)
    const isAdmin = currentUser?.role === "Admin"

    const { data: complaints = [], isLoading } = useQuery({
        queryKey: ["complaints"],
        queryFn: () => getComplaintsList()
    })

    const { mutate: changeStatus } = useMutation({
        mutationFn: ({ id, status }: { id: number, status: ComplaintStatus }) => updateComplaintStatus(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["complaints"] })
            toast.success("Complaint status updated")
        },
        onError: () => toast.error("Failed to update status")
    })

    if (isLoading) return <div>Loading complaints...</div>

    console.log(complaints) 

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Complaints</h1>
                    <p className="text-muted-foreground">Review and resolve resident feedback and complaints.</p>
                </div>
                <FileComplaintDialog />
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Resident</TableHead>
                            <TableHead>Room</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Status / Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {complaints.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 py-10">
                                        <div className="rounded-full bg-secondary p-3">
                                            <MessageSquareWarning className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-base font-medium">No complaints reported yet</p>
                                        <p className="text-sm text-muted-foreground">
                                            Everything is running smoothly!
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            complaints.map((complaint: Complaint) => (
                                <TableRow key={complaint.id}>
                                    <TableCell className="whitespace-nowrap">
                                        {new Date(complaint.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {complaint.is_anonymous ? (
                                            <span className="italic text-muted-foreground font-normal">Anonymous</span>
                                        ) : complaint.user ? (
                                            `${complaint.user.first_name} ${complaint.user.last_name}`
                                        ) : (
                                            `User ID: ${complaint.user_id}`
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {complaint.room_id ? `Room ${complaint.room_id}` : <span className="text-muted-foreground">-</span>}
                                    </TableCell>
                                    <TableCell className="max-w-75 truncate" title={complaint.content}>
                                        {complaint.content}
                                    </TableCell>
                                    <TableCell>
                                        {isAdmin ? (
                                            <Select
                                                value={complaint.status}
                                                onValueChange={(val) => changeStatus({ id: complaint.id, status: val as ComplaintStatus })}
                                                disabled={complaint.status === "CLOSED"}
                                            >
                                                <SelectTrigger className="w-35 h-8">
                                                    <SelectValue placeholder={complaint.status} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="NEW">New</SelectItem>
                                                    <SelectItem value="REVIEW">Under Review</SelectItem>
                                                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                                                    <SelectItem value="CLOSED">Closed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Badge variant={complaint.status === "CLOSED" || complaint.status === "RESOLVED" ? "secondary" : "outline"}>
                                                {complaint.status}
                                            </Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}