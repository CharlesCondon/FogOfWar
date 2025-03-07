import {
    useContext,
    createContext,
    type PropsWithChildren,
    useState,
    useEffect,
} from "react";
import { useStorageState } from "./useStorageState";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { User } from "@/types";
import * as turf from "@turf/turf";
import * as AppleAuthentication from "expo-apple-authentication";
import { Alert } from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

const AuthContext = createContext<{
    session?: Session | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}>({
    session: null,
    isLoading: true,
    signIn: async () => {},
    signUp: async () => {},
    signOut: async () => {},
});

// This hook can be used to access the user info.
export function useSession() {
    const value = useContext(AuthContext);
    if (process.env.NODE_ENV !== "production") {
        if (!value) {
            throw new Error(
                "useSession must be wrapped in a <SessionProvider />"
            );
        }
    }

    return value;
}

export async function handleAppleAuth() {
    try {
        const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
        });

        // Use the Apple ID token to authenticate with Supabase
        const { identityToken, email, fullName, user } = credential;

        if (identityToken) {
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: "apple",
                token: identityToken,
            });

            if (error) {
                console.error("Supabase sign-in error:", error);
                Alert.alert("Sign-in failed", error.message);
                return;
            }

            // Check if user record exists in your Supabase 'users' table
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("*")
                .eq("id", data.user.id)
                .single();

            if (userError || !userData) {
                // If user doesn't exist, create a new record
                const { error: insertError } = await supabase
                    .from("users")
                    .insert([
                        {
                            id: data.user.id,
                            email: email || "",
                            name: fullName
                                ? `${fullName.givenName} ${fullName.familyName}`
                                : "User",
                            metric: true,
                            joinedDate: new Date(),
                            overlayColor: "rgb(0,0,0)",
                            dotColor: "rgb(0,0,0)",
                        },
                    ]);

                if (insertError) {
                    console.error("Error creating user record:", insertError);
                    Alert.alert("Account creation failed", insertError.message);
                    return;
                }
            }

            // Store session securely
            await SecureStore.setItemAsync(
                "session",
                JSON.stringify(data.session)
            ).then(() => console.log(JSON.stringify(data.session)));

            // Navigate to app home
            router.replace("/");
        }
    } catch (e: any) {
        if (e.code === "ERR_REQUEST_CANCELED") {
            console.log("User canceled Apple sign-in.");
        } else {
            console.error("Apple sign-in error:", e);
            Alert.alert("Apple Sign-in failed", e.message);
        }
    }
}

export const createNewUser = async (
    id: string,
    name: string,
    units: string
) => {
    try {
        const { data, error } = await supabase
            .from("users") // Make sure this table exists in your Supabase database
            .insert([
                {
                    id,
                    name,
                    metric: units === "Kilometer" ? true : false,
                    joinedDate: new Date(),
                    overlayColor: "rgb(0,0,0)",
                    dotColor: "rgb(0,0,0)",
                },
            ]);

        if (error) throw error;
        return data;
    } catch (error: any) {
        console.error("Error creating user:", error.message);
        throw error;
    }
};

