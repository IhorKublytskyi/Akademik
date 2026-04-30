"use client"

import { useAuthStore } from "@/features/auth/store/useAuthStore"
import AddUserDialog from "@/features/users/ui/add-user-dialog"
import UserActions from "@/features/users/ui/user-actions"
import { getUsersList } from "@/services/user-service"
import { User } from "@/shared/types/user"
import { Badge } from "@/shared/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { useQuery } from "@tanstack/react-query"
import clsx from "clsx"

export default function UsersPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["users", 1],
        queryFn: () => getUsersList(1, 10)
    })
    const currentUser = useAuthStore(s => s.user)

    const filteredUsers = data?.items
        ?.filter((u: User) => u.id !== currentUser?.id)
        ?.sort((a, b) => {
            const date1 = new Date(a.createdAt)
            const timestamp1 = date1.getTime()

            const date2 = new Date(b.createdAt)
            const timestamp2 = date2.getTime()

            return timestamp2 - timestamp1
        }) || []

    if (isLoading) return <div>Loading users...</div>
    if (error) return <div>Error: {(error as any).message}</div>

    console.log(data?.items)

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground">Management of students and dormitory administrators.</p>
                </div>
                <AddUserDialog />
            </div>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>First name</TableHead>
                            <TableHead>Last name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone number</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                    No users found. Add your first student!
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user: User) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.firstName}</TableCell>
                                    <TableCell className="font-medium">{user.lastName}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phoneNumber}</TableCell>
                                    <TableCell>
                                        <span className="text-xs font-semibold uppercase text-muted-foreground">
                                            {user.role}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={clsx(user.status === "Active"
                                                ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-700"
                                                : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-700")}
                                            variant="outline"
                                        >{user.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <UserActions user={user} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )
                        }
                    </TableBody>
                </Table>
            </div>
        </div>

    )
}