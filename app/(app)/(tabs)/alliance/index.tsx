import {
    FontAwesome,
    Ionicons,
    MaterialCommunityIcons,
    Fontisto,
    FontAwesome6,
    AntDesign,
} from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from "react-native";
import { UserContext } from "@/context/UserContext";
import { router } from "expo-router";
import LoadingScreen from "@/components/Loading/Loading";
import React from "react";
import {
    fetchTeamCountData,
    fetchTeamData,
    joinTeam,
    useSession,
} from "@/context/AuthContext";

export default function AllianceScreen() {
    const { session, isLoading } = useSession();
    const userContext = useContext(UserContext);
    const [userTeamData, setUserTeamData] = useState<{
        name: string;
        icon: string;
        members: {
            name: any;
            country: any;
            activityLog: any;
            alliance: any;
        }[];
    }>();
    const [teamsData, setTeamsData] =
        useState<{ name: string; icon: string; memberCount: number }[]>();

    if (!userContext) {
        return <LoadingScreen />;
    }

    if (!session) {
        router.replace("/sign-in");
    }

    const { user, setUser } = userContext;

    if (isLoading || !userContext || !user) {
        return <LoadingScreen />;
    }

    useEffect(() => {
        const loadTeams = async () => {
            if (user && session && !user.alliance) {
                const data = await fetchTeamCountData();
                setTeamsData(data);
            } else if (user && session && user.alliance) {
                const data = await fetchTeamData(user.alliance);
                setUserTeamData(data as any);
            }
        };
        loadTeams();
    }, []);

    const handleJoinTeam = async (team: number) => {
        if (user && setUser && session) {
            const success = await joinTeam(session.user.id, team);
            if (success) {
                setUser({ ...user, alliance: team });
                const data = await fetchTeamData(team);
                setUserTeamData(data as any);
            } else {
                Alert.alert(
                    "Error",
                    "Failed to join the team. Please try again."
                );
            }
        }
    };

    function comingSoon() {
        Alert.alert("Feature Coming Soon");
    }

    if ((!user.alliance && !teamsData) || (user.alliance && !userTeamData)) {
        return <LoadingScreen />;
    }

    return (
        <ScrollView style={styles.pageContainer}>
            {user.alliance ? (
                <View style={styles.container}>
                    <View style={styles.backgroundHeader}></View>
                    <View
                        style={[
                            styles.headerContainer,
                            styles.section,
                            { alignItems: "flex-start", marginTop: "30%" },
                        ]}
                    >
                        <FontAwesome6
                            name={userTeamData?.icon}
                            color="white"
                            size={80}
                        />
                        <Text
                            style={[
                                styles.text,
                                { textAlign: "left", marginHorizontal: 0 },
                            ]}
                        >
                            Team {userTeamData?.name}
                        </Text>
                        <View style={[styles.memberNum]}>
                            <Ionicons name="people" color="white" size={18} />
                            <Text style={styles.altSubtext}>
                                {userTeamData?.members.length} members
                            </Text>
                        </View>
                    </View>
                    <View style={styles.actionButtonContainer}>
                        <TouchableOpacity
                            onPress={() => {
                                comingSoon();
                            }}
                            style={styles.actionButton}
                        >
                            <View style={styles.actionButtonImg}>
                                <Ionicons
                                    name="map-outline"
                                    color="white"
                                    size={24}
                                />
                            </View>
                            <Text style={styles.altSubtext}>Map</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() =>
                                router.push(
                                    `/(app)/(tabs)/alliance/ranks/${userTeamData?.name}`
                                )
                            }
                            style={styles.actionButton}
                        >
                            <View style={styles.actionButtonImg}>
                                <Ionicons
                                    name="trophy"
                                    color="white"
                                    size={24}
                                />
                            </View>
                            <Text style={styles.altSubtext}>Ranks</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                comingSoon();
                            }}
                            style={styles.actionButton}
                        >
                            <View style={styles.actionButtonImg}>
                                <Ionicons
                                    name="stats-chart"
                                    color="white"
                                    size={24}
                                />
                            </View>
                            <Text style={styles.altSubtext}>Stats</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                comingSoon();
                            }}
                            style={styles.actionButton}
                        >
                            <View style={styles.actionButtonImg}>
                                <AntDesign
                                    name="infocirlceo"
                                    color="white"
                                    size={24}
                                />
                            </View>
                            <Text style={styles.altSubtext}>About</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.container}>
                    <View style={[styles.headerContainer, styles.section]}>
                        <Text style={styles.text}>Choose An Alliance</Text>
                        {/* <Text style={styles.subtext}>
                            -You can change this later-
                        </Text> */}
                    </View>
                    <View style={styles.teamListContainer}>
                        {teamsData?.map((team, index) => {
                            return (
                                <View
                                    key={team.name}
                                    style={styles.teamContainer}
                                >
                                    <FontAwesome6
                                        name={team.icon}
                                        color="white"
                                        size={60}
                                    />
                                    <Text style={styles.teamName}>
                                        Team {team.name}
                                    </Text>
                                    <View style={styles.memberNum}>
                                        <Ionicons
                                            name="people"
                                            color="white"
                                            size={16}
                                        />
                                        <Text style={styles.subtext}>
                                            {team.memberCount} members
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleJoinTeam(index)}
                                        style={styles.joinButton}
                                    >
                                        <Text style={styles.joinText}>
                                            Join
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    backgroundHeader: {
        position: "absolute",
        top: 0,
        left: 0,
        backgroundColor: "rgba(255, 211, 61, .5)",
        height: "30%",
        width: "100%",
    },
    text: {
        color: "#fff",
        fontSize: 32,
        fontWeight: 700,
        textAlign: "center",
        marginHorizontal: "auto",
    },
    subtext: {
        color: "#fff",
        fontSize: 14,
        fontWeight: 400,
    },
    altSubtext: {
        color: "#fff",
        fontSize: 16,
        fontWeight: 400,
    },
    pageContainer: {
        backgroundColor: "rgb(18, 18, 18)",
    },
    container: {
        flex: 1,
        backgroundColor: "rgb(18, 18, 18)",
        paddingVertical: 10,
        gap: 10,
        minHeight: "100%",
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    headerContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
    },
    teamListContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 10,
    },
    teamContainer: {
        width: "48%", // Ensures two items per row with some spacing
        marginBottom: 10,
        padding: 20,
        borderRadius: 10,
        backgroundColor: "#25292e",
        gap: 10,
        alignItems: "center", // Centers content horizontally
    },
    teamName: {
        color: "#fff",
        fontSize: 20,
        fontWeight: 700,
    },
    memberNum: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    joinButton: {
        backgroundColor: "#ffd33d",
        paddingVertical: 4,
        borderRadius: 6,
        marginTop: 40,
        width: "100%",
    },
    joinText: {
        textAlign: "center",
        fontWeight: 700,
    },
    actionButtonContainer: {
        borderColor: "rgb(40, 40, 40)",
        borderTopWidth: 1,
        borderBottomWidth: 1,
        width: "100%",
        display: "flex",
        flexDirection: "row",
        gap: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        justifyContent: "space-between",
    },
    actionButton: {
        display: "flex",
        alignItems: "center",
        gap: 5,
    },
    actionButtonImg: {
        backgroundColor: "#25292e",
        padding: 18,
        borderRadius: "100%",
    },
});
