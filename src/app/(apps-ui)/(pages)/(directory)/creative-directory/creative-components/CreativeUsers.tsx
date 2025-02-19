"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import { CreativeService } from "./CreativeArray"; // Adjust if file name differs
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import "react-toastify/dist/ReactToastify.css";
import { getSession } from "@/services/authservice";
import { supabase } from "@/services/supabaseClient";
import { jwtVerify } from "jose";
import UserCardSkeleton from "@/components/Skeletal/userCardSkeleton";
import { Search } from "lucide-react";


interface CreativeArrayProps {
  detailsid: any;
  first_name: string;
  bday: string;
  bio: string;
  profile_pic: string;
  imageBg: string;
}

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const CreativeUsers = () => {
  const [creativeUsers, setCreativeUsers] = useState<CreativeArrayProps[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<CreativeArrayProps[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleUsers, setVisibleUsers] = useState(6);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await CreativeService.fetchCreativeUsers();
        setCreativeUsers(users);
        setFilteredUsers(users); // Initially, show all users
      } catch (error) {
        setError("Failed to load creatives.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Function to filter users based on selected letter
  const handleLetterClick = (letter: string) => {
    if (selectedLetter === letter) {
      setSelectedLetter(null);
      setFilteredUsers(creativeUsers);
    } else {
      setSelectedLetter(letter);
      setFilteredUsers(
        creativeUsers.filter(user => user.first_name.toUpperCase().startsWith(letter))
      );
    }
    setVisibleUsers(6); // Reset visible users count
  };

  // Handle search input changes
  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchInput(value);
    const filtered = creativeUsers.filter(user =>
      user.first_name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
    setSelectedLetter(null); // Reset letter filter when searching
    setVisibleUsers(6); // Reset visible users count
  };

  const loadMoreUsers = () => {
    setVisibleUsers(prev => prev + 6);
  };

  const showLessUsers = () => {
    setVisibleUsers(6);
  };

  return (
    <div className="w-full h-fit pb-[15dvh] bg-palette-6">
      <ToastContainer />
      <div className="w-full h-full flex flex-col md:max-w-[90%] max-w-[95%] mx-auto">
        <div className="w-full max-w-screen-lg p-6 flex flex-col gap-12 items-center justify-center mx-auto">
          <div className="w-full md:max-w-screen-md flex md:flex-row flex-col items-center gap-4">
            <h1 className="w-full max-w-screen-lg md:max-w-sm mx-auto text-palette-5 lg:text-5xl text-4xl font-semibold uppercase md:text-left text-center leading-tight">
              our creatives
            </h1>
            <div className="w-full relative">
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchInput}
                className="w-full p-3.5 px-8 bg-palette-5/80 border placeholder:text-sm placeholder:text-black/50 border-black/20 rounded-full focus:outline-2 focus:outline-palette-6"
                placeholder="Search for an artist name or username "
              />
              <Search className="absolute top-1/2 -translate-y-1/2 right-4 text-black" />
            </div>
          </div>

          {/* Alphabet filter */}
          <div className="w-full md:flex hidden py-3 pl-6 bg-palette-5/80 border border-black/20 rounded-full">
            {alphabet.map((letter) => (
              <motion.div
                key={letter}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleLetterClick(letter)}
                className={`w-full font-extrabold poppins cursor-pointer text-center ${selectedLetter === letter ? "text-palette-2" : ""
                  }`}
              >
                {letter}
              </motion.div>
            ))}
          </div>
        </div>

        {/* User Cards */}
        <div className="grid xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-2 grid-cols-1 lg:gap-16 md:gap-8 lg:gap-y-24 md:gap-y-12 gap-y-8 p-6">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <UserCardSkeleton key={index} />)
            : filteredUsers.slice(0, visibleUsers).map((user, id) => (
              <UserCard
                key={id}
                detailsid={user.detailsid}
                first_name={user.first_name}
                bday={user.bday}
                bio={user.bio}
                profile_pic={user.profile_pic}
                imageBg={user.imageBg}
              />
            ))}
        </div>

        {/* Show More / Show Less Buttons */}
        <div className="w-full flex justify-end px-6 mt-8 gap-4">
          {visibleUsers < filteredUsers.length && (
            <button
              onClick={loadMoreUsers}
              className="px-6 py-2 bg-palette-2 text-white rounded-full hover:bg-palette-3 transition-colors"
            >
              Show More
            </button>
          )}
          {visibleUsers > 6 && (
            <button
              onClick={showLessUsers}
              className="px-6 py-2 bg-palette-4 text-white rounded-full hover:bg-palette-5 transition-colors"
            >
              Show Less
            </button>
          )}
        </div>
      </div>
    </div>
  );
};



