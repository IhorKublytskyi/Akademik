import { getAssignmentsList } from "@/services/assignment-service"
import { getComplaintsList } from "@/services/complaints-service"
import { getIssuesList } from "@/services/issues-service"
import { getRoomsList } from "@/services/room-service"
import { getUsersList } from "@/services/user-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, ClipboardList, DoorOpen, Users, Wrench } from "lucide-react"

export default function AdminDashboard() {
    const { data: usersData, isLoading: loadingUsers } = useQuery({
        queryKey: ["users", "stats"],
        queryFn: () => getUsersList(1, 10)
    })

    const { data: roomsData, isLoading: loadingRooms } = useQuery({
        queryKey: ["rooms", "stats"],
        queryFn: () => getRoomsList(1, 10)
    })

    const { data: assignmentsData, isLoading: loadingAssignments } = useQuery({
        queryKey: ["assignments", "stats"],
        queryFn: () => getAssignmentsList(1, 10)
    })

    const { data: issuesData, isLoading: loadingIssues } = useQuery({
        queryKey: ["issues", "stats"],
        queryFn: () => getIssuesList()
    })

    const { data: complaintsData, isLoading: loadingComplaints } = useQuery({
        queryKey: ["complaints", "stats"],
        queryFn: () => getComplaintsList()
    })

    console.log(assignmentsData)

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {loadingUsers ? "..." : usersData?.count || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Registered in system</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                    <DoorOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {loadingRooms ? "..." : roomsData?.count || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Physical rooms</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {loadingAssignments ? "..." : assignmentsData?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Total move-ins</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {loadingIssues ? "..." : issuesData?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Active breakdowns</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open Complaints</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {loadingComplaints ? "..." : complaintsData?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Requires review</p>
                </CardContent>
            </Card>
        </div>
    )
}