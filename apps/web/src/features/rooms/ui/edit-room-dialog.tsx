"use client"

import { useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { updateRoom } from "@/services/room-service"
import { Room, UpdateRoomRequest } from "@/shared/types/room"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field"
import { toast } from "sonner"

const editRoomSchema = z.object({
    id: z.number(),
    capacity: z.number().min(1, "Capacity must be at least 1").max(10, "Capacity cannot exceed 10"),
    status: z.enum(["Available", "Occupied", "Maintenance"]),
})

type EditRoomFormValues = z.infer<typeof editRoomSchema>

interface EditRoomDialogProps {
    room: Room | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditRoomDialog({ room, isOpen, onClose }: EditRoomDialogProps) {
    const queryClient = useQueryClient()

    const { control, handleSubmit, reset, formState: { errors } } = useForm<EditRoomFormValues>({
        resolver: zodResolver(editRoomSchema),
        defaultValues: {
            id: 0,
            capacity: 1,
            status: "Available",
        }
    })

    useEffect(() => {
        if (room && isOpen) {
            reset({
                id: room.id,
                capacity: room.capacity,
                status: room.status as "Available" | "Occupied" | "Maintenance",
            })
        }
    }, [room, isOpen, reset])

    const { mutate: handleUpdate, isPending } = useMutation({
        mutationFn: (data: UpdateRoomRequest) => updateRoom(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rooms"] })
            toast.success(`Room ${room?.number} updated successfully`)
            onClose()
        },
        onError: () => {
            toast.error("Failed to update room")
        }
    })

    const onSubmit = (data: EditRoomFormValues) => {
        handleUpdate({
            ...data,
            number: room!.number,
            floor: room!.floor
        } as UpdateRoomRequest)
    }

    if (!room) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>Edit Room {room.number}</DialogTitle>
                    <DialogDescription>
                        Modify the capacity or status for this room. Floor and room numbers cannot be changed.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4 bg-muted/50 p-3 rounded-md border">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase">Room Number</p>
                            <p className="text-sm font-semibold">{room.number}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase">Floor</p>
                            <p className="text-sm font-semibold">{room.floor}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Controller
                            name="capacity"
                            control={control}
                            render={({ field }) => (
                                <FieldGroup>
                                    <FieldLabel htmlFor={field.name}>Capacity (Beds)</FieldLabel>
                                    <Field>
                                        <Input
                                            id={field.name}
                                            type="number"
                                            min={1}
                                            max={10}
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        />
                                    </Field>
                                    {errors.capacity && <FieldError>{errors.capacity.message}</FieldError>}
                                </FieldGroup>
                            )}
                        />

                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <FieldGroup>
                                    <FieldLabel>Status</FieldLabel>
                                    <Field>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Available">Available</SelectItem>
                                                <SelectItem value="Occupied">Occupied</SelectItem>
                                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    {errors.status && <FieldError>{errors.status.message}</FieldError>}
                                </FieldGroup>
                            )}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving..." : "Save changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}