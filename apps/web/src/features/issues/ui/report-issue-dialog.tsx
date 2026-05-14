"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import { createIssue } from "@/services/issues-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field"
import { Textarea } from "@/shared/ui/textarea"

const issueSchema = z.object({
    roomId: z.string().min(1, "Room is required"),
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
    category: z.string().min(1, "Category is required"),
    priority: z.enum(["LOW", "NORMAL", "HIGH", "CRITICAL"]),
    description: z.string().min(10, "Description must be at least 10 characters")
})

type IssueFormValues = z.infer<typeof issueSchema>

export default function ReportIssueDialog() {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()

    const { control, handleSubmit, reset, formState: { errors } } = useForm<IssueFormValues>({
        resolver: zodResolver(issueSchema),
        defaultValues: {
            roomId: "",
            title: "",
            category: "",
            priority: "NORMAL",
            description: ""
        }
    })

    const { mutate, isPending } = useMutation({
        mutationFn: (data: any) => createIssue(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["issues"] })
            toast.success("Issue reported successfully")
            reset()
            setOpen(false)
        },
        onError: () => toast.error("Failed to report issue")
    })

    const onSubmit = (data: IssueFormValues) => {
        mutate({
            room_id: parseInt(data.roomId),
            title: data.title,
            category: data.category,
            priority: data.priority,
            description: data.description
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" /> Report Issue
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-125">
                <DialogHeader>
                    <DialogTitle>Report Maintenance Issue</DialogTitle>
                    <DialogDescription>Describe the problem in your room.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">

                    <div className="grid grid-cols-2 gap-4">
                        <Controller name="roomId" control={control} render={({ field }) => (
                            <FieldGroup>
                                <FieldLabel>Room Number</FieldLabel>
                                <Input placeholder="E.g. 101" type="number" {...field} />
                                {errors.roomId && <FieldError>{errors.roomId.message}</FieldError>}
                            </FieldGroup>
                        )} />

                        <Controller name="priority" control={control} render={({ field }) => (
                            <FieldGroup>
                                <FieldLabel>Priority</FieldLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="Select priority" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Low</SelectItem>
                                        <SelectItem value="NORMAL">Normal</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                        <SelectItem value="CRITICAL">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FieldGroup>
                        )} />
                    </div>

                    <Controller name="title" control={control} render={({ field }) => (
                        <FieldGroup>
                            <FieldLabel>Short Title</FieldLabel>
                            <Input placeholder="E.g. Leaking pipe in the bathroom" {...field} />
                            {errors.title && <FieldError>{errors.title.message}</FieldError>}
                        </FieldGroup>
                    )} />

                    <Controller name="category" control={control} render={({ field }) => (
                        <FieldGroup>
                            <FieldLabel>Category</FieldLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                                    <SelectItem value="Electrical">Electrical</SelectItem>
                                    <SelectItem value="Furniture">Furniture</SelectItem>
                                    <SelectItem value="Internet">Internet</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.category && <FieldError>{errors.category.message}</FieldError>}
                        </FieldGroup>
                    )} />

                    <Controller name="description" control={control} render={({ field }) => (
                        <FieldGroup>
                            <FieldLabel>Full Description</FieldLabel>
                            <Textarea placeholder="Please provide more details about the problem..." className="min-h-25" {...field} />
                            {errors.description && <FieldError>{errors.description.message}</FieldError>}
                        </FieldGroup>
                    )} />

                    <div className="flex justify-end gap-3 mt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>{isPending ? "Submitting..." : "Submit Issue"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}