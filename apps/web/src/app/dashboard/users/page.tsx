"use client"

import AddUserDialog from "@/features/users/ui/add-user-dialog"
import UserActions from "@/features/users/ui/user-actions"
import { Badge } from "@/shared/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import clsx from "clsx"

const MOCK_USERS = [
    { id: "1", name: "Alex Kowal", email: "alex.k@example.com", role: "admin", status: "Active" },
    { id: "2", name: "Maya Sender", email: "m.send@example.com", role: "user", status: "Active" },
    { id: "3", name: "Den Bigboy", email: "den_b@example.com", role: "user", status: "Blocked" },
]

export default function UsersPage() {
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
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_USERS.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
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
                        ))}
                    </TableBody>

                </Table>
            </div>
        </div>

    )
}