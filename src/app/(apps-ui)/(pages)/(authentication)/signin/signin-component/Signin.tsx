"use client";

import { Logo } from "@/components/reusable-component/Logo";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Form } from "./SiginForm";
import { ForgotPass } from "./ForgotPass";
import { X } from "lucide-react";

export const Signin = () => {
  return (
    <div className="w-full h-dvh lg:py-[20dvh] py-[15dvh] bg-[url('/images/signup/background.jpg')] bg-cover bg-no-repeat bg-center relative">
      {/* Full height overlay covering the entire div */}
      <div className="absolute inset-0 w-full h-full bg-black/50"></div> {/* Increased opacity for better contrast */}

      {/* Content */}
      <div className="relative w-full h-full xl:max-w-[60%] sm:max-w-[70%] max-w-[95%] mx-auto flex flex-col gap-10 justify-center items-center">
        <AccountCreation />
      </div>
      <ToastContainer position="top-right" />
    </div>
  );
};

const AccountCreation = () => {
  // State to track if "Forgot password" was clicked
  const [forgotPassword, setForgotPassword] = useState(false);
  const [showSIgnup, setShowSignup] = useState(false);

  // Function to toggle the forgot password state
  const handleForgotPasswordClick = () => {
    setForgotPassword(true);
    setShowSignup(false);
  };

  // Function to reset to the login form
  const handleBackToLogin = () => {
    setForgotPassword(false);
  };

  return (
    <div className="w-full h-full relative">

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full h-full flex bg-palette-3 rounded-2xl z-50 relative shadow-2xl"
      >
        <div className="w-full h-full justify-center items-center sm:p-10 p-6 lg:flex hidden">
          <Logo color="text-palette-5" width={"auto"} height={"auto"} />
        </div>
        <div className="w-full h-full flex flex-col bg-palette-5 md:p-4 p-6 text-palette-1 lg:rounded-r-2xl lg:rounded-none rounded-2xl gap-12 justify-center items-center sm:p-10">
          <div className="w-full h-fit flex flex-col gap-4 justify-end items-center">
            <div className="w-full h-fit">
              <span className="title text-3xl tracking-wider uppercase">{forgotPassword ? "Forgot" : "Login"}</span>
              <h1 className="uppercase text-5xl font-bold poppins">{forgotPassword ? "Password" : "Explore"}</h1>
            </div>

            {/* Conditionally render either the login form or forgot password */}
            {forgotPassword ? (
              <ForgotPass handleBackToLogin={handleBackToLogin} />
            ) : (
              <Form />
            )}

            {/* Footer Links */}
            <div className="w-full h-fit flex lg:flex-row flex-col gap-4 justify-between items-center text-sm max-w-[95%]">
              {!forgotPassword && (
                <>
                  {/* Left: Signup as Buyer */}
                  <span
                    className="py-1 rounded-md whitespace-nowrap cursor-pointer hover:text-palette-2 duration-300 "
                    onClick={handleForgotPasswordClick}
                  >
                    Forgot password?
                  </span>

                  {/* Right: Forgot password + Apply as Artist */}

                </>
              )}
              {!showSIgnup && !forgotPassword && (
                <span className="cursor-pointer hover:text-palette-2 duration-300 " onClick={() => setShowSignup(!showSIgnup)}>Register Now</span>
              )}
              {showSIgnup && (
                <div className="flex items-center gap-4">
                  <Link href="/signupBuyer" className="text-palette-1 hover:text-palette-2 duration-300  whitespace-nowrap cursor-pointer">
                    Signup as Buyer
                  </Link>
                  <Link href="/applyartist" className="text-palette-1 hover:text-palette-2 duration-300  whitespace-nowrap cursor-pointer">
                    Apply as Artist
                  </Link>

                  <span><X size={20} className="bg-palette-1 text-palette-5 rounded-md cursor-pointer hover:bg-palette-2" onClick={() => setShowSignup(!showSIgnup)}/></span>
                </div>

              )}



            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
