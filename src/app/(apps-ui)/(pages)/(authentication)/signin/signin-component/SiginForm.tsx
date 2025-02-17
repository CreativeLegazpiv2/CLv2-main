"use client";
import { loginUser } from "@/services/authservice";
import { Icon } from "@iconify/react/dist/iconify.js";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export const Form = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const router = useRouter(); // Initialize useRouter

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await loginUser(username, password);
      console.log("Logged in user:", user);
      toast.dismiss();
      toast.success("Successfully Logged In!", { position: "bottom-right" });
      if (user) {
        // Store the token in local storage or cookies
        localStorage.setItem("token", user.token); // Example: Store JWT in localStorage
        router.push("/home");
      }
    } catch (err: any) {
      console.error(err);
      toast.dismiss();
      toast.error(err.message, {
        position: "bottom-right",
        autoClose: 5000, // close the toast after 5 seconds
        onClose: () => {
          // animate the toast out here
        },
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="w-full h-full flex flex-col gap-6" onSubmit={handleSubmit}>
      {/* Username */}
      <div className="w-full relative">
        <input
          className="w-full border-2 pl-12 h-12 border-palette-2/50 outline-none ring-0 bg-transparent placeholder-palette-1 rounded-full focus:border-palette-2 transition-colors"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)} // Capture username input
        />
        <Icon
          className="text-palette-1 absolute top-1/2 left-4 -translate-y-1/2"
          icon="mdi:user-outline"
          width="25"
          height="25"
        />
      </div>

      {/* Password */}
      <div className="w-full relative">
        <input
          className="w-full border-2 pl-12 h-12 border-palette-2/50 outline-none ring-0 bg-transparent placeholder-palette-1 rounded-full focus:border-palette-2 transition-colors"
          type={showPassword ? "text" : "password"} // Toggle input type based on showPassword state
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Capture password input
        />
        <Icon
          className="text-palette-1 absolute top-1/2 left-4 -translate-y-1/2"
          icon="mynaui:key"
          width="25"
          height="25"
        />

        {/* Eye/EyeOff Icon for toggling password visibility */}
        <button
          type="button"
          className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer"
          onClick={() => setShowPassword(!showPassword)} // Toggle showPassword state
        >
          <Icon
            icon={showPassword ? "mdi:eye-off" : "mdi:eye"} // Switch between Eye and EyeOff icons
            width="25"
            height="25"
            className="text-palette-1"
          />
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="w-full">
        <motion.button
          className="w-full py-3 text-lg font-semibold uppercase bg-palette-2 text-white rounded-full hover:bg-palette-1 transition-colors"
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading} // Disable button while loading
        >
          {loading ? "Logging in..." : "Log in"} {/* Show loading state */}
        </motion.button>
      </div>
    </form>
  );
};