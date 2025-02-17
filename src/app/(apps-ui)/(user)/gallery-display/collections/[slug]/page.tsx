"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import ProfileDetailsSkeleton from "@/components/Skeletal/profileSkeleton";
import { UserProfile } from "./components/UserProfile";
import CollectionDisplay from "./components/CollectionDisplay";
import { supabase } from "@/services/supabaseClient";
import ProfileSkeletonUI from "@/components/Skeletal/ProfileSkeletonUI";
import { ToastContainer } from "react-toastify";

export interface UserDetail {
  detailsid: string;
  first_name: string;
  creative_field: string;
  address: string;
  mobileNo: string;
  bday?: string; // Add this line for the birthdate
  bio?: string;
  instagram: string;
  facebook: string;
  portfolioLink: string;
  profile_pic?: string;
  role: string;
  email?: string;
  gender?: string;
}

interface CollectionItem {
  created_at: Date;
  generatedId: string;
  path: string;
  title: string;
  desc: string;
  artist: string;
  year: number;
  childid: string;
}

interface ApiResponse {
  userDetails: UserDetail;
  collection: CollectionItem[];
}

interface CollectionProps {
  images: {
    created_at: Date;
    generatedId: string;
    image_path: string;
    title: string;
    desc: string;
    artist: string;
    year: number;
    childid: string;
  }[];
}

export default function CollectionPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [collectionData, setCollectionData] = useState<CollectionProps | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const slug = pathname.split("/").pop(); // Extract slug from URL
        if (!slug) {
          throw new Error("Invalid slug");
        }

        setLoading(true); // Start loading

        // Fetch user profile data
        const response = await fetch(`/api/profile/${slug}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const result: ApiResponse = await response.json();
        setData(result);

        // Fetch collection data
        const { data: collectionResult, error } = await supabase
          .from('child_collection')
          .select('*')
          .eq('sluger', slug);

        if (error) {
          throw new Error("Failed to fetch collection data");
        }

        // If no collection data is found, set collectionData to null
        if (!collectionResult || collectionResult.length === 0) {
          setCollectionData(null);
          return;
        }

        // Map collection data to the expected format
        const images = collectionResult.map(item => ({
          created_at: new Date(item.created_at),
          generatedId: item.generatedId,
          image_path: item.path,
          title: item.title,
          desc: item.desc,
          artist: item.artist,
          year: Number(item.year),
          childid: item.childid,
        }));

        setCollectionData({ images });

      } catch (error: any) {
        console.error(error);
        alert(`Error fetching data: ${error.message}. Redirecting to home.`);
        router.push("/");
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchData();
  }, [pathname, router]);

  // Redirect if there is no collection data
  useEffect(() => {
    if (!loading && !collectionData) {
      router.push(`/gallery-display/collections/${data?.userDetails?.detailsid}`);
    }
  }, [loading, collectionData, router]);

  if (loading) {
    return <ProfileSkeletonUI />;
  }

  if (!data) {
    return <div>User not found</div>;
  }

  return (
    <div className="h-fit w-full bg-palette-5">
      {/* Render UserProfile with user details */}
      <UserProfile
        initialUserDetail={data.userDetails}
        collection={data.collection}
      />

      {/* Display the user's collection only if collectionData exists */}
      {collectionData && <CollectionDisplay collection={collectionData} />}

      <ToastContainer />
    </div>
  );
}