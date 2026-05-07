import { getAssignmentsList } from "@/services/assignment-service"
import { getRoomsList } from "@/services/room-service"
import { getUsersList } from "@/services/user-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { useQuery } from "@tanstack/react-query"
import { ClipboardList, DoorOpen, Users, Wrench } from "lucide-react"

export default function AdminDashboard() {
    const { data: usersData, isLoading: loadingUsers } = useQuery({
        queryKey: ["users", "stats"],
        queryFn: () => getUsersList(1, 1)
    })

    const { data: roomsData, isLoading: loadingRooms } = useQuery({
        queryKey: ["rooms", "stats"],
        queryFn: () => getRoomsList(1, 1)
    })

    const { data: assignmentsData, isLoading: loadingAssignments } = useQuery({
        queryKey: ["assignments", "stats"],
        queryFn: () => getAssignmentsList(1, 1)
    })

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {loadingUsers ? "..." : usersData?.totalCount || 0}
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
                        {loadingRooms ? "..." : roomsData?.totalCount || 0}
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
                        {loadingAssignments ? "..." : assignmentsData?.count || 0}
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
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">Module coming soon</p>
                </CardContent>
            </Card>
        </div>
    )
}