
import { Subscribe } from "@/components/reusable-component/Subscribe";
import { EventHeroPage } from "./events/EventHeroPage";
import { CalendarEvent } from "./events/CalendarEvent";
import { UpcomingEvents } from "./events/UpcomingEvents";


export default function EventsPage() {
    return (
        <main className="w-full h-fit bg-gradient-to-br from-palette-5 to-palette-5/90 py-[10dvh]">
            <EventHeroPage />
            <UpcomingEvents />
            <CalendarEvent />
            
        </main>
    );
}