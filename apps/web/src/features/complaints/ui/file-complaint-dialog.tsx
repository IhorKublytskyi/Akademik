"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import { createComplaint } from "@/services/complaints-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field"
import { Textarea } from "@/shared/ui/textarea"

const complaintSchema = z.object({
    room_id: z.string().optional(),
    content: z.string().min(10, "Complaint must be at least 10 characters long"),
    is_anonymous: z.boolean()
})

type ComplaintFormValues = z.infer<typeof complaintSchema>

export default function FileComplaintDialog() {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()

    const { control, handleSubmit, reset, formState: { errors } } = useForm<ComplaintFormValues>({
        resolver: zodResolver(complaintSchema),
        defaultValues: { room_id: "", content: "", is_anonymous: false }
    })

    const { mutate, isPending } = useMutation({
        mutationFn: (data: any) => createComplaint(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["complaints"] })
            toast.success("Complaint filed successfully")
            reset()
            setOpen(false)
        },
        onError: () => toast.error("Failed to file complaint")
    })

    const onSubmit = (data: ComplaintFormValues) => {
        mutate({
            room_id: data.room_id ? parseInt(data.room_id) : null,
            content: data.content,
            is_anonymous: data.is_anonymous
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" /> File Complaint
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-125">
                <DialogHeader>
                    <DialogTitle>File a Complaint</DialogTitle>
                    <DialogDescription>Submit your feedback or report an incident.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">

                    <Controller name="room_id" control={control} render={({ field }) => (
                        <FieldGroup>
                            <FieldLabel>Room Number (Optional)</FieldLabel>
                            <Input placeholder="E.g. 101" type="number" {...field} />
                            {errors.room_id && <FieldError>{errors.room_id.message}</FieldError>}
                        </FieldGroup>
                    )} />

                    <Controller name="content" control={control} render={({ field }) => (
                        <FieldGroup>
                            <FieldLabel>Complaint Details</FieldLabel>
                            <Textarea placeholder="Please describe the situation..." className="min-h-25" {...field} />
                            {errors.content && <FieldError>{errors.content.message}</FieldError>}
                        </FieldGroup>
                    )} />

                    <Controller name="is_anonymous" control={control} render={({ field }) => (
                        <div className="flex items-center gap-2 mt-2">
                            <input
                                type="checkbox"
                                id="is_anonymous"
                                className="h-4 w-4 rounded border-gray-300"
                                checked={field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                            />
                            <label htmlFor="is_anonymous" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Submit anonymously
                            </label>
                        </div>
                    )} />

                    <div className="flex justify-end gap-3 mt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>{isPending ? "Submitting..." : "Submit Complaint"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}