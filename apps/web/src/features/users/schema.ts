import { z } from "zod"

export const editUserSchema = z.object({
    id: z.number(),
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().nullable().optional(),
    status: z.enum(["Active", "Blocked"]),
})

export type EditUserFormValues = z.infer<typeof editUserSchema>