const calculateAge = (bDay: string | Date) => {
  const dateNow = new Date();
  const bDayDate = new Date(bDay);
  let age = dateNow.getFullYear() - bDayDate.getFullYear();
  const hasBirthdayPassed =
    dateNow.getMonth() > bDayDate.getMonth() ||
    (dateNow.getMonth() === bDayDate.getMonth() &&
      dateNow.getDate() >= bDayDate.getDate());
  if (!hasBirthdayPassed) age--;
  return age;
};

const UserCard = ({
  detailsid,
  first_name,
  bday,
  bio,
  profile_pic,
  imageBg,
}: CreativeArrayProps) => {
  const age = calculateAge(bday);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [liked, setLiked] = useState<boolean>(false);
  const [totaluserLike, setTotaluserLike] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = getSession();
      if (token) {
        try {
          // Verify the JWT token
          const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.JWT_SECRET || "your-secret")
          );

          if (payload.id) {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error("Error verifying token:", error);
          setIsLoggedIn(false); // Token is invalid or expired
        }
      } else {
        setIsLoggedIn(false); // No token found
      }
    };

    checkUserLoggedIn(); // Call the function to check login status
  }, []);

  useEffect(() => {
    const guestsString = localStorage.getItem("guest");
    let guests: string[] = [];

    if (guestsString) {
      try {
        const parsedGuests = JSON.parse(guestsString);
        if (Array.isArray(parsedGuests)) {
          guests = parsedGuests;
        } else {
          console.error("Parsed guests is not an array:", parsedGuests);
        }
      } catch (error) {
        console.error("Error parsing guests:", error);
      }
    }
    // Initialize liked state based on local storage
    setLiked(guests.includes(detailsid));

    const fetchLikes = async (userId: any) => {
      const { data, error } = await supabase
        .from("usersLikes")
        .select("users, guest")
        .eq("galleryLiked", detailsid);

      if (error) {
        console.error("Error fetching likes:", error);
        return;
      }

      if (data && data.length > 0) {
        const allUserLikes = data.flatMap((item) => item.users);
        const uniqueUserLikes = allUserLikes.filter(
          (user, index, self) => self.indexOf(user) === index
        );

        const guestLikesCount = Number(data[0].guest) || 0;
        setLiked(uniqueUserLikes.includes(userId));

        const likes = guestLikesCount + uniqueUserLikes.length;
        setTotaluserLike(likes);
      } else {
        setTotaluserLike(0);
      }
    };

    const checkUserLikes = async () => {
      const token = getSession();
      let userId = null;

      const guestsString = localStorage.getItem("guest");
      let guests: string[] = [];

      if (guestsString) {
        try {
          const parsedGuests = JSON.parse(guestsString);
          if (Array.isArray(parsedGuests)) {
            guests = parsedGuests;
          }
        } catch (error) {
          console.error("Error parsing guests:", error);
        }
      }
      if (guests.includes(detailsid)) {
        // Guest has liked
        setLiked(true);
      } else {
        // Guest has disliked or hasn't liked yet
        setLiked(false);
      }

      if (token) {
        try {
          const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.JWT_SECRET || "your-secret")
          );

          userId = payload.id;

          if (userId) {
            await fetchLikes(userId);
          }
        } catch (error) {
          console.error("Error verifying token:", error);
        }
      } else {
        await fetchLikes(null);
        setLiked(guests.includes(detailsid));
      }
    };

    checkUserLikes();

    const subscription = supabase
      .channel("fetchlikes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "usersLikes",
        },
        (payload: any) => {
          checkUserLikes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [detailsid]);

  const [loading, setLoading] = useState(false); // Add loading state

  const handleLike = async (detailsid: string) => {
    // Prevent multiple clicks while processing
    if (loading) return;
    setLoading(true); // Set loading to true

    const token = getSession();
    let userId = null;

    try {
      if (token) {
        // Logged-in user
        const { payload } = await jwtVerify(
          token,
          new TextEncoder().encode(process.env.JWT_SECRET || "your-secret")
        );
        userId = payload.id as string;

        // Check if the user already liked this item
        if (liked) {
          // User already liked, so we dislike
          await updateLikeStatus(userId, detailsid, "dislike");
          setLiked(false);
          setTotaluserLike((prevTotal) => prevTotal - 1);
        } else {
          // User is liking for the first time
          await updateLikeStatus(userId, detailsid, "like");
          setLiked(true);
          setTotaluserLike((prevTotal) => prevTotal + 1);
        }
      } else {
        // Handle guest users
        const guestsString = localStorage.getItem("guest");
        let guests: string[] = [];

        if (guestsString) {
          try {
            const parsedGuests = JSON.parse(guestsString);
            if (Array.isArray(parsedGuests)) {
              guests = parsedGuests;
            }
          } catch (error) {
            console.error("Error parsing guests:", error);
          }
        }

        const index = guests.indexOf(detailsid);

        if (index !== -1) {
          // Guest dislikes: Remove from array
          guests.splice(index, 1);
          setLiked(false); // Update liked state
          setTotaluserLike((prevTotal) => prevTotal - 1); // Decrement total likes
        } else {
          // Guest likes: Add to array
          guests.push(detailsid);
          setLiked(true); // Update liked state
          setTotaluserLike((prevTotal) => prevTotal + 1); // Increment total likes
        }

        // Update localStorage
        localStorage.setItem("guest", JSON.stringify(guests));

        // Send request to update guest count in backend
        const response = await fetch(`/api/fetchUsers/userLikes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ detailsid, guestStorage: guests }),
        });

        const data = await response.json();
        if (!response.ok) {
          toast.error(
            data.message || "Failed to update guest count. Please try again.",
            {
              position: "bottom-right",
            }
          );
        }
      }
    } catch (error) {
      console.error("Error processing like:", error);
      toast.error("An error occurred while processing your request.", {
        position: "bottom-right",
      });
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Helper function to update like/dislike in the backend for logged-in users
  const updateLikeStatus = async (
    userId: string,
    detailsid: string,
    action: string
  ) => {
    try {
      const response = await fetch(`/api/fetchUsers/userLikes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, detailsid, action }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`${action} successful!`);
      } else {
        console.error(`${action} failed:`, data.message);
      }
    } catch (error) {
      console.error(`Error during ${action}:`, error);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      // Convert to "K" format (e.g., 1000 -> 1.0K, 1100 -> 1.1K)
      return `${(num / 1000).toFixed(1)}K`;
    }
    // Return the number as is if it's less than 1000
    return num.toString();
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      className="w-full border border-gray-400 rounded-xl p-4 bg-secondary-1 shadow-customShadow mt-10"
    >
      <div className="flex flex-col justify-center items-center">
        <div className="w-full h-full max-h-28 -mt-12 flex flex-row-reverse gap-4 justify-center items-center relative">
          {isLoggedIn && (
            <div className="w-fit flex items-center justify-center gap-1.5 cursor-pointer absolute right-0 -translate-y-1/2 top-16">
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon
                  className={`cursor-pointer text-red-400 ${loading ? "opacity-50 pointer-events-none" : ""
                    }`}
                  icon={liked ? "jam:heart-f" : "jam:heart"}
                  width="35"
                  height="35"
                  onClick={() => !loading && handleLike(detailsid)} // Prevent clicks while loading
                />
              </motion.span>
              {formatNumber(totaluserLike)}
            </div>
          )}

          <img
            className="h-28 w-28 z-50 rounded-full object-cover border-2 border-gray-400"
            src={profile_pic || "../images/creative-directory/profile.jpg"}
            alt=""
          />
        </div>
        <div className="w-full min-h-32 max-h-fit py-6">
          <div className="w-full h-full max-w-[87%] mx-auto flex flex-col gap-2 justify-center items-center">
            <h6 className="text-center text-2xl font-bold">
              {first_name}, {age}
            </h6>
            <p
              className={`text-center text-xs font-semibold ${bio.length > 100 ? "line-clamp-5" : ""
                }`}
            >
              {bio}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


