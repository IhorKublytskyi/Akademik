import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "@/app/globals.css"
import { QueryProvider } from "@/shared/api/query-provider"
import { TooltipProvider } from "@/shared/ui/tooltip"
import { Toaster } from "sonner"
import { AuthProvider } from "@/shared/providers/auth-provider"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

export const metadata: Metadata = {
    title: "Akademik",
    description: "Dormitory Management System",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
            >
                <QueryProvider>
                    <AuthProvider>
                        <TooltipProvider>
                            {children}
                        </TooltipProvider>
                        <Toaster position="top-center" richColors />
                    </AuthProvider>
                </QueryProvider>
            </body>
        </html>
    )
}
