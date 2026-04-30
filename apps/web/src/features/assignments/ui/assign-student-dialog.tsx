"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { createAssignment } from "@/services/assignment-service"
import { getUsersList } from "@/services/user-service"
import { getRoomsList } from "@/services/room-service"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field"
import { useState } from "react"
import { Plus } from "lucide-react"
import { useAuthStore } from "@/features/auth/store/useAuthStore"

const assignSchema = z.object({
    userId: z.string().min(1, "Please select a student"),
    roomId: z.string().min(1, "Please select a room"),
    startDate: z.string().min(1, "Please select a start date"),
})

type AssignFormValues = z.infer<typeof assignSchema>

export default function AssignStudentDialog() {
    const [open, setOpen] = useState(false)
    const currentUser = useAuthStore((state) => state.user)


    const queryClient = useQueryClient()

    const { data: usersData, isLoading: isLoadingUsers } = useQuery({
        queryKey: ["users", "dropdown"],
        queryFn: () => getUsersList(1, 100),
        enabled: open
    })

    const filteredUsersData = usersData?.items.filter(user => user.id !== currentUser?.id)

    const { data: roomsData, isLoading: isLoadingRooms } = useQuery({
        queryKey: ["rooms", "dropdown"],
        queryFn: () => getRoomsList(1, 100),
        enabled: open
    })

    const { control, handleSubmit, reset, formState: { errors } } = useForm<AssignFormValues>({
        resolver: zodResolver(assignSchema),
        defaultValues: {
            userId: "",
            roomId: "",
            startDate: new Date().toISOString().split("T")[0],
        }
    })

    const { mutate: handleAssign, isPending } = useMutation({
        mutationFn: (data: any) => createAssignment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assignments"] })
            toast.success("Student successfully assigned to the room")
            reset()
            setOpen(false)
        },
        onError: () => {
            toast.error("Failed to assign student")
        }
    })

    const onSubmit = (data: AssignFormValues) => {
        handleAssign({
            userId: parseInt(data.userId),
            roomId: parseInt(data.roomId),
            startDate: new Date(data.startDate)
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    Assign Resident
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>Assign Resident</DialogTitle>
                    <DialogDescription>
                        Select a student and assign them to an available room.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">
                    <Controller
                        name="userId"
                        control={control}
                        render={({ field }) => (
                            <FieldGroup>
                                <FieldLabel>Resident</FieldLabel>
                                <Field>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingUsers}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingUsers ? "Loading..." : "Select resident"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredUsersData?.map(user => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.firstName} {user.lastName} ({user.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                                {errors.userId && <FieldError>{errors.userId.message}</FieldError>}
                            </FieldGroup>
                        )}
                    />

                    <Controller
                        name="roomId"
                        control={control}
                        render={({ field }) => (
                            <FieldGroup>
                                <FieldLabel>Room</FieldLabel>
                                <Field>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingRooms}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingRooms ? "Loading..." : "Select room"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roomsData?.items?.map(room => (
                                                <SelectItem key={room.id} value={room.id.toString()}>
                                                    Room {room.number} (Floor {room.floor}) - {room.status}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                                {errors.roomId && <FieldError>{errors.roomId.message}</FieldError>}
                            </FieldGroup>
                        )}
                    />

                    <Controller
                        name="startDate"
                        control={control}
                        render={({ field }) => (
                            <FieldGroup>
                                <FieldLabel htmlFor={field.name}>Move-in Date</FieldLabel>
                                <Field>
                                    <Input
                                        id={field.name}
                                        type="date"
                                        {...field}
                                    />
                                </Field>
                                {errors.startDate && <FieldError>{errors.startDate.message}</FieldError>}
                            </FieldGroup>
                        )}
                    />

                    <div className="flex justify-end gap-3 mt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Assigning..." : "Assign"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}