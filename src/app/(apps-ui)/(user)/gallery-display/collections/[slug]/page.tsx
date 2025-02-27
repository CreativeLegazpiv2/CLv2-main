"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import ProfileSkeletonUI from "@/components/Skeletal/ProfileSkeletonUI";
import { UserProfile } from "./components/UserProfile";
import CollectionDisplay from "./components/CollectionDisplay";
import { supabase } from "@/services/supabaseClient";
import { ToastContainer } from "react-toastify";

export interface UserDetail {
  detailsid: string;
  first_name: string;
  creative_field: string;
  address: string;
  mobileNo: string;
  bday?: string;
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
  link?: string;
}

interface ApiResponse {
  userDetails: UserDetail;
}

interface CollectionProps {
  images: CollectionItem[];
}

interface CollectionDisplayProps {
  images2: CollectionItem[];
}

export default function CollectionPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [collectionData, setCollectionData] = useState<CollectionProps | null>(null);
  const [collectionDisplay, setCollectionDisplay] = useState<CollectionDisplayProps | null>(null);
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

        setLoading(true);

        // Fetch user profile data
        const response = await fetch(`/api/profile/${slug}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const result: ApiResponse = await response.json();
        setData(result);

        // Fetch the latest collection (1 most recent)
        const { data: latestCollection, error: latestError } = await supabase
          .from("child_collection")
          .select("*")
          .eq("sluger", slug)
          .order("created_at", { ascending: false }) // Get latest first
          .limit(1);

        if (latestError) throw new Error("Failed to fetch latest collection");

        if (!latestCollection || latestCollection.length === 0) {
          setCollectionData(null);
        } else {
          const latestImage = {
            created_at: new Date(latestCollection[0].created_at),
            generatedId: latestCollection[0].generatedId,
            path: latestCollection[0].path,
            title: latestCollection[0].title,
            desc: latestCollection[0].desc,
            artist: latestCollection[0].artist,
            year: Number(latestCollection[0].year),
            childid: latestCollection[0].childid,
            link: latestCollection[0].link,
          };
          setCollectionData({ images: [latestImage] });
        }

        // Fetch all collections for display
        const { data: allCollections, error: allError } = await supabase
          .from("child_collection")
          .select("*")
          .eq("sluger", slug);

        if (allError) throw new Error("Failed to fetch collection data");

        if (!allCollections || allCollections.length === 0) {
          setCollectionDisplay(null);
        } else {
          const images2 = allCollections.map((item) => ({
            created_at: new Date(item.created_at),
            generatedId: item.generatedId,
            path: item.path,
            title: item.title,
            desc: item.desc,
            artist: item.artist,
            year: Number(item.year),
            childid: item.childid,
            link: item.link,
          }));
          setCollectionDisplay({ images2 });
        }
      } catch (error: any) {
        console.error(error);
        alert(`Error fetching data: ${error.message}. Redirecting to home.`);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pathname, router]);

  // Redirect if no collection data
  useEffect(() => {
    if (!loading && !collectionDisplay) {
      router.push(`/gallery-display/collections/${data?.userDetails?.detailsid}`);
    }
  }, [loading, collectionDisplay, router]);

  if (loading) return <ProfileSkeletonUI />;
  if (!data) return <div>User not found</div>;

  return (
    <div className="h-fit w-full bg-palette-5">
      {/* ✅ Pass latest collection to UserProfile */}
      <UserProfile 
        initialUserDetail={data.userDetails}
        collection={collectionData?.images || []}
      />
      {/* ✅ Pass all collections to CollectionDisplay */}
      {collectionDisplay && <CollectionDisplay collection={{ images: collectionDisplay.images2 }} />}

      <ToastContainer />
    </div>
  );
}
