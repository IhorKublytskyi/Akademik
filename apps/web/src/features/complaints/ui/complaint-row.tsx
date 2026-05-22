"use client"

import { getUser } from "@/services/complaints-service"
import { Complaint, ComplaintStatus } from "@/shared/types/complaints"
import { Badge } from "@/shared/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { TableCell, TableRow } from "@/shared/ui/table"
import { useQuery } from "@tanstack/react-query"

export default function ComplaintRow({
    complaint,
    isAdmin,
    changeStatus
}: {
    complaint: Complaint;
    isAdmin: boolean;
    changeStatus: (data: { id: number, status: ComplaintStatus }) => void
}) {
    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ["user", complaint.user_id],
        queryFn: () => getUser(complaint.user_id!),
        enabled: !!complaint.user_id && !complaint.is_anonymous,
        staleTime: 1000 * 60 * 5
    })

    return (
        <TableRow>
            <TableCell className="whitespace-nowrap">
                {new Date(complaint.created_at).toLocaleDateString()}
            </TableCell>

            <TableCell>
                {complaint.is_anonymous ? (
                    <span className="italic text-muted-foreground font-normal">Anonymous</span>
                ) : isUserLoading ? (
                    <span className="text-muted-foreground text-sm">Loading...</span>
                ) : user ? (
                    `${user.firstName || user.firstName} ${user.lastName || user.lastName}`
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
    )
}