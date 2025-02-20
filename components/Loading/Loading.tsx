import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import Feather from "@expo/vector-icons/Feather";

export default function LoadingScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Fade-in effect
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();

        // Continuous pulse effect
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.2,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // **Smooth Continuous Rotation**
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 2000, // Adjust speed as needed
                easing: Easing.linear, // Ensures a smooth transition
                useNativeDriver: true,
            })
        ).start();
    }, []);

    // Interpolating rotation value (0 → 360 degrees)
    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    return (
        <View style={styles.container}>
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [
                        { scale: scaleAnim },
                        { rotate: rotateInterpolate },
                    ],
                }}
            >
                <Feather name="loader" size={40} color="white" />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgb(18, 18, 18)",
    },
});
