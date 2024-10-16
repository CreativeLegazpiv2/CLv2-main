
"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { motion } from "framer-motion";
import { fetchUserDetails } from "@/services/creative-services/creativeServices"; // Adjust the import path based on your folder structure
import { iconNifyNonColored } from "@/components/layout/Footer";
import { UserDetail } from "@/services/creative-services/creativeServices";
import { useParams } from "next/navigation";
import { getSession } from "@/services/authservice";
import { jwtVerify } from "jose";
import Link from "next/link";
export const Services = () => {
    const [serviceArray, setServiceArray] = useState<UserDetail[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();
    const dynamic = params?.creative as string;

    useEffect(() => {
        const loadUserDetails = async () => {
            try {
                const users = await fetchUserDetails(dynamic);
                setServiceArray(users);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadUserDetails();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="w-full h-fit pb-[15dvh]">
            <div className="w-full flex flex-col">
                <div className="w-full max-w-[90%] mx-auto grid lg:grid-cols-3 grid-cols-1 gap-x-14 gap-y-14 py-[15dvh]">
                    {/* Render cards here */}
                    {serviceArray.map((user, id) => (
                        <CreativeCards
                            key={user.detailsid}
                            first_name={user.first_name}
                            bday={user.bday}
                            bio={user.bio}
                            profile_pic={user.profile_pic}
                            facebook={user.facebook}
                            instagram={user.instagram}
                            email={user.email}
                            address={user.address}
                            detailsid={user.detailsid} 
                            twitter={user.twitter}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const calculateAge = (bDay: string | Date) => {
    const dateNow = new Date();
    const bDayDate = new Date(bDay);
    let age = dateNow.getFullYear() - bDayDate.getFullYear();

    const hasBirthdayPassed = (dateNow.getMonth() > bDayDate.getMonth()) ||
        (dateNow.getMonth() === bDayDate.getMonth() && dateNow.getDate() >= bDayDate.getDate());

    if (!hasBirthdayPassed) {
        age--;
    }

    return age;
};

export const CreativeCards: React.FC<UserDetail> = ({
    detailsid,
    first_name,
    bday,
    bio = "",
    profile_pic,
    facebook,
    instagram,
    email,
    address,
}) => {
    const age = calculateAge(bday || "");

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="w-full border border-gray-400 rounded-xl p-4 bg-secondary-1 shadow-customShadow"
        >
            <div className="flex flex-col h-full lg:gap-4">
                <div className="w-full h-44 relative">
                    <img
                        className="w-full h-full object-cover"
                        src={"/images/landing-page/eabab.png"}
                        alt=""
                    />
                </div>
                <div className="w-full flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                    <img
                        className="h-32 w-32 z-50 -mt-12 bg-gray-600 rounded-full object-cover"
                        src={profile_pic || "/images/creative-directory/boy.png"}
                        alt=""
                    />
                    <div className="w-full flex flex-col justify-start items-center sm:items-start">
                        <div className="w-full flex flex-row lg:justify-between justify-center items-center sm:items-start mt-2 gap-2">
                            <h4 className="text-xl font-bold text-center sm:text-left">{first_name}</h4>
                            <div className="flex gap-2">
                                <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Icon className="cursor-pointer text-red-400" icon="jam:heart" width="25" height="25" />
                                </motion.span>
                            </div>
                        </div>
                        <div className="w-full flex flex-col sm:flex-row justify-between items-center sm:items-start gap-2 sm:gap-0">
                            <p className={`text-xs font-semibold text-center sm:text-left ${bio.length > 20 ? "line-clamp-1" : ""}`}>
                                {age}, {address}
                            </p>
                            <span className="flex gap-0.5">
                                {iconNifyNonColored.map((icon, id) => (
                                    <Icon key={id} className="cursor-pointer" icon={icon} width="25" height="25" />
                                ))}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="w-full min-h-32 flex flex-col pt-4">
                    <div className="w-full h-full max-w-[87%] mx-auto flex flex-col gap-6 justify-center items-center">
                        <p className={`text-center text-xs font-semibold ${bio.length > 100 ? "line-clamp-6" : ""}`}>
                            {bio}
                        </p>
                        <CreativeButton detailsid={detailsid} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const CreativeButton: React.FC<{ detailsid: string }> = ({ detailsid }) => {
    const [gettSession, setSession] = useState<string | null>(null);
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret';
    const token = getSession();
    useEffect(() => {
        const fetchUserDetails = async () => {
          const token = getSession();
          if (!token) return;
          try {
           const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
            const userId = payload.id as string;
            setSession(userId);
          } catch (error) {
            console.error('Error fetching user details:', error);
          }
        };
    
        fetchUserDetails();
      }, []);
      const galleryLink = gettSession
    ? `/g-user/collections/${detailsid}`
    : `/g-visitor/artwork/${detailsid}`;
    return (
        <Link href={galleryLink} passHref>
        <motion.div
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className="w-full h-fit flex flex-row-reverse gap-2 justify-center items-center text-primary-2"
        >
            <button className="py-2 bg-primary-1 rounded-full uppercase w-56 font-bold text-base">view gallery</button>
        </motion.div>
        </Link>
    );
};
