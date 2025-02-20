import { Redirect, router } from "expo-router";
import {
    Alert,
    Button,
    Text,
    TextInput,
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { useSession, createNewUser } from "../../context/AuthContext";
import { useContext, useState } from "react";
import LoadingScreen from "@/components/Loading/Loading";
import DropdownInput from "@/components/DropdownInput/DropdownInput";
import CountryDropdown from "@/components/DropdownInput/DropdownSearchInput";
import { UserContext } from "@/context/UserContext";

export default function CreateProfile() {
    const { session, isLoading } = useSession();
    const [name, setName] = useState<string>("");
    const [units, setUnits] = useState<string>("");
    const [selectedCountry, setSelectedCountry] = useState<string>("");
    const userContext = useContext(UserContext);

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!session) {
        // On web, static rendering will stop here as the user is not authenticated
        // in the headless Node process that the pages are rendered in.
        return <Redirect href="/sign-in" />;
    } else {
        console.log("create-profile: " + session.user.id);
    }

    if (!userContext) {
        return <LoadingScreen />;
    }
    const { user, setUser } = userContext;

    if (user) {
        return <Redirect href="/" />;
    }

    const handleSubmit = async () => {
        if (!name || !units || !selectedCountry) {
            Alert.alert("All fields required");
            return;
        }
        try {
            await createNewUser(
                session.user.id,
                name,
                units,
                selectedCountry
            ).then(() => {
                router.push("/"); // Navigate after successful setup
            });
        } catch (error: any) {
            Alert.alert("Setup failed", error.message);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Create Your Profile</Text>
            </View>
            <TextInput
                placeholder="Your Name"
                placeholderTextColor="rgba(255,255,255,.5)"
                value={name}
                onChangeText={setName}
                style={{
                    width: "75%",
                    padding: 20,
                    borderWidth: 1,
                    borderColor: "#fff",
                    color: "#fff",
                    backgroundColor: "#25292e",
                    borderRadius: 6,
                }}
                autoCapitalize="none"
            />
            <DropdownInput
                options={["Kilometer", "Miles"]}
                selectedValue={units}
                onSelect={setUnits}
                placeholder="Units of Measurement"
            />
            <CountryDropdown
                selectedCountry={selectedCountry}
                onSelect={setSelectedCountry}
            />
            <TouchableOpacity
                style={[styles.productItem]}
                onPress={handleSubmit}
            >
                <Text style={[styles.productText]}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{}}
                onPress={() => {
                    router.push("/");
                }}
            >
                <Text style={{ color: "#fff", marginTop: 10 }}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
        backgroundColor: "rgb(18, 18, 18)",
    },
    titleContainer: {
        margin: 20,
    },
    title: {
        color: "#fff",
        fontSize: 32,
        fontWeight: 700,
    },
    subTitle: {
        color: "#fff",
        textAlign: "center",
    },
    productItem: {
        borderWidth: 2,
        borderColor: "#ffd33d",
        width: "75%",
        paddingVertical: 10,
        backgroundColor: "#25292e",
    },
    productText: {
        color: "#ffd33d",
        fontSize: 24,
        textAlign: "center",
    },
});
