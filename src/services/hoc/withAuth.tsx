// src/hoc/withAuth.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Ensure you import from next/navigation
import { decryptToken } from '@/services/authservice'; // Import the decryptToken function
import { supabase } from '@/services/supabaseClient';

const withAuth = (WrappedComponent: React.ComponentType) => {
    return function AuthComponent() {
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [loading, setLoading] = useState(true);
        const router = useRouter();

        useEffect(() => {
            const token = localStorage.getItem('token'); // Get the token from local storage

            const checkAuthentication = async () => {
                if (!token) {
                    console.log("No token found. Redirecting to login.");
                    router.push('/signup');
                    return;
                }

                try {
                    const payload = await decryptToken(token); // Use the decryptToken function
                    console.log("Decrypted Payload:", payload);

                    // Check if the user exists in the database using the decrypted ID and username
                    const { data, error } = await supabase
                        .from("users")
                        .select("id, username")
                        .eq("id", payload.id)
                        .eq("username", payload.username)
                        .single();

                    if (error || !data) {
                        console.log("User not found in the database. Redirecting to login.");
                        router.push('/signup');
                        return;
                    }

                    console.log("Authenticated user:", payload);
                    setIsAuthenticated(true); // User is authenticated
                } catch (error) {
                    console.error("Token verification failed:", error);
                    router.push('/signup'); // Redirect to login if verification fails
                } finally {
                    setLoading(false); // Set loading to false after checking
                }
            };

            checkAuthentication();
        }, [router]);

        if (loading) {
            return <div>Loading...</div>; // Show a loading state
        }

        if (!isAuthenticated) {
            return null; // Optionally return a loading spinner or a placeholder
        }

        return <WrappedComponent />; // Render the wrapped component once authenticated
    };
};

export default withAuth;
