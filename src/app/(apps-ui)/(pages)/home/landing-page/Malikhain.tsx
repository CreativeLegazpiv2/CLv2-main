"use client";
import { motion } from "framer-motion";

export const Malikhain = () => {
  // Function to handle Learn More button click
  const handleLearnMoreClick = () => {
    window.location.href = "https://www.dti.gov.ph/archives/2nd-creative-industries-summit-celebrates-malikhaing-pinoy/";
  };

  return (
    <div className="w-full md:h-dvh h-fit md:py-0 py-12 bg-secondary-1 bg-[url('/images/landing-page/malikhainbg.png')] bg-no-repeat bg-cover flex justify-center items-center">
      <div className="w-full h-full flex flex-col md:gap-8 gap-4 justify-center items-center md:max-w-[75%] max-w-[95%] max-h-[80%] mx-auto bg-palette-5 rounded-[2.5rem] p-6">
        <img className="w-[80%] mx-auto" src="../images/landing-page/malikhain.png" alt="" />
        <p className="text-lg text-secondary-2 sm:text-center w-full md:max-w-[70%] p-4 text-justify">
          Unveiling at the Philippine Creative Industries Summit, the Malikhaing
          Pinoy Program, an initiative spearheaded by the DTI, is set to
          redefine the landscape of creativity in the Philippines. This
          innovative program is strategically designed to leverage Filipino
          ingenuity as a catalyst for economic growth and recovery. Join us as
          we introduce a transformative initiative dedicated to cultivating a
          resilient and inclusive creative ecosystem, paving the way for a
          dynamic future in the Philippines. Witness the power of creativity at
          the heart of economic progress with the Malikhaing Pinoy Program.
        </p>
      </div>
    </div>
  );
};