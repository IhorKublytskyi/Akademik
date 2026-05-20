import { getRoommates } from "@/services/assignment-service"
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card"
import { useQuery } from "@tanstack/react-query"
import { DoorOpen } from "lucide-react"

export default function ResidentDashboard() {
    const { data: roommates, isLoading } = useQuery({
        queryKey: ["roommates"],
        queryFn: getRoommates
    })

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="md:col-span-2 lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">My Room & Roommates</CardTitle>
                    <DoorOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p className="text-sm text-muted-foreground mt-4">Loading room data...</p>
                    ) : roommates && roommates.length > 0 ? (
                        <div className="mt-4 space-y-4">
                            <p className="text-sm font-medium">People living with you:</p>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {roommates.map((mate) => (
                                    <div key={mate.id} className="flex items-center space-x-4 rounded-md border p-3">
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {mate.firstName} {mate.lastName}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {mate.email}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <DoorOpen className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                            <p className="text-sm font-medium">No room assigned</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                You have not been assigned to a room yet, or you live alone.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}