import {
    FontAwesome,
    Ionicons,
    MaterialCommunityIcons,
    Fontisto,
} from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { UserContext } from "@/context/UserContext";
import { router, useLocalSearchParams } from "expo-router";
import LoadingScreen from "@/components/Loading/Loading";
import SlidingToggle from "@/components/SlidingToggle/slidingToggle";
import { fetchLeaderboardData, useSession } from "@/context/AuthContext";

export default function SocialScreen() {
    const { session, isLoading } = useSession();
    const userContext = useContext(UserContext);
    const time = useLocalSearchParams().time;
    const area = useLocalSearchParams().area;
    const [leaderboardData, setLeaderboardData] =
        useState<
            { user: boolean; username: string; formattedScore: number }[]
        >();

    if (!session) {
        router.replace("/sign-in");
    }

    if (isLoading || !userContext) {
        return <LoadingScreen />;
    }

    const { user } = userContext;

    useEffect(() => {
        const loadLeaderboard = async () => {
            if (user && session) {
                const data = await fetchLeaderboardData(
                    session.user.id,
                    user.metric,
                    area,
                    user.country,
                    time
                );
                setLeaderboardData(data);
            }
        };

        loadLeaderboard();
    }, []);

    function capitalizeFirstLetter(val: any) {
        if (!val) {
            return "";
        }
        return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }

    const getUserPosition = () => {
        if (!leaderboardData) return "";
        return leaderboardData.findIndex((entry) => entry.user) + 1;
    };

    if (!leaderboardData) {
        return <LoadingScreen />;
    }

    return (
        <ScrollView style={styles.pageContainer}>
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>
                    {capitalizeFirstLetter(area)} Leaderboard
                </Text>

                <View style={styles.leaderboardList}>
                    {leaderboardData && leaderboardData.length > 0 ? (
                        leaderboardData.map((entry, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.leaderboardItem,
                                    entry.user && styles.currentUserHighlight,
                                ]}
                            >
                                <View style={styles.leaderboardItemTitle}>
                                    <Text style={styles.rank}>
                                        #{index + 1}
                                    </Text>
                                    <Text style={styles.username}>
                                        {entry.username}
                                    </Text>
                                </View>
                                <Text style={styles.score}>
                                    {entry.formattedScore.toFixed(2)}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noDataText}>No data available</Text>
                    )}
                </View>

                <View style={styles.userPositionContainer}>
                    <Text style={styles.userPositionText}>
                        Your Position: #{getUserPosition()}
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    pageContainer: {
        backgroundColor: "rgb(18, 18, 18)",
    },
    container: {
        flex: 1,
        backgroundColor: "rgb(18, 18, 18)",
        minHeight: "100%",
        marginTop: 40,
        gap: 10,
    },
    sectionTitle: {
        color: "#fff",
        fontSize: 26,
        fontWeight: "700",
        paddingHorizontal: 20,
        textAlign: "center",
    },
    leaderboardList: {
        display: "flex",
        gap: 0,
    },
    leaderboardItem: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#25292e",
        padding: 15,
        marginHorizontal: 20,
        marginVertical: 5,
        borderRadius: 10,
    },
    leaderboardItemTitle: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 32,
    },
    currentUserHighlight: {
        backgroundColor: "#374151",
        borderColor: "#ffd33d",
        borderWidth: 2,
    },
    rank: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    username: {
        color: "#fff",
        fontSize: 16,
        textAlign: "center",
    },
    score: {
        color: "#ffd33d",
        fontSize: 18,
        fontWeight: "600",
    },
    noDataText: {
        color: "#808080",
        fontSize: 16,
        textAlign: "center",
        marginTop: 20,
    },
    userPositionContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: "#25292e",
        marginHorizontal: 20,
        borderRadius: 10,
    },
    userPositionText: {
        color: "#fff",
        fontSize: 18,
        textAlign: "center",
        fontWeight: "600",
    },
});
