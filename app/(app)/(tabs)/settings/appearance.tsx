import { useContext, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { UserContext } from "@/context/UserContext";
import { useRouter } from "expo-router";
import LoadingScreen from "@/components/Loading/Loading";
import { updateMapStyle, useSession } from "@/context/AuthContext";

const mapStyles = [
    { name: "Light", value: "mapbox://styles/mapbox/light-v11" },
    { name: "Dark", value: "mapbox://styles/mapbox/dark-v11" },
    {
        name: "Overcast",
        value: "mapbox://styles/charlescon/cm6mofuki00mf01s93jvub4ry",
    },
    {
        name: "Blueprint",
        value: "mapbox://styles/charlescon/cm6mktv4v018301qm8eckft27",
    },
    {
        name: "Neon",
        value: "mapbox://styles/charlescon/cm6mvjkgh009h01qsfdxpc1fj",
    },
    {
        name: "Camo",
        value: "mapbox://styles/charlescon/cm6mvx80e00mt01s94lepdhx9",
    },
    {
        name: "X-Ray",
        value: "mapbox://styles/charlescon/cm6mw9s8b019601qmh2degykc",
    },
    {
        name: "Vintage",
        value: "mapbox://styles/charlescon/cm6mwbmq7019701qmha55hvzg",
    },
];

export default function AppearanceScreen() {
    const userContext = useContext(UserContext);
    const { session } = useSession();
    const router = useRouter();

    if (!userContext) {
        return <LoadingScreen />;
    }

    const { user, setUser } = userContext;
    const [selectedStyle, setSelectedStyle] = useState(user?.mapStyle);

    function handleSelectStyle(styleValue: string) {
        if (user && setUser && session) {
            updateMapStyle(session?.user.id, styleValue);
            setUser({ ...user, mapStyle: styleValue });
            router.push("/(app)/(tabs)"); // Go back to the settings page
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select a Map Style</Text>
            {mapStyles.map((style) => (
                <TouchableOpacity
                    key={style.value}
                    onPress={() => handleSelectStyle(style.value)}
                >
                    <View
                        style={[
                            styles.option,
                            selectedStyle === style.value && styles.selected,
                        ]}
                    >
                        <Text style={styles.optionText}>{style.name}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "rgb(18, 18, 18)",
        padding: 20,
    },
    title: {
        color: "#fff",
        fontSize: 18,
        marginBottom: 10,
    },
    option: {
        backgroundColor: "rgb(30, 30, 30)",
        padding: 15,
        marginVertical: 5,
        borderRadius: 8,
    },
    selected: {
        borderColor: "#ffd33d",
        borderWidth: 2,
    },
    optionText: {
        color: "#fff",
        fontSize: 16,
    },
});
