"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { getQRCodes, createQRCode } from "@/services/qr-service"
import { QRCode } from "@/shared/types/qr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { Skeleton } from "@/shared/ui/skeleton"
import { RefreshCw, ShieldCheck } from "lucide-react"
import QRCodeSVG from "react-qr-code"

export default function ResidentQrPage() {
    const [hasAttempted, setHasAttempted] = useState(false)
    const queryClient = useQueryClient()
    const currentUser = useAuthStore((state) => state.user)
    const [timeLeft, setTimeLeft] = useState<string>("")

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ["my-qr-code"],
        queryFn: () => getQRCodes(1, 10),
        refetchOnWindowFocus: true
    })

    const { mutate: generateNewQr, isPending: isGenerating } = useMutation({
        mutationFn: () => {
            const now = new Date()
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)

            return createQRCode({
                room_id: 0,
                access_type: "BUILDING",
                valid_from: now.toISOString(),
                valid_to: oneHourLater.toISOString()
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-qr-code"] })
        }
    })

    const activeQr = data?.items?.find((qr: QRCode) => {
        const isStatusActive = qr.status === "ACTIVE"
        const isNotExpired = new Date(qr.valid_to + "Z") > new Date()
        return isStatusActive && isNotExpired
    })

    useEffect(() => {
        if (!isLoading && !activeQr && !isGenerating && !hasAttempted) {
            setHasAttempted(true)
            generateNewQr()
        }
    }, [isLoading, activeQr, isGenerating, hasAttempted, generateNewQr])

    useEffect(() => {
        if (!activeQr) return

        const interval = setInterval(() => {
            const now = new Date().getTime()
            const expiry = new Date(activeQr.valid_to + "Z").getTime()
            const diff = expiry - now

            if (diff <= 0) {
                clearInterval(interval)
                setTimeLeft("Expired")
                queryClient.invalidateQueries({ queryKey: ["my-qr-code"] })
            } else {
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                const seconds = Math.floor((diff % (1000 * 60)) / 1000)
                setTimeLeft(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [activeQr, queryClient])

    if (isLoading || (isGenerating && !activeQr)) {
        return (
            <div className="flex justify-center items-center h-96">
                <Card className="w-80 text-center">
                    <CardContent className="pt-6 flex flex-col items-center gap-4">
                        <Skeleton className="h-48 w-48 rounded-md" />
                        <Skeleton className="h-4 w-32" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex justify-center items-center pt-6">
            <Card className="w-full max-w-sm shadow-lg border-muted">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
                        <ShieldCheck className="text-green-500 h-5 w-5" />
                        Building Access Pass
                    </CardTitle>
                    <CardDescription>
                        {currentUser?.firstName} {currentUser?.lastName}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6 pt-4">

                    {activeQr ? (
                        <div className="bg-white p-4 rounded-xl border shadow-inner flex flex-col items-center justify-center">
                            <QRCodeSVG value={activeQr.token} size={200} level="M" />
                        </div>
                    ) : (
                        <div className="h-58.5 flex items-center justify-center text-muted-foreground">
                            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}

                    <div className="w-full flex flex-col items-center gap-2 text-center">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">
                            Main Entrance Only
                        </div>

                        {activeQr && (
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="font-mono text-sm px-3 py-0.5">
                                    Expires in: {timeLeft}
                                </Badge>
                                {isFetching && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}