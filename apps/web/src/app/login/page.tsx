import LoginForm from "@/features/auth/ui/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md shadow-xl border-none">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold tracking-tight">Akademik</CardTitle>
                    <CardDescription>
                        Dormitory Management System
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm />
                </CardContent>
            </Card>
        </div>
    );
}