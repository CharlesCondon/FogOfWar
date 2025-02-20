import React, { useRef, useEffect, useState } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface DynamicToggleProps {
    options: string[];
    onToggle: (selected: string) => void;
    small: boolean;
}

const SlidingToggle: React.FC<DynamicToggleProps> = ({
    options,
    onToggle,
    small,
}) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const translateX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: selectedIndex,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [selectedIndex]);

    const handleToggle = (index: any) => {
        setSelectedIndex(index);
        if (onToggle) onToggle(options[index]);
    };

    return (
        <View style={styles.toggleContainer}>
            <Animated.View
                style={[
                    styles.slider,
                    {
                        width: `${100 / options.length}%`,
                        left: translateX.interpolate({
                            inputRange: options.map((_, i) => i),
                            outputRange: options.map(
                                (_, i) => `${(i * 100) / options.length}%`
                            ),
                        }),
                    },
                ]}
            />
            {options.map((option: string, index: number) => (
                <TouchableOpacity
                    key={index}
                    style={styles.toggleButton}
                    onPress={() => handleToggle(index)}
                >
                    <Text
                        style={[
                            small ? styles.smallText : styles.text,
                            selectedIndex === index
                                ? styles.activeText
                                : styles.inactiveText,
                        ]}
                    >
                        {option}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    toggleContainer: {
        flexDirection: "row",
        width: "75%",
        height: 40,
        backgroundColor: "#f0f0f0",
        borderRadius: 25,
        position: "relative",
        overflow: "hidden",
        marginHorizontal: "auto",
        marginBottom: 10,
    },
    slider: {
        position: "absolute",
        height: "100%",
        backgroundColor: "#ffd33d",
        borderRadius: 25,
        zIndex: 1,
    },
    toggleButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
    },
    text: {
        fontSize: 16,
        fontWeight: "600",
    },
    smallText: {
        fontSize: 12,
        fontWeight: "600",
    },
    activeText: {
        color: "#25292e",
    },
    inactiveText: {
        color: "#888",
    },
});

export default SlidingToggle;
