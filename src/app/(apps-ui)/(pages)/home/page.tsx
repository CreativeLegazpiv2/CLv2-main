"use client";

import { Infinite } from "@/components/reusable-component/Infinite";
import { Transcribed } from "@/components/reusable-component/Transcribed";
import { PofconModal } from "@/components/reusable-component/PofconModal";
import { useState, useEffect } from "react";

import { motion, useAnimation, useInView } from "framer-motion";
import { useRef } from "react";
import { checkTokenExpiration, logoutAndRedirect } from "@/services/jwt";
import { getSession } from "@/services/authservice";
import { Hero } from "./landing-page/Hero";
import { CreativeDirectory } from "./landing-page/CreativeDirectory";

import { GallerySection } from "./landing-page/GallerySection";
import { Malikhain } from "./landing-page/Malikhain";
import CreativeLaunchpad from "./landing-page/CreativeLaunchpad";
import { EventDetailsModal } from "@/components/reusable-component/EventsDetailsModal";
import { Events, ExtendedEventProps } from "./landing-page/EventsCarousel";
import { RegisterModal } from "@/components/reusable-component/RegisterModal";
import { toast, ToastContainer } from "react-toastify";
import { RightSideGen } from "../../(user)/faqs/faqs-component/GeneralFaqs";
import { VisionMission } from "./landing-page/VisionMission"; // Import the new component
import { FeaturedArtist } from "./landing-page/FeaturedArtist";

export default function PofconLandingPage() {
  const [showPofconModal, setShowPofconModal] = useState(false); // Modal state
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ExtendedEventProps | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);

  // Token validation logic inside useEffect
  useEffect(() => {
    const validateToken = async () => {
      const token = getSession();
      if (token) {
        const isTokenExpired = await checkTokenExpiration(token);
        if (isTokenExpired) {
          logoutAndRedirect();
          return;
        }
      }
    };

    validateToken();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleEventClick = (event: ExtendedEventProps) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleRegistrationSuccess = () => {
    setShowModal(false);
    console.log("Registration successful!");
  };

  const handleRegisterClick = () => {
    setShowModal(true); // Open the RegisterModal
  };

  return (
    <main className="w-full h-fit text-primary-2 ">
      <ToastContainer className={`z-[5000]`} />
      <ScrollAnimationSection>
        <Hero />
      </ScrollAnimationSection>

      <ScrollAnimationSection>
        <VisionMission />
      </ScrollAnimationSection>

      <CreativeDirectory />

      <ScrollAnimationSection>
        <Events onEventClick={handleEventClick} />
      </ScrollAnimationSection>

      {/* <ScrollAnimationSection>
        <CreativeLaunchpad />
      </ScrollAnimationSection>
 */}

      <ScrollAnimationSection>
  <FeaturedArtist />
</ScrollAnimationSection>
      {/* Add the Vision & Mission section here */}


      <ScrollAnimationSection>
        <GallerySection />
      </ScrollAnimationSection>

      <ScrollAnimationSection>
        <Malikhain />
      </ScrollAnimationSection>

      <ScrollAnimationSection>
        <div className="w-full mx-auto py-[10dvh] flex flex-col gap-4 bg-palette-5 relative">
        <img src="/images/homepage/5.png" className="w-fit h-fit absolute bottom-[30%] right-[5%]" alt="" />
        <div className="w-8 h-8 rounded-full bg-palette-2 absolute bottom-[20%] right-[15%]"></div>
        <div className="w-6 h-6 rounded-md bg-palette-3 absolute bottom-[10%] right-[10%]"></div>
          <motion.img
            className="absolute lg:-top-20 lg:left-44 lg:h-56 lg:w-56 h-32 w-32 z-10 "
            src="/images/landing-page/icon.png"
            alt=""
            initial={{ rotate: -10, scale: 0.5 }}
            animate={{ rotate: 0, scale: 0.75 }}
            transition={{
              type: "spring",
              bounce: 0.4,
              duration: 1
            }}
          />

          <div className="w-full max-w-screen-lg mx-auto flex flex-col gap-6 z-20">
            <div className="w-full lg:max-w-[80%] max-w-[90%] mx-auto">
              <h1 className="font-bold md:text-6xl text-4xl uppercase text-palette-1 px-4">Frequently asked question</h1>
            </div>
            <RightSideGen
              border="border border-palette-2"
              hidden="hidden"
              textColor="text-palette-2"
              iconColor="text-palette-2"
              texthover="group-hover:text-white"
              hoverColor="hover:bg-palette-2"
              backgroundColor="bg-palette-5"
            />

          </div>
        </div>
      </ScrollAnimationSection>

    

      {showPofconModal && (
        <PofconModal setShowPofconModal={setShowPofconModal} />
      )}

      {showEventDetails && selectedEvent && (
        <EventDetailsModal
          setShowEventDetails={setShowEventDetails}
          eventDetails={selectedEvent}
          onRegisterClick={handleRegisterClick} // Pass the handler
        />
      )}

      {/* Register Modal */}
      {showModal && selectedEvent && (
        <RegisterModal
          setShowPofconModal={setShowModal}
          eventId={parseInt(selectedEvent.id)}
          eventTitle={selectedEvent.title}
          eventLocation={selectedEvent.location}
          eventStartTime={selectedEvent.start_time}
          eventEndTime={selectedEvent.end_time}
          contact={selectedEvent.contact} // Pass contact information
          onSuccess={() => {
            toast.success("Successfully Registered!", {
              position: "bottom-right", // Position of the toast
              autoClose: 3000, // Auto-close after 3 seconds
            });
          }}
        />
      )}
    </main>
  );
}
const ScrollAnimationSection: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      className="w-full h-fit"
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
    >
      {children}
    </motion.div>
  );
};