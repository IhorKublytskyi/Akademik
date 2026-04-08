import { SidebarProvider, SidebarTrigger } from "@/shared/ui/sidebar"
import { AppSidebar } from "@/features/dashboard/ui/app-sidebar"

export default function DashboardLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-muted/20">
                <AppSidebar />
                <main className="flex-1 flex flex-col p-6">
                    <header className="flex items-center mb-6">
                        <SidebarTrigger className="mr-4" />
                    </header>
                    {children}
                </main>
            </div>
        </SidebarProvider>
    )
}