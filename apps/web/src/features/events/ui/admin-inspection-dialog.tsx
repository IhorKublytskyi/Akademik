"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ShieldAlert, Users } from "lucide-react"

import { createRoomInspection } from "@/services/event-service"
import { getUsersList } from "@/services/user-service" 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { FieldGroup, FieldLabel } from "@/shared/ui/field"
import { ScrollArea } from "@/shared/ui/scroll-area"
import { Skeleton } from "@/shared/ui/skeleton"

export default function AdminInspectionDialog() {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()
    
    const [formData, setFormData] = useState({ title: "", description: "", startAt: "", endAt: "" })
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])

    const { data: usersResponse, isLoading: isLoadingUsers } = useQuery({
        queryKey: ["users-for-inspection"],
        queryFn: () => getUsersList(1, 100),
        enabled: open 
    })

    const users = usersResponse?.items || []

    const residents = users.filter((u: any) => u.role !== "Admin" && u.role !== "ADMIN")

    const { mutate, isPending } = useMutation({
        mutationFn: (data: any) => createRoomInspection(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["events"] })
            toast.success("Inspections scheduled successfully")
            setOpen(false)
            setFormData({ title: "", description: "", startAt: "", endAt: "" })
            setSelectedUserIds([])
        },
        onError: () => toast.error("Failed to schedule inspections")
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        if (selectedUserIds.length === 0) {
            return toast.error("Please select at least one resident")
        }

        mutate({
            user_ids: selectedUserIds,
            title: formData.title,
            description: formData.description,
            start_at: new Date(formData.startAt).toISOString(),
            end_at: new Date(formData.endAt).toISOString(),
        })
    }

    const toggleUser = (userId: number) => {
        setSelectedUserIds(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" className="cursor-pointer">
                    <ShieldAlert className="mr-2 h-4 w-4" /> Schedule Inspection
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-137.5">
                <DialogHeader>
                    <DialogTitle>Mass Room Inspection</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                    
                    <FieldGroup>
                        <FieldLabel className="flex items-center gap-2">
                            <Users className="h-4 w-4" /> Select Residents
                        </FieldLabel>
                        <div className="border rounded-md p-1 bg-background">
                            <ScrollArea className="h-32">
                                {isLoadingUsers ? (
                                    <div className="p-3 space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-3/4" />
                                    </div>
                                ) : residents.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        No residents found.
                                    </div>
                                ) : (
                                    <div className="p-2 flex flex-col gap-1">
                                        {residents.map((user: any) => (
                                            <label 
                                                key={user.id} 
                                                className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded cursor-pointer transition-colors"
                                            >
                                                <input 
                                                    type="checkbox" 
                                                    className="h-4 w-4 rounded border-gray-300"
                                                    checked={selectedUserIds.includes(user.id)}
                                                    onChange={() => toggleUser(user.id)}
                                                />
                                                <span className="text-sm font-medium">
                                                    {user.firstName} {user.lastName} 
                                                    <span className="text-muted-foreground ml-2 font-normal text-xs">
                                                        ({user.email})
                                                    </span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                        <div className="text-xs text-muted-foreground text-right mt-1">
                            {selectedUserIds.length} selected
                        </div>
                    </FieldGroup>

                    <FieldGroup>
                        <FieldLabel>Title</FieldLabel>
                        <Input required placeholder="E.g. Monthly Room Check" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    </FieldGroup>
                    
                    <FieldGroup>
                        <FieldLabel>Description</FieldLabel>
                        <Textarea placeholder="Details..." className="h-20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </FieldGroup>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <FieldGroup>
                            <FieldLabel>Start Time</FieldLabel>
                            <Input required type="datetime-local" value={formData.startAt} onChange={e => setFormData({...formData, startAt: e.target.value})} />
                        </FieldGroup>
                        <FieldGroup>
                            <FieldLabel>End Time</FieldLabel>
                            <Input required type="datetime-local" value={formData.endAt} onChange={e => setFormData({...formData, endAt: e.target.value})} />
                        </FieldGroup>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>{isPending ? "Scheduling..." : "Schedule"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}