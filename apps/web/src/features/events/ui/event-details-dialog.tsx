"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { format } from "date-fns"

import { createEvent, updateEvent, deleteEvent } from "@/services/event-service"
import { getUsersList } from "@/services/user-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { FieldGroup, FieldLabel } from "@/shared/ui/field"
import { AppEvent, EventType } from "@/shared/types/events"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedEvent?: (AppEvent & { residentIds?: number[] }) | null
    selectedSlot?: { start: Date, end: Date } | null
}

export default function EventDetailsDialog({ open, onOpenChange, selectedEvent, selectedSlot }: Props) {
    const queryClient = useQueryClient()
    const isReadOnly = selectedEvent?.source === "ADMIN"
    const isEditing = !!selectedEvent && !isReadOnly

    const [formData, setFormData] = useState({ title: "", description: "", startAt: "", endAt: "" })

    const { data: usersResponse } = useQuery({
        queryKey: ["users-for-inspection"],
        queryFn: () => getUsersList(1, 100),
        enabled: open && isReadOnly
    })

    const users = usersResponse?.items || []

    const getResidentName = (id: number) => {
        const user = users.find((u: { id: number; firstName: string; lastName: string }) => u.id === id)
        if (!user) return `ID: ${id}`
        return `${user.firstName} ${user.lastName}`
    }

    useEffect(() => {
        if (!open) return
        
        if (selectedEvent) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                title: selectedEvent.title,
                description: selectedEvent.description || "",
                startAt: format(new Date(selectedEvent.start_at + "Z"), "yyyy-MM-dd'T'HH:mm"),
                endAt: format(new Date(selectedEvent.end_at + "Z"), "yyyy-MM-dd'T'HH:mm")
            })
        } else if (selectedSlot) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                title: "", description: "",
                startAt: format(selectedSlot.start, "yyyy-MM-dd'T'HH:mm"),
                endAt: format(selectedSlot.end, "yyyy-MM-dd'T'HH:mm")
            })
        }
    }, [selectedEvent, selectedSlot, open])

    const { mutate: saveEvent, isPending } = useMutation({
        mutationFn: (data: { title: string; description: string; start_at: string; end_at: string; type: EventType }) => selectedEvent ? updateEvent(selectedEvent.id, data) : createEvent(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["events"] })
            toast.success(selectedEvent ? "Event updated" : "Event created")
            onOpenChange(false)
        },
        onError: () => toast.error("Failed to save event")
    })

    const { mutate: removeEvent } = useMutation({
        mutationFn: (id: number) => deleteEvent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["events"] })
            toast.success("Event deleted")
            onOpenChange(false)
        },
        onError: () => toast.error("Failed to delete event")
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        saveEvent({
            title: formData.title,
            description: formData.description,
            start_at: new Date(formData.startAt).toISOString(),
            end_at: new Date(formData.endAt).toISOString(),
            type: "OTHER"
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isReadOnly ? "Event Details" : selectedEvent ? "Edit Event" : "New Event"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                    <FieldGroup>
                        <FieldLabel>Title</FieldLabel>
                        <Input required disabled={isReadOnly} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                    </FieldGroup>
                    <FieldGroup>
                        <FieldLabel>Description</FieldLabel>
                        <Textarea disabled={isReadOnly} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </FieldGroup>

                    <div className="grid grid-cols-2 gap-4">
                        <FieldGroup>
                            <FieldLabel>Start Time</FieldLabel>
                            <Input required type="datetime-local" disabled={isReadOnly} value={formData.startAt} onChange={e => setFormData({ ...formData, startAt: e.target.value })} />
                        </FieldGroup>
                        <FieldGroup>
                            <FieldLabel>End Time</FieldLabel>
                            <Input required type="datetime-local" disabled={isReadOnly} value={formData.endAt} onChange={e => setFormData({ ...formData, endAt: e.target.value })} />
                        </FieldGroup>
                    </div>

                    {selectedEvent?.residentIds && selectedEvent.residentIds.length > 0 && selectedEvent.source === "ADMIN" && (
                        <FieldGroup>
                            <FieldLabel>Scheduled for Residents</FieldLabel>
                            <div className="px-3 py-2 bg-muted rounded-md text-sm flex flex-wrap gap-1.5 border">
                                {selectedEvent.residentIds.map(id => (
                                    <span key={id} className="px-2 py-0.5 bg-background border rounded text-xs font-medium text-slate-700 shadow-sm">
                                        {getResidentName(id)}
                                    </span>
                                ))}
                            </div>
                        </FieldGroup>
                    )}

                    <DialogFooter className="mt-4 flex gap-2 sm:justify-between">
                        {isEditing ? (
                            <Button type="button" variant="destructive" onClick={() => removeEvent(selectedEvent.id)}>Delete</Button>
                        ) : <div></div>}

                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                            {!isReadOnly && <Button type="submit" disabled={isPending}>Save</Button>}
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}