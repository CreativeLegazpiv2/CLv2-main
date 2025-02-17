"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Logo } from "@/components/reusable-component/Logo";
import { signupBuyer } from "@/services/authservice";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ToastContainer } from "react-toastify";
import { Gender } from "@/services/authservice"
import { Step1 } from "./Step1";
import { Step2 } from "./Step2";
import { Step3 } from "./Step3";
import { Step4 } from "./Step4";
import { Step5 } from "./Step5";


interface UserDetail {
  username: string;
  email: string;
  password: string;
  name: string;
  bday: string;
  address: string;
  bio: string;
  mobileNo: string;
  instagram: string;
  facebook: string;
  twitter: string;
  portfolioLink: string;
  gender: Gender;
}

interface InputProps {
  name: keyof UserDetail;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder: string;
  icon: string;
  type?: string;
}

interface SelectProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder: string;
  icon: string;
  options: Array<{ value: string; label: string }>;
}

export const SignupBuyer = () => {
  return (
    <div className="w-full h-dvh lg:py-[20dvh] py-[15dvh] bg-[url('/images/signup/background.jpg')] bg-cover bg-no-repeat bg-center relative">
      {/* Full height overlay covering the entire div */}
      <div className="absolute inset-0 w-full h-full bg-black/50"></div> {/* Increased opacity for better contrast */}

      {/* Content */}
      <div className="relative w-full h-full xl:max-w-[60%] sm:max-w-[70%] max-w-[95%] mx-auto flex flex-col gap-10 justify-center items-center">
        <AccountCreation />
      </div>
      <ToastContainer />
    </div>
  );
};

