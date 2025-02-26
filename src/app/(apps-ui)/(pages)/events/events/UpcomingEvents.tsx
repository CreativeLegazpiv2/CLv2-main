"use client";

import { EventDetailsModal } from "@/components/reusable-component/EventsDetailsModal";
import { PofconModal } from "@/components/reusable-component/PofconModal";
import { RegisterModal } from "@/components/reusable-component/RegisterModal";
import { SkeletonEventGrid } from "@/components/Skeletal/eventSKeleton";
import { Icon } from "@iconify/react/dist/iconify.js";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ButtonProp {
  list: boolean;
  setList: React.Dispatch<React.SetStateAction<boolean>>;
}

interface AdminEvent {
  id: number;
  title: string;
  location: string;
  date: string;
  start_time: string;
  end_time: string;
  desc: string;
  image_path: string;
  created_at: string;
  status: boolean;
}

// Helper to group events by date
const groupEventsByDate = (events: AdminEvent[]) => {
  return events.reduce((acc: { [key: string]: AdminEvent[] } = {}, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {});
};

export const UpcomingEvents = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonthYear, setCurrentMonthYear] = useState("");
  const [list, setList] = useState<boolean>(true);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const updateMonthYear = (date: Date) => {
    const options = { month: "long" as const, year: "numeric" as const };
    setCurrentMonthYear(date.toLocaleDateString("en-US", options));
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
    updateMonthYear(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
    updateMonthYear(newDate);
  };

  useEffect(() => {
    updateMonthYear(currentDate);
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    setIsLoading(true); // Set loading to true before fetching
    try {
      const response = await fetch("/api/admin-events");
      if (!response.ok) throw new Error("Error fetching events");
      const fetchedEvents: AdminEvent[] = await response.json();

      // Get the current date and set time to the start of the day
      const currentDateObj = new Date();
      currentDateObj.setHours(0, 0, 0, 0); // Strip time component

      // Filter events to show only those on or after the current date and with status true
      const upcomingEvents = fetchedEvents.filter((event) => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0); // Strip time component from event date

        // Only include events on or after the current date and with status true
        return eventDate >= currentDateObj && event.status !== false;
      });

      setEvents(upcomingEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false); // Set loading to false after fetching
    }
  };

  const [showPofconModal, setShowPofconModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false); // State for EventDetailsModal
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setList(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full h-fit min-h-dvh  mx-auto py-[15dvh] overflow-hidden flex flex-col gap-6 relative bg-gradient-to-br from-palette-5 to-palette-5/90">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-64 bg-palette-2/30 -skew-y-6 translate-y-20 transform-gpu"></div>
        <div className="absolute bottom-0 left-0 w-full h-64 bg-palette-1/20 -skew-y-6 -translate-y-32 transform-gpu"></div>
      </div>

      {/* Floating decorative shapes */}
      <div className="absolute w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-palette-2/10 top-20 -left-16 opacity-60"></div>
      <div className="absolute w-40 h-40 md:w-64 md:h-64 rounded-full border-4 border-palette-1/10 -bottom-20 -right-20 opacity-60"></div>
      <div className="absolute w-24 h-24 rotate-45 border-2 border-palette-2/10 top-40 right-20 opacity-60"></div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full text-center"
      >

        <h1 className="font-extrabold text-5xl sm:text-6xl lg:text-7xl text-palette-1 uppercase">
          Upcomin<span className="text-palette-2">g</span> Events
        </h1>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="w-full h-fit flex justify-center items-center text-center pb-12"
      >
        <div className="w-fit flex gap-6 justify-center items-center">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Icon icon="ph:arrow-left-bold" width="24" height="24" />
          </button>
          <h1 className="font-bold text-2xl sm:text-3xl uppercase">
            {currentMonthYear}
          </h1>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Icon icon="ph:arrow-right-bold" width="24" height="24" />
          </button>
        </div>
      </motion.div>
      {isLoading ? (
        <SkeletonEventGrid list={list} />
      ) : (
        <EventGrid
          currentDate={currentDate}
          list={list}
          setList={setList}
          events={events}
          setShowPofconModal={setShowPofconModal}
          setSelectedEvent={setSelectedEvent}
          setShowEventDetailsModal={setShowEventDetailsModal} // Pass the modal state setter
        />
      )}
      {showPofconModal && selectedEvent !== null && (
        <RegisterModal
          setShowPofconModal={setShowPofconModal}
          eventId={selectedEvent.id}
          eventTitle={selectedEvent.title}
          eventLocation={selectedEvent.location}
          eventStartTime={selectedEvent.start_time}
          eventEndTime={selectedEvent.end_time}
          onSuccess={() => {
            toast.success("Successfully Registered!", {
              position: "bottom-right",
              autoClose: 3000,
            });
          }}
        />
      )}
      {showEventDetailsModal && selectedEvent !== null && (
        <EventDetailsModal
          setShowEventDetails={setShowEventDetailsModal} // Pass the modal state setter
          eventDetails={{
            id: selectedEvent.id.toString(),
            eventTitle: selectedEvent.title,
            start_time: selectedEvent.start_time,
            end_time: selectedEvent.end_time,
            location: selectedEvent.location,
            date: selectedEvent.date,
            desc: selectedEvent.desc,
            title: selectedEvent.title,
            image_path: selectedEvent.image_path,
          }}
          onRegisterClick={() => {
            setShowEventDetailsModal(false); // Close the details modal
            setShowPofconModal(true); // Open the registration modal
          }}
        />
      )}
      <ToastContainer />
    </div>
  );
};

