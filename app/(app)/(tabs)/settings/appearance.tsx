import { useContext, useEffect, useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { UserContext } from "@/context/UserContext";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import LoadingScreen from "@/components/Loading/Loading";
import { updateMapStyle, useSession } from "@/context/AuthContext";

const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export default function AppearanceScreen() {
    const userContext = useContext(UserContext);
    const { session } = useSession();
    const router = useRouter();

    const [mapStyles, setMapStyles] = useState([
        {
            id: 0,
            name: "Blueprint",
            value: "mapbox://styles/charlescon/cm6mktv4v018301qm8eckft27",
            url: require("@/assets/images/blueprint.png"),
            disabled: true,
        },
        {
            id: 1,
            name: "Overcast",
            value: "mapbox://styles/charlescon/cm6mofuki00mf01s93jvub4ry",
            url: require("@/assets/images/overcast.png"),
            disabled: true,
        },
        {
            id: 2,
            name: "X-Ray",
            value: "mapbox://styles/charlescon/cm6mw9s8b019601qmh2degykc",
            url: require("@/assets/images/x-ray.png"),
            disabled: true,
        },
        {
            id: 3,
            name: "Neon",
            value: "mapbox://styles/charlescon/cm6mvjkgh009h01qsfdxpc1fj",
            url: require("@/assets/images/neon.png"),
            disabled: true,
        },
        {
            id: 4,
            name: "Camo",
            value: "mapbox://styles/charlescon/cm6mvx80e00mt01s94lepdhx9",
            url: require("@/assets/images/camo.png"),
            disabled: true,
        },
        {
            id: 5,
            name: "Vintage",
            value: "mapbox://styles/charlescon/cm6mwbmq7019701qmha55hvzg",
            url: require("@/assets/images/vintage.png"),
            disabled: true,
        },
        {
            id: 6,
            name: "Dark",
            value: "mapbox://styles/mapbox/dark-v11",
            url: require("@/assets/images/dark.png"),
            disabled: false,
        },
        {
            id: 7,
            name: "Light",
            value: "mapbox://styles/mapbox/light-v11",
            url: require("@/assets/images/light.png"),
            disabled: false,
        },
    ]);

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

    useEffect(() => {
        if (user?.cosmetics && user.cosmetics.length > 0) {
            setMapStyles((prevCosmetics) => {
                const updatedCosmetics = [...prevCosmetics];
                user.cosmetics.forEach((cosmeticId) => {
                    if (
                        cosmeticId >= 0 &&
                        cosmeticId < updatedCosmetics.length
                    ) {
                        updatedCosmetics[cosmeticId] = {
                            ...updatedCosmetics[cosmeticId],
                            disabled: false,
                        };
                    }
                });
                return updatedCosmetics;
            });
        }
    }, [user?.cosmetics]);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Select a Map Style</Text>
            <View style={{ marginBottom: 30 }}>
                {mapStyles.map((style, idx) => (
                    <TouchableOpacity
                        key={style.value}
                        onPress={() => handleSelectStyle(style.value)}
                        disabled={style.disabled}
                        style={style.disabled ? { opacity: 0.15 } : {}}
                    >
                        <View
                            style={[
                                styles.option,
                                selectedStyle === style.value &&
                                    styles.selected,
                            ]}
                        >
                            <Image
                                style={styles.image}
                                source={style.url}
                                placeholder={{ blurhash }}
                                contentFit="contain"
                                transition={500}
                            />
                            <Text style={styles.optionText}>{style.name}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    image: {
        width: 80,
        height: 80,
        maxHeight: 80,
        borderWidth: 1,
        borderColor: "rgb(18, 18, 18)",
        borderRadius: 6,
    },
    container: {
        flex: 1,
        backgroundColor: "rgb(18, 18, 18)",
        paddingHorizontal: 20,
        paddingVertical: 40,
        paddingBottom: 100,
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
        display: "flex",
        flexDirection: "row",
        gap: 15,
    },
    selected: {
        borderColor: "#ffd33d",
        borderWidth: 2,
    },
    optionText: {
        color: "#fff",
        fontSize: 30,
        fontWeight: 400,
        marginVertical: "auto",
    },
});
