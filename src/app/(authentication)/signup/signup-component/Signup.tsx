"use client";

import { Logo } from "@/components/reusable-component/Logo";
import { signupUser } from "@/services/authservice";
import { Icon } from "@iconify/react/dist/iconify.js";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const Signup = () => {
  return (
    <div className="w-full min-h-dvh lg:py-[20dvh] py-[15dvh] bg-[url('/images/signup/background.jpg')] bg-cover bg-no-repeat relative">
      {/* Full height overlay covering the entire div */}
      <div className="absolute inset-0 w-full h-full bg-black/30"></div>

      {/* Content */}
      <div className="relative w-full h-full xl:max-w-[55%] sm:max-w-[70%] max-w-[95%] mx-auto flex flex-col gap-10 justify-center items-center">
        <h1 className="font-bold lg:text-6xl md:text-5xl text-4xl text-white drop-shadow-xl lg:block hidden">
          BE ONE OF US
        </h1>
        <AccountCreation />
      </div>
    </div>
  );
};

const AccountCreation = () => {
  return (
    <div className="w-full h-full relative border border-black">
      {/* Main content */}
      <div className="w-full h-full flex bg-secondary-1 rounded-2xl z-50 relative">
        <div className="w-full h-full sm:p-10 p-6 lg:block hidden">
          <img
            className="w-fit h-full rounded-xl"
            src="images/signup/study.png"
            alt=""
          />
        </div>
        <div className="w-full h-full flex flex-col gap-4 justify-center items-center sm:p-10 p-6">
          <div className="w-64 h-fit">
            <Logo color="text-secondary-2" width={"auto"} height={"auto"} />
          </div>
          <div className="w-full h-full flex justify-end items-end">
            <Form />
          </div>
        </div>
      </div>

      {/* Background divs (behind the main content) */}
      <div className="w-full absolute lg:-bottom-10 -bottom-6 z-10 max-w-[90%] left-0 right-0  mx-auto h-32 rounded-2xl bg-shade-6"></div>
      <div className="w-full absolute lg:-bottom-20 -bottom-12 z-0 max-w-[80%] left-0 right-0  mx-auto h-32 rounded-2xl bg-shade-7"></div>
    </div>
  );
};

