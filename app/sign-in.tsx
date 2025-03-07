import { router } from "expo-router";
import {
    Alert,
    Text,
    TextInput,
    View,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { handleAppleAuth, useSession } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function SignIn() {
    const { signIn, signUp, session } = useSession();

    useEffect(() => {
        if (session) {
            router.replace("/"); // Or router.push("/") if appropriate.
        }
    }, [session]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [option, setOption] = useState("");

    const handleSignIn = async () => {
        try {
            await signIn(email, password);
            router.replace("/"); // Navigate after successful sign-in
        } catch (error: any) {
            Alert.alert("Sign-in failed", error.message);
        }
    };
    const handleSignUp = async () => {
        if (password !== password2) {
            Alert.alert("Passwords must be matching");
            return;
        }
        try {
            await signUp(email, password);

            router.replace("/(app)/create-profile"); // Navigate after successful sign-in
        } catch (error: any) {
            Alert.alert("Sign-up failed", error.message);
            //
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Aimless</Text>
                <Text style={styles.subTitle}>Rediscover Your Home</Text>
            </View>
            {option && (
                <>
                    <TextInput
                        placeholder="Email"
                        placeholderTextColor="rgba(255,255,255,.5)"
                        value={email}
                        onChangeText={setEmail}
                        style={{
                            width: "75%",
                            padding: 20,
                            borderWidth: 1,
                            borderColor: "#fff",
                            color: "#fff",
                            backgroundColor: "#25292e",
                            marginBottom: 10,
                            borderRadius: 6,
                        }}
                        autoCapitalize="none"
                    />
                    <TextInput
                        placeholder="Password"
                        placeholderTextColor="rgba(255,255,255,.5)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={{
                            width: "75%",
                            padding: 20,
                            borderWidth: 1,
                            borderColor: "#fff",
                            color: "#fff",
                            backgroundColor: "#25292e",
                            marginBottom: 10,
                            borderRadius: 6,
                        }}
                    />

                    {/* User Selects 'Sign In' */}
                    {option === "signin" ? (
                        <>
                            <TouchableOpacity
                                style={styles.productItem}
                                onPress={handleSignIn}
                            >
                                <Text style={[styles.productText]}>
                                    Sign In
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{}}
                                onPress={() => setOption("signup")}
                            >
                                <Text style={{ color: "#fff", marginTop: 10 }}>
                                    Sign Up
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.dividerContainer}>
                                <View style={styles.divider}></View>
                                <Text style={{ color: "rgba(255,255,255,.5)" }}>
                                    OR
                                </Text>
                                <View style={styles.divider}></View>
                            </View>

                            <View>
                                <AppleAuthentication.AppleAuthenticationButton
                                    buttonType={
                                        AppleAuthentication
                                            .AppleAuthenticationButtonType
                                            .SIGN_IN
                                    }
                                    buttonStyle={
                                        AppleAuthentication
                                            .AppleAuthenticationButtonStyle
                                            .BLACK
                                    }
                                    cornerRadius={5}
                                    style={styles.button}
                                    onPress={handleAppleAuth}
                                />
                            </View>
                        </>
                    ) : (
                        // User Selects 'Sign Up'
                        <>
                            <TextInput
                                placeholder="Password"
                                placeholderTextColor="rgba(255,255,255,.5)"
                                value={password2}
                                onChangeText={setPassword2}
                                secureTextEntry
                                style={{
                                    width: "75%",
                                    padding: 20,
                                    borderWidth: 1,
                                    borderColor: "#fff",
                                    color: "#fff",
                                    backgroundColor: "#25292e",
                                    marginBottom: 10,
                                    borderRadius: 6,
                                }}
                            />
                            <TouchableOpacity
                                style={[styles.productItem]}
                                onPress={handleSignUp}
                            >
                                <Text style={[styles.productText]}>
                                    Sign Up
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{}}
                                onPress={() => setOption("signin")}
                            >
                                <Text style={{ color: "#fff", marginTop: 10 }}>
                                    Sign In
                                </Text>
                            </TouchableOpacity>
                            <View style={styles.dividerContainer}>
                                <View style={styles.divider}></View>
                                <Text style={{ color: "rgba(255,255,255,.5)" }}>
                                    OR
                                </Text>
                                <View style={styles.divider}></View>
                            </View>

                            <View>
                                <AppleAuthentication.AppleAuthenticationButton
                                    buttonType={
                                        AppleAuthentication
                                            .AppleAuthenticationButtonType
                                            .SIGN_UP
                                    }
                                    buttonStyle={
                                        AppleAuthentication
                                            .AppleAuthenticationButtonStyle
                                            .BLACK
                                    }
                                    cornerRadius={5}
                                    style={styles.button}
                                    onPress={handleAppleAuth}
                                />
                            </View>
                        </>
                    )}
                </>
            )}

            {!option && (
                <>
                    <TouchableOpacity
                        style={styles.productItem}
                        onPress={() => setOption("signin")}
                    >
                        <Text style={[styles.productText]}>Sign In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.productItem}
                        onPress={() => setOption("signup")}
                    >
                        <Text style={[styles.productText]}>Sign Up</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    dividerContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginVertical: 10,
    },
    divider: {
        height: 1,
        borderColor: "rgba(255,255,255,.25)",
        borderWidth: 1,
        width: "32%",
    },
    button: {
        width: 200,
        height: 44,
    },
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
        marginBottom: 60,
    },
    title: {
        color: "#fff",
        fontSize: 64,
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
