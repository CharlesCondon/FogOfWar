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
import { router } from "expo-router";
import LoadingScreen from "@/components/Loading/Loading";

export default function AllianceScreen() {
    const userContext = useContext(UserContext);

    if (!userContext) {
        return <LoadingScreen />;
    }

    const { user, setUser } = userContext;

    return (
        <ScrollView style={styles.pageContainer}>
            <View style={styles.container}>
                <View style={[styles.headerContainer, styles.section, ,]}>
                    <Text style={[styles.text, { fontWeight: 700 }]}>
                        Coming Soon
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    text: {
        color: "#fff",
        fontSize: 24,
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
        backgroundColor: "rgb(30, 30, 30)",
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    headerContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
});