export const Form = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [creativeField, setCreativeField] = useState("");
  const [address, setAddress] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signupUser(
        username,
        email,
        password,
        firstName,
        creativeField,
        address,
        mobileNo,
        bio,
        instagram,
        facebook,
        twitter,
        portfolioLink
      );
      setSuccess("Signup successful!");
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
      setError("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      setSuccess("");
    }
  };

  return (
    <form className="w-full h-full flex flex-col gap-6" onSubmit={handleSignup}>
      {/* Username */}
      <div className="w-full lg:max-w-sm relative">
        <input
          className="w-full h-10 border-b-2 p-4 pl-12 border-secondary-2 outline-none ring-0"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Icon
          className="text-secondary-2 absolute top-1/2 left-0 -translate-y-1/2"
          icon="mdi:user-outline"
          width="35"
          height="35"
        />
      </div>

      {/* Email */}
      <div className="w-full lg:max-w-sm relative">
        <input
          className="w-full h-10 border-b-2 p-4 pl-12 border-secondary-2 outline-none ring-0"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Icon
          className="text-secondary-2 absolute top-1/2 left-0 -translate-y-1/2"
          icon="material-symbols:mail-outline"
          width="35"
          height="35"
        />
      </div>

      {/* Password */}
      <div className="w-full lg:max-w-sm relative">
        <input
          className="w-full h-10 border-b-2 p-4 pl-12 border-secondary-2 outline-none ring-0"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Icon
          className="text-secondary-2 absolute top-1/2 left-0 -translate-y-1/2"
          icon="mynaui:key"
          width="35"
          height="35"
        />
      </div>

      {/* First Name */}
      <div className="w-full lg:max-w-sm relative">
        <input
          className="w-full h-10 border-b-2 p-4 pl-12 border-secondary-2 outline-none ring-0"
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <Icon
          className="text-secondary-2 absolute top-1/2 left-0 -translate-y-1/2"
          icon="mdi:account-outline"
          width="35"
          height="35"
        />
      </div>

      {/* Creative Field */}
      <div className="w-full lg:max-w-sm relative">
        <input
          className="w-full h-10 border-b-2 p-4 pl-12 border-secondary-2 outline-none ring-0"
          type="text"
          placeholder="Creative Field"
          value={creativeField}
          onChange={(e) => setCreativeField(e.target.value)}
          required
        />
        <Icon
          className="text-secondary-2 absolute top-1/2 left-0 -translate-y-1/2"
          icon="mdi:palette-outline"
          width="35"
          height="35"
        />
      </div>

      {/* Address */}
      <div className="w-full lg:max-w-sm relative">
        <input
          className="w-full h-10 border-b-2 p-4 pl-12 border-secondary-2 outline-none ring-0"
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <Icon
          className="text-secondary-2 absolute top-1/2 left-0 -translate-y-1/2"
          icon="mdi:home-outline"
          width="35"
          height="35"
        />
      </div>

      {/* Mobile No */}
      <div className="w-full lg:max-w-sm relative">
        <input
          className="w-full h-10 border-b-2 p-4 pl-12 border-secondary-2 outline-none ring-0"
          type="number"
          placeholder="Mobile No"
          value={mobileNo}
          onChange={(e) => setMobileNo(e.target.value)}
          required
        />
        <Icon
          className="text-secondary-2 absolute top-1/2 left-0 -translate-y-1/2"
          icon="mdi:phone-outline"
          width="35"
          height="35"
        />
      </div>

      {/* Bio */}
      <div className="w-full lg:max-w-sm relative">
        <textarea
          className="w-full h-20 border-b-2 p-4 pl-12 border-secondary-2 outline-none ring-0"
          placeholder="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          required
        />
        <Icon
          className="text-secondary-2 absolute top-1/2 left-0 -translate-y-1/2"
          icon="mdi:book-outline"
          width="35"
          height="35"
        />
      </div>

      {/* Instagram */}
      <div className="w-full lg:max-w-sm relative">
        <input
          className="w-full h-10 border-b-2 p-4 pl-12 border-secondary-2 outline-none ring-0"
          type="text"
          placeholder="Instagram"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
        />
        <Icon
          className="text-secondary-2 absolute top-1/2 left-0 -translate-y-1/2"
          icon="mdi:instagram"
          width="35"
          height="35"
        />
      </div>

      {/* Facebook */}
      <div className="w-full lg:max-w-sm relative">
        <input
          className="w-full h-10 border-b-2 p-4 pl-12 border-secondary-2 outline-none ring-0"
          type="text"
          placeholder="Facebook"
          value={facebook}
          onChange={(e) => setFacebook(e.target.value)}
        />
        <Icon
          className="text-secondary-2 absolute top-1/2 left-0 -translate-y-1/2"
          icon="mdi:facebook"
          width="35"
          height="35"
        />
      </div>

      {/* Twitter */}
      <div className="w-full lg:max-w-sm relative">
        <input
          className="w-full h-10 border-b-2 p-4 pl-12 border-secondary-2 outline-none ring-0"
          type="text"
          placeholder="Twitter"
          value={twitter}
          onChange={(e) => setTwitter(e.target.value)}
        />
        <Icon
          className="text-secondary-2 absolute top-1/2 left-0 -translate-y-1/2"
          icon="mdi:twitter"
          width="35"
          height="35"
        />
      </div>

      {/* Portfolio Link */}
      <div className="w-full lg:max-w-sm relative">
        <input
          className="w-full h-10 border-b-2 p-4 pl-12 border-secondary-2 outline-none ring-0"
          type="text"
          placeholder="Portfolio Link"
          value={portfolioLink}
          onChange={(e) => setPortfolioLink(e.target.value)}
        />
        <Icon
          className="text-secondary-2 absolute top-1/2 left-0 -translate-y-1/2"
          icon="mdi:link-variant"
          width="35"
          height="35"
        />
      </div>

      {/* Error or Success Message */}
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-500">{success}</div>}

      {/* Submit Button */}
      <button
        className="bg-primary text-white w-full lg:max-w-sm h-10 rounded-lg z-50"
        type="submit"
      >
        Sign Up
      </button>
    </form>
  );
};
