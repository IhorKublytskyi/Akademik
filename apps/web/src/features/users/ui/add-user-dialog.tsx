"use client"

import { api } from "@/shared/api/api-client"
import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

const registerSchema = z.object({
    email: z.string().email("Invalid email"),
    name: z.string().min(2, "Enter first and last name"),
    password: z.string().min(6, "Password must be at least 6 characters")
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function AddUserDialog() {
    const [open, setOpen] = useState(false)

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { email: "", name: "", password: "" },
    })

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            await api.post("/api/core/auth/register", {
                ...data,
                role: "user"
            })

            toast.success("The user has been successfully added!")
            form.reset()
            setOpen(false)
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error creating a user")
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    Add a user
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New user</DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
                    <FieldGroup>
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Full name</FieldLabel>
                                    <Input {...field} placeholder="John Smith" />
                                    <FieldError errors={[fieldState.error]} />
                                </Field>
                            )}
                        />
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Email</FieldLabel>
                                    <Input {...field} placeholder="student@example.com" />
                                    <FieldError errors={[fieldState.error]} />
                                </Field>
                            )}
                        />
                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Temporary password</FieldLabel>
                                    <Input {...field} placeholder="••••••" />
                                    <FieldError errors={[fieldState.error]} />
                                </Field>
                            )}
                        />
                        <Button type="submit" className="w-full mt-4 cursor-pointer" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Creating..." : "Save"}
                        </Button>
                    </FieldGroup>
                </form>
            </DialogContent>
        </Dialog>
    )
}