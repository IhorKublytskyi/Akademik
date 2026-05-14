"use client"

import { useAuthStore } from "@/features/auth/store/useAuthStore"
import ReportIssueDialog from "@/features/issues/ui/report-issue-dialog"
import { getIssuesList, updateIssueStatus } from "@/services/issues-service"
import { Issue, IssueStatus } from "@/shared/types/issues"
import { Badge } from "@/shared/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query"
import { Wrench } from "lucide-react"
import { toast } from "sonner"

export default function IssuesPage() {
    const queryClient = useQueryClient()
    const currentUser = useAuthStore((state) => state.user)
    const isAdmin = currentUser?.role === "Admin"

    const { data: issues = [], isLoading } = useQuery({
        queryKey: ["issues"],
        queryFn: () => getIssuesList()
    })

    const { mutate: changeStatus } = useMutation({
        mutationFn: ({ id, status }: { id: number, status: IssueStatus }) => updateIssueStatus(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["issues"] })
            toast.success("Status updated successfully")
        },
        onError: () => toast.error("Failed to update status")
    })

    const getPriorityColor = (priority: string) => {
        switch (priority?.toUpperCase()) {
            case "CRITICAL": return "bg-red-500 hover:bg-red-600"
            case "HIGH": return "bg-orange-500 hover:bg-orange-600"
            case "NORMAL": return "bg-yellow-500 hover:bg-yellow-600"
            case "LOW": return "bg-green-500 hover:bg-green-600"
            default: return "bg-slate-500 hover:bg-slate-600"
        }
    }

    if (isLoading) return <div>Loading issues...</div>

    console.log(issues)

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Maintenance Issues</h1>
                    <p className="text-muted-foreground">Track and manage technical problems and repair requests.</p>
                </div>
                <ReportIssueDialog />
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ticket ID</TableHead>
                            <TableHead>Room</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status / Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {issues.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 py-10">
                                        <div className="rounded-full bg-secondary p-3">
                                            <Wrench className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-base font-medium">No issues reported yet</p>
                                        <p className="text-sm text-muted-foreground">
                                            Everything is running smoothly!
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            issues.map((issue: Issue) => (
                                <TableRow key={issue.id}>
                                    <TableCell className="font-medium">#{issue.id}</TableCell>
                                    <TableCell>Room {issue.room_id}</TableCell>
                                    <TableCell className="max-w-50 truncate" title={issue.title}>
                                        {issue.title}
                                    </TableCell>
                                    <TableCell className="max-w-50 truncate" title={issue.description}>
                                        {issue.description}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`text-white ${getPriorityColor(issue.priority)}`}>
                                            {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1).toLowerCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {isAdmin ? (
                                            <Select
                                                value={issue.status}
                                                onValueChange={(val) => changeStatus({ id: issue.id, status: val as IssueStatus })}
                                                disabled={issue.status === "CLOSED"}
                                            >
                                                <SelectTrigger className="w-35 h-8">
                                                    <SelectValue placeholder={issue.status.replace("_", " ")} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="NEW">New</SelectItem>
                                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                    <SelectItem value="PENDING">Pending</SelectItem>
                                                    <SelectItem value="CLOSED">Closed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Badge variant={issue.status === "CLOSED" ? "secondary" : "outline"}>
                                                {issue.status.replace("_", " ")}
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