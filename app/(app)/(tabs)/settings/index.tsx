import { useContext } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { UserContext } from "@/context/UserContext";
import { router } from "expo-router";
import { updateUnits, useSession } from "../../../../context/AuthContext";
import Purchases from "react-native-purchases";
import LoadingScreen from "@/components/Loading/Loading";

export default function SettingsScreen() {
    const userContext = useContext(UserContext);
    const { session, signOut } = useSession();

    if (!userContext) {
        return <LoadingScreen />;
    }

    const { user, setUser } = userContext;

    function getMapStyle() {
        switch (user?.mapStyle) {
            case "mapbox://styles/charlescon/cm6mktv4v018301qm8eckft27":
                return "Blueprint";
                break;
            case "mapbox://styles/charlescon/cm6mofuki00mf01s93jvub4ry":
                return "Overcast";
                break;
            case "mapbox://styles/mapbox/light-v11":
                return "Light";
                break;
            case "mapbox://styles/mapbox/dark-v11":
                return "Dark";
                break;
            case "mapbox://styles/charlescon/cm6mvjkgh009h01qsfdxpc1fj":
                return "Neon";
                break;
            case "mapbox://styles/charlescon/cm6mvx80e00mt01s94lepdhx9":
                return "Camo";
                break;
            case "mapbox://styles/charlescon/cm6mw9s8b019601qmh2degykc":
                return "X-Ray";
                break;
            case "mapbox://styles/charlescon/cm6mwbmq7019701qmha55hvzg":
                return "Vintage";
                break;
            default:
                return "Light";
                break;
        }
    }

    function toggleUnits() {
        if (setUser && user && session) {
            updateUnits(session.user.id, !user.metric);
            setUser({ ...user, metric: !user.metric });
        }
    }
    function getUnits() {
        if (user?.metric) {
            return "Kilometers";
        }
        return "Miles";
    }

    const restorePurchase = async () => {
        try {
            await Purchases.restorePurchases();
        } catch (e: any) {
            Alert.alert("Error restoring purchases", e.message);
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.headerContainer, styles.section]}>
                <Text style={styles.text}>{user?.name}</Text>
            </View>
            <Text style={styles.sectionTitle}>PREFERENCES</Text>
            <View>
                <TouchableOpacity
                    onPress={() => router.push("/settings/appearance")}
                >
                    <View style={[styles.section, styles.statsContainer]}>
                        <View style={styles.statItem}>
                            <Text style={styles.settingName}>
                                Map Appearance
                            </Text>
                            <Text
                                style={[
                                    styles.settingName,
                                    styles.settingValue,
                                ]}
                            >
                                {getMapStyle()}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity
                    onPress={() => router.push("/settings/color/fog")}
                >
                    <View style={[styles.section, styles.statsContainer]}>
                        <View style={styles.statItem}>
                            <Text style={styles.settingName}>Fog Color</Text>
                            <Text
                                style={[
                                    styles.settingName,
                                    styles.settingValue,
                                ]}
                            >
                                {user?.overlayColor}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={styles.divider} />
                {/* <TouchableOpacity
                    onPress={() => router.push("/settings/color/dot")}
                >
                    <View style={[styles.section, styles.statsContainer]}>
                        <View style={styles.statItem}>
                            <Text style={styles.settingName}>Dot Color</Text>
                            <Text
                                style={[
                                    styles.settingName,
                                    styles.settingValue,
                                ]}
                            >
                                {user?.dotColor}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={styles.divider} /> */}
                <TouchableOpacity onPress={() => toggleUnits()}>
                    <View style={[styles.section, styles.statsContainer]}>
                        <View style={styles.statItem}>
                            <Text style={styles.settingName}>
                                Units of Measurement
                            </Text>
                            <Text
                                style={[
                                    styles.settingName,
                                    styles.settingValue,
                                ]}
                            >
                                {getUnits()}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity onPress={() => restorePurchase()}>
                    <View style={[styles.statsContainer, styles.restoreBtn]}>
                        <View style={{}}>
                            <Text style={{ fontSize: 12, color: "#808080" }}>
                                Restore Purchases
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                style={[styles.logoutButton]}
                onPress={() => signOut()}
            >
                <View style={styles.innerLogoutButton}>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "rgb(18, 18, 18)",
        paddingVertical: 10,
        gap: 10,
    },
    sectionTitle: {
        color: "#fff",
        fontSize: 12,
        fontWeight: 700,
        paddingHorizontal: 20,
        marginTop: 10,
    },
    text: {
        color: "#fff",
        fontSize: 24,
    },
    settingName: {
        fontSize: 14,
        color: "#fff",
    },
    settingValue: {
        color: "#808080",
    },
    section: {
        backgroundColor: "rgb(30, 30, 30)",
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    restoreBtn: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    headerContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    statsContainer: {
        display: "flex",
        gap: 16,
    },
    statItem: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    statName: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    divider: {
        height: 1,
        backgroundColor: "rgb(40, 40, 40)",
    },
    logoutButton: {
        position: "absolute",
        bottom: 20,
        width: "100%",
    },
    innerLogoutButton: {
        width: "95%",
        height: "100%",
        borderColor: "rgba(255, 211, 61, .5)",
        borderWidth: 1,
        borderRadius: 6,
        paddingVertical: 10,
        marginHorizontal: "auto",
    },
    logoutText: {
        color: "#fff",
        textAlign: "center",
    },
});
