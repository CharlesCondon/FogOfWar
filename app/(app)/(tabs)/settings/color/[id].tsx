import { useContext, useEffect, useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    Button,
    Modal,
} from "react-native";
import ColorPicker, {
    Panel1,
    Swatches,
    Preview,
    OpacitySlider,
    HueSlider,
} from "reanimated-color-picker";
import { UserContext } from "@/context/UserContext";
import {
    useGlobalSearchParams,
    useLocalSearchParams,
    useRouter,
} from "expo-router";
import LoadingScreen from "@/components/Loading/Loading";
import { updateUserColors, useSession } from "@/context/AuthContext";

export default function AppearanceScreen() {
    const [showModal, setShowModal] = useState(false);
    const [colorPage, setColorPage] = useState<string | string[]>("fog");
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
    const [newColor, setNewColor] = useState<string>();
    const userContext = useContext(UserContext);
    const router = useRouter();
    const local = useLocalSearchParams();

    if (!userContext) {
        return <LoadingScreen />;
    }
    const { session } = useSession();
    const { user, setUser } = userContext;
    const [selectedStyle, setSelectedStyle] = useState(user?.mapStyle);

    useEffect(() => {
        if (local.id) {
            setColorPage(local.id);
        }
    }, []);

    function compareColors(str1: string, str2: string) {
        return str1.replace(/\s/g, "") === str2.replace(/\s/g, "");
    }

    // Note: 👇 This can be a `worklet` function.
    const onSelectColor = ({ rgb }: any) => {
        if (!user) return;
        if (colorPage === "fog") {
            if (!compareColors(rgb, user.overlayColor)) {
                setButtonDisabled(false);
                setNewColor(rgb);
                return;
            }
        } else {
            if (!compareColors(rgb, user.dotColor)) {
                setButtonDisabled(false);
                setNewColor(rgb);
                return;
            }
        }
        setButtonDisabled(true);
    };

    function confirmFogColor() {
        if (!session || !user || !setUser) return;
        if (colorPage === "fog" && newColor) {
            updateUserColors(session.user.id, newColor, "fog");
            setUser({ ...user, overlayColor: newColor });
            router.push("../../");
        } else if (colorPage === "dot" && newColor) {
            updateUserColors(session.user.id, newColor, "dot");
            setUser({ ...user, dotColor: newColor });
            router.push("../../");
        }
    }

    return (
        <View style={styles.container}>
            <ColorPicker
                style={{ width: "90%", display: "flex", gap: 16 }}
                value={
                    colorPage === "fog" ? user?.overlayColor : user?.dotColor
                }
                sliderThickness={20}
                thumbSize={30}
                onComplete={onSelectColor}
            >
                <Preview />
                <Panel1 />
                <HueSlider style={{ marginVertical: 10 }} />
                <Swatches style={{ marginBottom: 10 }} />
            </ColorPicker>

            <TouchableOpacity
                disabled={buttonDisabled}
                onPress={() => confirmFogColor()}
                style={[
                    styles.confirmButton,
                    buttonDisabled && styles.disabledButton,
                ]}
            >
                <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "rgb(18, 18, 18)",
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        color: "#fff",
        fontSize: 18,
        marginBottom: 10,
    },
    confirmButton: {
        display: "flex",
        alignItems: "center",
        width: "90%",
        backgroundColor: "#ffd33d",
        paddingVertical: 10,
        borderRadius: 6,
        textAlign: "center",
    },
    disabledButton: {
        opacity: 0.15,
    },
    confirmText: {
        color: "#000",
        fontWeight: 700,
    },
});