export const updateUserLog = async (
    id: string,
    activityLog: Record<string, any>
) => {
    try {
        const { data, error } = await supabase
            .from("users")
            .update({ activityLog }) // Update the activityLog column
            .eq("id", id) // Ensure we're updating the correct user record
            .single(); // Fetch a single row

        if (error) {
            console.log(error);
            throw error;
        }
        console.log("Updated activity log: " + Date.now());
        return data;
    } catch (error: any) {
        console.error("Error updating user activity log:", error.message);
        throw error;
    }
};
export const updateUserColors = async (
    id: string,
    color: string,
    type: string
) => {
    const col = type === "fog" ? "overlayColor" : "dotColor";
    try {
        const { data, error } = await supabase
            .from("users")
            .update({ [col]: color }) // Update the activityLog column
            .eq("id", id) // Ensure we're updating the correct user record
            .single(); // Fetch a single row

        if (error) throw error;
        console.log("Updated color preference");
        return data;
    } catch (error: any) {
        console.error(`Error updating user ${col} color:`, error.message);
        throw error;
    }
};
export const updateMapStyle = async (id: string, url: string) => {
    try {
        const { data, error } = await supabase
            .from("users")
            .update({ mapStyle: url }) // Update the activityLog column
            .eq("id", id) // Ensure we're updating the correct user record
            .single(); // Fetch a single row

        if (error) throw error;
        console.log("Updated map style preference");
        return data;
    } catch (error: any) {
        console.error(`Error updating user map style:`, error.message);
        throw error;
    }
};
export const updateUnits = async (id: string, metric: boolean) => {
    try {
        const { data, error } = await supabase
            .from("users")
            .update({ metric }) // Update the activityLog column
            .eq("id", id) // Ensure we're updating the correct user record
            .single(); // Fetch a single row

        if (error) throw error;
        console.log("Updated units preference");
        return data;
    } catch (error: any) {
        console.error(`Error updating user units preference:`, error.message);
        throw error;
    }
};
export const updateCoins = async (id: string, charcoins: number) => {
    try {
        const { data, error } = await supabase
            .from("users")
            .update({ charcoins }) // Update the activityLog column
            .eq("id", id) // Ensure we're updating the correct user record
            .single(); // Fetch a single row

        if (error) throw error;
        console.log("Updated coins");
        return data;
    } catch (error: any) {
        console.error(`Error updating coins:`, error.message);
        throw error;
    }
};
export const updateCosmetics = async (
    id: string,
    cosmetics: number[],
    charcoins: number
) => {
    try {
        const { data, error } = await supabase
            .from("users")
            .update({ charcoins, cosmetics }) // Update the activityLog column
            .eq("id", id) // Ensure we're updating the correct user record
            .single(); // Fetch a single row

        if (error) throw error;
        console.log("Updated owned cosmetics");
        return data;
    } catch (error: any) {
        console.error(`Error purchasing cosmetic:`, error.message);
        throw error;
    }
};
export async function fetchLeaderboardData(
    id: string,
    metric: boolean,
    type: string | string[],
    country: string,
    period: string | string[]
) {
    try {
        let query = supabase
            .from("users")
            .select("id, name, country, activityLog");

        if (type === "local") {
            query = query.eq("country", country);
        }

        const { data, error } = await query;

        if (error) throw error;

        const now = new Date();
        const startOfPeriod = getStartOfPeriod(now, period);

        const leaderboardData = data.map((user) => {
            const activityLog = user.activityLog || {};

            // Convert activityLog object to array of entries: [date, data]
            const activityEntries = Object.entries(activityLog);

            // Filter entries based on the period's start date
            const filteredActivities = activityEntries.filter(([date]) => {
                const activityDate = new Date(date);

                // Normalize both dates in UTC to ignore time
                const normalizedActivityDate = new Date(
                    Date.UTC(
                        activityDate.getUTCFullYear(),
                        activityDate.getUTCMonth(),
                        activityDate.getUTCDate()
                    )
                );
                const normalizedStartOfPeriod = new Date(
                    Date.UTC(
                        startOfPeriod.getUTCFullYear(),
                        startOfPeriod.getUTCMonth(),
                        startOfPeriod.getUTCDate()
                    )
                );

                return normalizedActivityDate >= normalizedStartOfPeriod;
            });

            // Extract all revealed areas for the period
            const revealedAreas = filteredActivities.map(
                ([_, activity]: [string, any]) => activity.revealedArea
            );

            const validAreas = revealedAreas
                .flat(Infinity)
                .filter(
                    (area: any) =>
                        area &&
                        area.geometry &&
                        Array.isArray(area.geometry.coordinates) &&
                        area.geometry.coordinates.length > 0
                );

            // Use Turf.js to unify the geometries
            let unifiedArea: any;
            if (validAreas.length > 1) {
                unifiedArea = turf.featureCollection(validAreas);
            } else {
                unifiedArea = validAreas[0];
            }

            // Calculate area (score) in square meters

            const score =
                unifiedArea && validAreas.length >= 1
                    ? turf.area(unifiedArea)
                    : 0;

            let formattedScore;
            if (metric) {
                formattedScore = parseFloat((score / 1000).toFixed(2));
            } else {
                formattedScore = parseFloat((score / 1609).toFixed(2));
            }

            return {
                user: user.id === id,
                username: user.name,
                formattedScore,
            };
        });

        // Sort by score descending
        leaderboardData.sort((a, b) => b.formattedScore - a.formattedScore);

        return leaderboardData;
    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        return [];
    }
}
export async function fetchTeamLeaderboardData(
    id: string,
    metric: boolean,
    team: number
) {
    try {
        let query = supabase
            .from("users")
            .select("id, name, country, activityLog")
            .eq("alliance", team);

        const { data, error } = await query;

        if (error) throw error;

        const leaderboardData = data.map((user) => {
            const activityLog = user.activityLog || {};

            // Convert activityLog object to array of entries: [date, data]
            const activityEntries = Object.entries(activityLog);

            // Extract all revealed areas for the period
            const revealedAreas = activityEntries.map(
                ([_, activity]: [string, any]) => activity.revealedArea
            );

            const validAreas = revealedAreas
                .flat(Infinity)
                .filter(
                    (area: any) =>
                        area &&
                        area.geometry &&
                        Array.isArray(area.geometry.coordinates) &&
                        area.geometry.coordinates.length > 0
                );

            // Use Turf.js to unify the geometries
            let unifiedArea: any;
            if (validAreas.length > 1) {
                unifiedArea = turf.featureCollection(validAreas);
            } else {
                unifiedArea = validAreas[0];
            }

            // Calculate area (score) in square meters
            const score =
                unifiedArea && validAreas.length >= 1
                    ? turf.area(unifiedArea)
                    : 0;

            let formattedScore;
            if (metric) {
                formattedScore = parseFloat((score / 1000).toFixed(2));
            } else {
                formattedScore = parseFloat((score / 1609).toFixed(2));
            }

            return {
                user: user.id === id,
                username: user.name,
                formattedScore,
            };
        });

        // Sort by score descending
        leaderboardData.sort((a, b) => b.formattedScore - a.formattedScore);

        return leaderboardData;
    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        return [];
    }
}
export async function fetchTeamCountData() {
    try {
        // Fetch all users with their alliance
        const { data, error } = await supabase.from("users").select("alliance");

        if (error) throw error;

        // Map the integer values to team names
        const teamNames = ["Earth", "Wind", "Fire", "Water"];
        const icons = ["mountain-sun", "wind", "fire", "water"];

        // Initialize a count object for each team
        const teamCounts = teamNames.map(() => 0);

        // Count the number of users in each alliance
        data.forEach((user) => {
            if (
                user.alliance !== null &&
                user.alliance >= 0 &&
                user.alliance < teamNames.length
            ) {
                teamCounts[user.alliance]++;
            }
        });

        // Map the counts to the team names
        const completeTeamsData = teamNames.map((teamName, index) => ({
            name: teamName,
            icon: icons[index],
            memberCount: teamCounts[index],
        }));

        return completeTeamsData;
    } catch (error) {
        console.error("Error fetching teams data:", error);
        return [];
    }
}
export async function fetchTeamData(team: number) {
    try {
        // Fetch all users with their alliance
        const { data, error } = await supabase
            .from("users")
            .select("name, country, activityLog, alliance")
            .eq("alliance", team);

        if (error) throw error;

        // Map the integer values to team names
        const teamNames = ["Earth", "Wind", "Fire", "Water"];
        const icons = ["mountain-sun", "wind", "fire", "water"];
        // Map the counts to the team names
        const completeTeamData = {
            name: teamNames[team],
            icon: icons[team],
            members: data,
        };

        return completeTeamData;
    } catch (error) {
        console.error("Error fetching teams data:", error);
        return [];
    }
}
function getStartOfPeriod(now: Date, period: string | string[]) {
    switch (period) {
        case "Daily":
            return new Date(now.getFullYear(), now.getMonth(), now.getDate());
        case "Weekly":
            const firstDayOfWeek = now.getDate() - now.getDay();
            return new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek);
        case "Monthly":
            return new Date(now.getFullYear(), now.getMonth(), 1);
        case "Yearly":
            return new Date(now.getFullYear(), 0, 1);
        case "AllTime":
            return new Date(0); // Epoch time
        default:
            return now;
    }
}
export const getUser = async (id: string) => {
    try {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) {
            console.error("Database fetching error: ", error);
        }
        return data;
    } catch (error) {
        console.error("Error fetching user data:", error);
        return {};
    }
};
export const joinTeam = async (id: string, team: number) => {
    try {
        const { data, error } = await supabase
            .from("users")
            .update({ alliance: team }) // Update the activityLog column
            .eq("id", id) // Ensure we're updating the correct user record
            .single(); // Fetch a single row

        if (error) {
            console.log(error);
            throw error;
        }
        console.log("Updated user alliance " + Date.now());
        return true;
    } catch (error: any) {
        console.error("Error updating user activity log:", error.message);
        throw error;
    }
};

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            const storedSession = await SecureStore.getItemAsync("session");
            if (storedSession) {
                const parsedSession = JSON.parse(storedSession);
                // console.log(
                //     "Session restored from SecureStore:",
                //     parsedSession
                // );
                setSession(parsedSession);
            } else {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                // console.log("Session fetched from Supabase:", session);
                setSession(session);
            }
            setIsLoading(false);
        };

        fetchSession();

        // Listen for auth state changes.
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                // console.log("onAuthStateChange event:", event, session);
                setSession(session);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            throw new Error(error.message);
        }
    };

    const signUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            throw new Error(error.message);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setSession(null);
    };

    return (
        <AuthContext.Provider
            value={{ session, isLoading, signIn, signUp, signOut }}
        >
            {children}
        </AuthContext.Provider>
    );
}
