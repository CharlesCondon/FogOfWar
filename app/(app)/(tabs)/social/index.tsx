import {
    FontAwesome,
    Ionicons,
    MaterialCommunityIcons,
    Fontisto,
} from "@expo/vector-icons";
import { useContext, useEffect, useRef, useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
} from "react-native";
import { UserContext } from "@/context/UserContext";
import { router } from "expo-router";
import LoadingScreen from "@/components/Loading/Loading";
import SlidingToggle from "@/components/SlidingToggle/slidingToggle";
import { fetchLeaderboardData, useSession } from "@/context/AuthContext";

export default function SocialScreen() {
    const { session, isLoading } = useSession();
    const userContext = useContext(UserContext);
    const [isLocal, setIsLocal] = useState(true);

    if (!session) {
        router.replace("/sign-in");
    }

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!userContext) {
        return <LoadingScreen />;
    }

    return (
        <ScrollView style={styles.pageContainer}>
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>Leaderboards</Text>
                <SlidingToggle
                    options={["Local", "Global"]}
                    onToggle={(selected: string) =>
                        setIsLocal(selected === "Local")
                    }
                    small={false}
                />

                <View style={styles.timesContainer}>
                    <TouchableOpacity
                        onPress={() =>
                            router.push(
                                `/social/leaderboard/${
                                    isLocal ? "local" : "global"
                                }/Daily`
                            )
                        }
                    >
                        <View style={styles.fullStatItem}>
                            <View style={styles.statItem}>
                                <Text style={styles.settingName}>Daily</Text>
                                <Text
                                    style={[
                                        styles.settingName,
                                        styles.settingValue,
                                    ]}
                                ></Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() =>
                            router.push(
                                `/social/leaderboard/${
                                    isLocal ? "local" : "global"
                                }/Weekly`
                            )
                        }
                    >
                        <View style={styles.fullStatItem}>
                            <View style={styles.statItem}>
                                <Text style={styles.settingName}>Weekly</Text>
                                <Text
                                    style={[
                                        styles.settingName,
                                        styles.settingValue,
                                    ]}
                                ></Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() =>
                            router.push(
                                `/social/leaderboard/${
                                    isLocal ? "local" : "global"
                                }/Monthly`
                            )
                        }
                    >
                        <View style={styles.fullStatItem}>
                            <View style={styles.statItem}>
                                <Text style={styles.settingName}>Monthly</Text>
                                <Text
                                    style={[
                                        styles.settingName,
                                        styles.settingValue,
                                    ]}
                                ></Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() =>
                            router.push(
                                `/social/leaderboard/${
                                    isLocal ? "local" : "global"
                                }/Yearly`
                            )
                        }
                    >
                        <View style={styles.fullStatItem}>
                            <View style={styles.statItem}>
                                <Text style={styles.settingName}>Yearly</Text>
                                <Text
                                    style={[
                                        styles.settingName,
                                        styles.settingValue,
                                    ]}
                                ></Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() =>
                            router.push(
                                `/social/leaderboard/${
                                    isLocal ? "local" : "global"
                                }/AllTime`
                            )
                        }
                    >
                        <View style={styles.fullStatItem}>
                            <View style={styles.statItem}>
                                <Text style={styles.settingName}>All Time</Text>
                                <Text
                                    style={[
                                        styles.settingName,
                                        styles.settingValue,
                                    ]}
                                ></Text>
                            </View>
                        </View>
                    </TouchableOpacity>
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
        paddingVertical: 10,
        gap: 10,
        minHeight: "100%",
        marginTop: 30,
    },
    sectionTitle: {
        color: "#fff",
        fontSize: 26,
        fontWeight: 700,
        paddingHorizontal: 20,
        textAlign: "center",
    },
    timesContainer: {
        display: "flex",
        gap: 10,
    },
    fullStatItem: {
        display: "flex",
        padding: 20,
        marginHorizontal: 10,
        borderRadius: 10,
        backgroundColor: "#25292e",
        gap: 20,
    },
    statItem: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    settingName: {
        fontSize: 14,
        color: "#fff",
    },
    settingValue: {
        color: "#808080",
    },
});