const EventGrid: React.FC<{
  currentDate: Date;
  list: boolean;
  setList: React.Dispatch<React.SetStateAction<boolean>>;
  setShowPofconModal: React.Dispatch<React.SetStateAction<boolean>>;
  events: AdminEvent[];
  setSelectedEvent: React.Dispatch<React.SetStateAction<AdminEvent | null>>;
  setShowEventDetailsModal: React.Dispatch<React.SetStateAction<boolean>>; // Add this prop
}> = ({
  currentDate,
  list,
  setList,
  events,
  setShowPofconModal,
  setSelectedEvent,
  setShowEventDetailsModal, // Destructure the prop
}) => {
    // Filter events to show only those in the selected month
    const filteredEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      const selectedMonth = currentDate.getMonth();
      const selectedYear = currentDate.getFullYear();
      return (
        eventDate.getMonth() === selectedMonth &&
        eventDate.getFullYear() === selectedYear
      );
    });

    // Group events by date
    const groupedEvents = groupEventsByDate(filteredEvents);
    const sortedDates = Object.keys(groupedEvents).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    return (
      <div className="w-full h-fit flex flex-col gap-12 relative max-w-[90%] mx-auto">
        <div className="w-full flex justify-end items-center">
          <ListButton list={list} setList={setList} />
        </div>
        {sortedDates.length > 0 ? (
          sortedDates.map((date, groupIndex) => (
            <div key={date}>
              <h1 className="font-bold text-3xl sm:text-4xl uppercase pb-8 text-center md:text-left">
                {(() => {
                  const dateObject = new Date(date);
                  const day = dateObject.getDate().toString().padStart(2, "0");
                  const weekday = dateObject.toLocaleDateString("en-US", {
                    weekday: "long",
                  });
                  return `${day} - ${weekday}`;
                })()}
              </h1>
              <div
                className={`w-full h-fit ${list
                    ? "flex flex-col gap-4"
                    : "grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8"
                  }`}
              >
                {groupedEvents[date].map((event) => (
                  <EventCard
                    event={event}
                    key={event.id}
                    groupIndex={groupIndex}
                    list={list}
                    setShowPofconModal={setShowPofconModal}
                    setSelectedEvent={setSelectedEvent}
                    setShowEventDetailsModal={setShowEventDetailsModal} // Pass the prop
                  />
                ))}
              </div>
              <div
                className={`w-full h-[1px] bg-primary-1 mt-12 ${list ? "hidden" : ""
                  }`}
              ></div>
            </div>
          ))
        ) : (
          <p className="text-center text-2xl font-semibold mt-12">
            No events available for this month
          </p>
        )}
      </div>
    );
  };

