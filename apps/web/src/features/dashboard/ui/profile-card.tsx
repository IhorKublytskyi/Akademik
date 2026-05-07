import { User } from "@/shared/types/user"
import { Button } from "@/shared/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card"
import { UserIcon, LogOut } from "lucide-react"

export default function ProfileCard({ user, logout }: { user: User, logout: () => void }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Profile</CardTitle>
                <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold mt-2">
                    {user.firstName} {user.lastName}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Email: {user.email}
                </p>
                <div className="mt-3 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                    Role: {user.role.toUpperCase()}
                </div>

                <Button
                    variant="outline"
                    className="w-full mt-6 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer hover:border-destructive"
                    onClick={logout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </Button>
            </CardContent>
        </Card>
    )
}