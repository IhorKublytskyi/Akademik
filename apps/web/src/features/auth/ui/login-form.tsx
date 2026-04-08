"use client"

import { useRouter } from "next/navigation"
import { useAuthStore } from "../store/useAuthStore"
import { Controller, useForm } from "react-hook-form"
import z, { email } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { Button } from "@/shared/ui/button"
import { api } from "@/shared/api/api-client"

const loginSchema = z.object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters")
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginForm() {
    const router = useRouter()
    const setAuth = useAuthStore(s => s.setAuth)

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" }
    })

    const onSubmit = async (data: LoginFormValues) => {
        try {
            const response = await api.post("/api/core/auth/login", data)
            const { user, token } = response.data
            setAuth(user, token.accessToken, token.refreshToken)

            console.log(user);

            // const fakeUser = {
            //     id: "1",
            //     firstName: "Anton",
            //     lastName: "Hry",
            //     email: "grutoha@gmail.com",
            //     phoneNumber: "795029892",
            //     role: "admin" as "admin",
            //     status: "active" as "active",
            //     createdAt: 12312312
            // }

            // const fakeToken = {
            //     accessToken: "super_secret_access_token",
            //     refreshToken: "super_secret_refresh_token"
            // }

            // setAuth(fakeUser, fakeToken.accessToken, fakeToken.refreshToken)

            toast.success("Login successful! Welcome to Akademik")
            router.push("/dashboard")
        } catch (error: any) {
            const message = error.response?.data?.messsage || "Incorrect email or password"
            toast.error(message)
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
                <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Email</FieldLabel>
                            <Input {...field} placeholder="admin@example.com" type="email" />
                            <FieldError errors={[fieldState.error]} />
                        </Field>
                    )}
                />

                <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Password</FieldLabel>
                            <Input {...field} type="password" placeholder="••••••" />
                            <FieldError errors={[fieldState.error]} />
                        </Field>
                    )}
                />

                <Button
                    type="submit"
                    className="w-full cursor-pointer"
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting ? "Checking..." : "Submit"}
                </Button>
            </FieldGroup>
        </form>
    )
}