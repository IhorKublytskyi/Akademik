"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { enUS } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"

import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { getMyEvents } from "@/services/event-service"
import { AppEvent } from "@/shared/types/events"

import AdminInspectionDialog from "@/features/events/ui/admin-inspection-dialog"
import EventDetailsDialog from "@/features/events/ui/event-details-dialog"

interface CalendarEvent extends AppEvent {
    start: Date
    end: Date
    groupKey?: string
    residentIds?: number[]
}

const locales = { "en-US": enUS }
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales })

export default function EventsPage() {
    const currentUser = useAuthStore((state) => state.user)
    const isAdmin = currentUser?.role === "Admin"

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
    const [selectedSlot, setSelectedSlot] = useState<{ start: Date, end: Date } | null>(null)

    const [currentDate, setCurrentDate] = useState<Date>(new Date())
    const [currentView, setCurrentView] = useState<View>("month")

    const { data: events = [], isLoading } = useQuery({
        queryKey: ["events"],
        queryFn: () => getMyEvents()
    })

    const calendarEvents = events.reduce((acc: CalendarEvent[], event: AppEvent) => {
        const isAdminEvent = event.source === "ADMIN"
        const groupKey = isAdminEvent
            ? `${event.title}-${event.start_at}-${event.end_at}`
            : `user-${event.id}`

        const existingEvent = acc.find(e => e.groupKey === groupKey)

        if (existingEvent) {
            if (isAdminEvent && existingEvent.residentIds && !existingEvent.residentIds.includes(event.user_id)) {
                existingEvent.residentIds.push(event.user_id)
            }
        } else {
            acc.push({
                ...event,
                groupKey,
                residentIds: [event.user_id],
                start: new Date(event.start_at + "Z"),
                end: new Date(event.end_at + "Z"),
            })
        }

        return acc
    }, [])

    const handleSelectSlot = (slotInfo: { start: Date, end: Date }) => {
        setSelectedEvent(null)
        setSelectedSlot(slotInfo)
        setIsDialogOpen(true)
    }

    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedSlot(null)
        setSelectedEvent(event)
        setIsDialogOpen(true)
    }

    const eventPropGetter = (event: CalendarEvent) => {
        const isInspection = event.type === "ROOM_INSPECTION" || event.source === "ADMIN"
        return {
            style: {
                backgroundColor: isInspection ? "#ef4444" : "#3b82f6",
                borderRadius: "6px",
                border: "none",
                color: "white",
                fontWeight: "500",
                fontSize: "14px"
            }
        }
    }

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading calendar...</div>

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
                    <p className="text-muted-foreground">Manage your personal schedule and building events.</p>
                </div>

                {isAdmin && <AdminInspectionDialog />}
            </div>

            <div className="flex-1 bg-card rounded-xl border shadow-sm p-4 overflow-hidden">
                <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%" }}
                    selectable

                    date={currentDate}
                    view={currentView}
                    onNavigate={(date) => setCurrentDate(date)}
                    onView={(view) => setCurrentView(view)}

                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventPropGetter}
                    views={["month", "week", "day"]}
                />
            </div>

            <EventDetailsDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                selectedEvent={selectedEvent}
                selectedSlot={selectedSlot}
            />
        </div>
    )
}