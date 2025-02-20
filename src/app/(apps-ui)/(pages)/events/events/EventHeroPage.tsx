"use client";

import { useEffect, useState } from "react";

interface Event {
  title: string;
  created_at: string;
  image_url: string;
}

export const EventHeroPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/featured/fetch");
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const result = await response.json();
        const fetchedEvents: Event[] = result.data;

        if (fetchedEvents.length > 0) {
          setEvents(fetchedEvents);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const totalSlides = events.length;

  // Auto-change event every 5 seconds
  useEffect(() => {
    if (totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(interval);
  }, [totalSlides]);

  // Handle the end of the transition
  const handleTransitionEnd = () => {
    if (currentIndex === totalSlides) {
      setIsTransitioning(false);
      setCurrentIndex(0); // Reset to the first image
    }
  };

  // Delay before restarting the transition
  useEffect(() => {
    if (!isTransitioning) {
      const timeout = setTimeout(() => {
        setIsTransitioning(true);
      }, 50); // Match this delay with the animation duration
      return () => clearTimeout(timeout);
    }
  }, [isTransitioning]);

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-dvh overflow-hidden">
      {/* Image container with sliding effect */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div
          className={`flex w-full h-full ${isTransitioning ? "transition-transform duration-500 ease-in-out" : ""}`}
          style={{
            transform: `translateX(-${(currentIndex % totalSlides) * 100}%)`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {/* Duplicate the events and append the first image for seamless looping */}
          {[...events, events[0]].map((event, index) => (
            <div key={index} className="w-full h-full flex-shrink-0">
              <div
                className="w-full h-full bg-cover bg-no-repeat bg-center"
                style={{
                  backgroundImage: `url('${event.image_url || "/images/events/hero.jpg"}')`,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/20" />

      {/* Event Title */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-4xl text-center group">
          <h1 className="text-palette-5 font-bold text-sm sm:text-base lg:text-lg leading-tight mb-8 drop-shadow-custom">
            {events[currentIndex].title}
          </h1>
        </div>
      </div>
    </div>
  );
};