const AccountCreation = () => {
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
            <MultiStepForm />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserDetail>({
    username: "",
    email: "",
    password: "",
    name: "",
    bday: "",
    address: "",
    mobileNo: "",
    bio: "",
    instagram: "",
    facebook: "",
    twitter: "",
    portfolioLink: "",
    gender: Gender.Male,
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (step === 1 && formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (step === 1 && formData.username.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }
    if (step === 1 && formData.username.length > 16) {
      setError("Username must be at most 16 characters long.");
      return;
    }
    if (step === 3) {
      const isValidMobileNo = /^09\d{9}$/.test(formData.mobileNo);
      if (!isValidMobileNo) {
        setError("Mobile number must start with '09' and be followed by 9 digits.");
        return;
      }
    }
    if (isStepValid()) {
      setStep((prev) => Math.min(prev + 1, 5));
      setError("");
    } else {
      setError("Please fill all required fields before proceeding.");
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return (
          formData.username.length >= 3 && // Minimum length of 3
          formData.username.length <= 16 && // Maximum length of 16
          formData.email &&
          formData.password &&
          formData.password.length >= 8 // Add this line for password length validation
        );
      case 2:
        const selectedDate = new Date(formData.bday);
        const minDate = new Date("1950-01-01");
        const maxDate = new Date(getMaxDate());
        return (
          formData.name &&
          formData.bday &&
          formData.gender &&
          selectedDate >= minDate &&
          selectedDate <= maxDate // Ensure date is within the valid range
        );
      case 3:
        const isValidMobileNo = /^09\d{9}$/.test(formData.mobileNo); // Validate mobile number
        return (
          formData.address &&
          formData.mobileNo &&
          isValidMobileNo && // Mobile number must start with "09" and have 9 additional digits
          formData.bio
        );
      case 4:
        return true; // Portfolio link is optional
      case 5:
        return true; // Social media links are optional
      default:
        return false;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    if (step !== 5) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    try {
      await signupBuyer(
        formData.username,
        formData.email,
        formData.password,
        formData.name,
        formData.bday,
        formData.address,
        formData.mobileNo,
        formData.bio,
        formData.instagram,
        formData.facebook,
        formData.twitter,
        formData.portfolioLink,
        formData.gender
      );
      setSuccess("Signup successful!");
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (err: any) {
      // Handle the "email already exists" error
      if ((err as Error).message.includes("Email already exists")) {
        setError("Email already exists. Please use a different email.");
      } else if ((err as Error).message.includes("Username already exists")) {
        setError("Username already exists. Please use a different username.");
      } else {
        setError("An error occurred during signup. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      name: "",
      bday: "",
      address: "",
      mobileNo: "",
      bio: "",
      instagram: "",
      facebook: "",
      twitter: "",
      portfolioLink: "",
      gender: Gender.Male,
    });
    setStep(1);
  };


  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <Step1 formData={formData} handleChange={handleChange} />;
      case 2:
        return <Step2 formData={formData} handleChange={handleChange} />;
      case 3:
        return <Step3 formData={formData} handleChange={handleChange} />;
      case 4:
        return <Step4 formData={formData} handleChange={handleChange} />;
      case 5:
        return <Step5 formData={formData} handleSubmit={handleSubmit} prevStep={prevStep} handleCancel={handleCancel} />;
      default:
        return null;
    }
  };

  return (
    <form className="w-full h-full flex flex-col gap-2 overflow-hidden" onSubmit={handleSubmit}>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Display error message */}
      {error && <div className="text-red-500 mt-2 text-xs">{error}</div>}

      {/* Display success message */}
      {success && <div className="text-green-500 mt-2 text-xs">{success}</div>}

      {/* Form navigation buttons */}
      <div className="flex justify-center items-center gap-4 mt-4">
        {step > 1 && (
          <motion.button
            type="button"
            onClick={prevStep}
            className="w-full py-2 bg-transparent border-2 border-palette-2 rounded-lg hover:bg-palborder-palette-2 hover:text-palette-2 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            Previous
          </motion.button>
        )}
        {step < 5 ? (
          <motion.button
            type="button"
            onClick={nextStep}
            className="w-full py-2 bg-palette-1 text-white rounded-lg hover:bg-palette-2 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            Next
          </motion.button>
        ) : (
          <motion.button
            type="submit"
            className="w-full py-2 bg-palette-2 text-white rounded-lg hover:bg-palette-1 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            Submit
          </motion.button>
        )}
      </div>

      {/* Link to login page */}
      <div className="w-full flex flex-col justify-start items-start mt-2">
        <p className="text-palette-7 text-sm">Already have an account?</p>
        <Link href="/signin" className="uppercase font-medium text-sm text-palette-2 hover:text-palette-1 transition-colors">
          Sign in
        </Link>
      </div>
    </form>
  );
};
const getMaxDate = () => {
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear - 4; // Current year minus 4
  return `${maxYear}-12-31`; // December 31st of the calculated year
};

export const Input: React.FC<InputProps> = ({ name, value, onChange, placeholder, icon, type = "text" }) => (

  <div className="w-full relative">
    <input
      className="w-full h-12 border-b border-b-palette-1 p-4 pl-12 bg-transparent placeholder-palette-7/20 focus:border-palette-1 transition-colors outline-none ring-0"
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      min={type === "date" ? "1950-01-01" : undefined} // Set minimum date to January 1, 1950
      max={type === "date" ? getMaxDate() : undefined} // Dynamically calculate the maximum date
    />
    <Icon
      className="text-palette-1 absolute top-1/2 left-0 -translate-y-1/2"
      icon={icon}
      width="35"
      height="35"
    />
  </div>
);

export const TextArea: React.FC<InputProps> = ({ name, value, onChange, placeholder, icon }) => (
  <div className="w-full relative">
    <textarea
      className="w-full h-16 border-b border-b-palette-1 p-4 pl-12 bg-transparent placeholder-palette-7/20 focus:border-palette-1 transition-colors outline-none ring-0 resize-none"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
    />
    <Icon
      className="text-palette-1 absolute top-4 left-0"
      icon={icon}
      width="35"
      height="35"
    />
  </div>
);

export const Select: React.FC<SelectProps> = ({ name, value, onChange, placeholder, icon, options }) => (
  <div className="relative w-full">
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-4 pl-12 pr-10 border-b border-b-palette-21 bg-transparent placeholder-palette-7/20 focus:border-palette-1 transition-colors outline-none ring-0 appearance-none"
      required
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
    <Icon
      className="text-palette-1 absolute top-1/2 left-0 -translate-y-1/2"
      icon={icon}
      width="35"
      height="35"
    />
    <Icon
      icon={"mdi:chevron-down"}
      className="absolute top-1/2 right-3 -translate-y-1/2 text-palette-1 pointer-events-none"
      width="20"
      height="20"
    />
  </div>
);

export default SignupBuyer;