const EventCard: React.FC<{
  event: AdminEvent;
  groupIndex: number;
  list: boolean;
  setShowPofconModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedEvent: React.Dispatch<React.SetStateAction<AdminEvent | null>>;
  setShowEventDetailsModal: React.Dispatch<React.SetStateAction<boolean>>; // Add this prop
}> = ({ event, groupIndex, list, setShowPofconModal, setSelectedEvent, setShowEventDetailsModal }) => {
  const colorClasses = getColorClasses(groupIndex);

  const formatTimeTo12Hour = (time: string): string => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, backgroundColor: "transparent" }}
      transition={{ duration: 0.2 }}
      className={`w-full ${list
          ? "flex flex-row gap-6 items-center p-6 rounded-lg shadow-md"
          : "flex flex-col gap-4 p-6 rounded-lg shadow-md"
        } ${colorClasses.bgColor} border-2 ${colorClasses.border
        } transition-all duration-300 group`}
    >
      <div className={`${list ? "h-24 w-44" : "h-48 w-full"}`}>
        <img
          className={`object-cover ${list ? "w-44 h-24" : "h-48 w-full"}`}
          src={event.image_path || "../images/events/cover.png"}
          alt={event.title}
        />
      </div>
      <div
        className={`w-full flex gap-4 ${list ? "flex-col-reverse" : "flex-col"
          }`}
      >
        <div className="w-full  flex justify-between items-center">
          <div className="w-fit flex flex-col leading-3 gap-2">
            <p className={`font-bold group-hover:${colorClasses.textColor}`}>
              {formatTimeTo12Hour(event.start_time)} -{" "}
              {formatTimeTo12Hour(event.end_time)}
            </p>
            <p className="text-sm capitalize font-medium group-hover:${colorClasses.textColor}">
              {event.location}
            </p>
          </div>
          <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}>
            <Icon
              className={`rotate-180 -mt-4 cursor-pointer ${list ? "hidden" : "block"
                } group-hover:${colorClasses.textColor}`}
              icon="ph:arrow-left-bold"
              width="25"
              height="25"
            />
          </motion.div>
        </div>
        <div className="w-full">
          <h1
            className={`w-full text-xl font-semibold ${list ? "max-w-full" : "max-w-56"
              } group-hover:${colorClasses.textColor}`}
          >
            {event.title}
          </h1>
        </div>
      </div>
      <EventRegisterButton
        colorClasses={colorClasses}
        list={list}
        setShowPofconModal={setShowPofconModal}
        setSelectedEvent={() => {
          setSelectedEvent(event);
          setShowEventDetailsModal(true); // Open the EventDetailsModal
        }}
      />
    </motion.div>
  );
};

const EventRegisterButton = ({
  colorClasses,
  list,
  setShowPofconModal,
  setSelectedEvent,
}: {
  colorClasses: any;
  list: boolean;
  setShowPofconModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedEvent: () => void;
}) => {
  return (
    <motion.button
      className={`px-6 py-1.5 bg-primary-1 text-secondary-2 font-medium transition-colors duration-300 ease-in-out 
        ${colorClasses.bgHover} 
        ${colorClasses.textHover}
        ${list ? "w-fit px-6 whitespace-nowrap" : "w-full"}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        setSelectedEvent();
      }}
    >
      Register for free
    </motion.button>
  );
};

const ListButton: React.FC<ButtonProp> = ({ list, setList }) => {
  return (
    <motion.button
      className="w-44 py-1.5 bg-secondary-1 border-2 border-secondary-2 text-secondary-2 font-medium transition-colors duration-300 ease-in-out md:block hidden rounded-lg"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setList((prev) => !prev)}
    >
      {list ? "Show as Grid" : "Show as List"}
    </motion.button>
  );
};

const getColorClasses = (index: number) => {
  switch (index % 3) {
    case 0:
      return {
        bgColor: "bg-shade-2",
        textColor: "text-shade-3",
        border: "border-shade-2",
        bgHover: "hover:bg-shade-3",
        textHover: "hover:text-white",
      };
    case 1:
      return {
        bgColor: "bg-shade-5",
        textColor: "text-shade-4",
        border: "border-shade-5",
        bgHover: "hover:bg-shade-4",
        textHover: "hover:text-white",
      };
    case 2:
      return {
        bgColor: "bg-shade-1",
        textColor: "text-primary-3",
        border: "border-shade-1",
        bgHover: "hover:bg-primary-3",
        textHover: "hover:text-white",
      };
    default:
      return {
        bgColor: "bg-gray-500",
        textColor: "text-gray-500",
        border: "border-gray-500",
        bgHover: "hover:bg-gray-500",
        textHover: "hover:text-white",
      };
  }
};