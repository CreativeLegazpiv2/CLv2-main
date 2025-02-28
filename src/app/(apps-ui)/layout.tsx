"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const LottieAnimation = dynamic(
  () => import("@/components/animations/_lottieloader"),
  { ssr: false }
);

export default function LoadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true); // Start with loading state
  const pathname = usePathname();

  useEffect(() => {
    // Trigger loading on route change
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 3500); // Customize delay

    return () => clearTimeout(timer); // Cleanup on unmount
  }, [pathname]);

  return (
    <main className="w-full flex flex-col min-h-screen">
        {isLoading ? (
          // Show loading animation while loading
          <div className="w-full h-screen flex justify-center items-center">
            <LottieAnimation />
          </div>
        ) : (
          // Render children only after loading is complete
          <main className="flex-grow">{children}</main>
        )}
    </main>
  );
}