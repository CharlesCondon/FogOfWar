import { Redirect, Stack, usePathname } from "expo-router";
import { UserContext } from "@/context/UserContext";
import { useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { useSession } from "../../context/AuthContext";
import LoadingScreen from "@/components/Loading/Loading";
import Purchases from "react-native-purchases";
import { supabase } from "@/lib/supabase";

function formatDate(date: Date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export default function RootLayout() {
    const { session, isLoading } = useSession();
    const [user, setUser] = useState<User | undefined>();
    const [loading, setLoading] = useState<boolean>(true);
    const [userNotFound, setUserNotFound] = useState<boolean>(false);
    const pathname = usePathname();

    useEffect(() => {
        const fetchUserData = async () => {
            if (!session?.user?.id) {
                return;
            }

            setLoading(true);
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("id", session.user.id)
                .single();

            if (error) {
                console.log("Error fetching user data:", error);
                setUserNotFound(true);
            } else {
                console.log("root layout: user set");
                setUser(data);
            }

            setLoading(false);
        };

        fetchUserData();
    }, [session?.user?.id]);

    useEffect(() => {
        /* Enable debug logs before calling `setup`. */
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
        /*
          Initialize the RevenueCat Purchases SDK.
    
          - appUserID is nil, so an anonymous ID will be generated automatically by the Purchases SDK. Read more about Identifying Users here: https://docs.revenuecat.com/docs/user-ids
    
          - observerMode is false, so Purchases will automatically handle finishing transactions. Read more about Observer Mode here: https://docs.revenuecat.com/docs/observer-mode
    
          - useAmazon is false, so it will use the Play Store in Android and App Store in iOS by default.
          */
        Purchases.configure({
            apiKey: process.env.EXPO_PUBLIC_REVCAT_KEY as string,
            appUserID: null,
            useAmazon: false,
        });
    }, []);

    if (!session) {
        // On web, static rendering will stop here as the user is not authenticated
        // in the headless Node process that the pages are rendered in.
        return <Redirect href="/sign-in" />;
    }

    if (userNotFound && pathname !== "/create-profile") {
        return <Redirect href="/create-profile" />;
    }

    if (isLoading || loading) {
        return <LoadingScreen />;
    }

    return (
        <UserContext.Provider value={{ user, setUser }}>
            <Stack
                screenOptions={{
                    contentStyle: { backgroundColor: "rgb(18, 18, 18)" },
                }}
            >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="create-profile"
                    options={{ headerShown: false }}
                />
                <Stack.Screen name="+not-found" />
            </Stack>
        </UserContext.Provider>
    );
}

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
