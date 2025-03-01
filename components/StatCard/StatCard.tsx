import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";

function formatNumber(num: string) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function StatCard({
    title,
    value,
    size,
    iconType,
    icon,
    metric,
    percent,
}: {
    title: string;
    value: number | string;
    size: string;
    iconType: string;
    icon: string;
    metric: boolean;
    percent: boolean;
}) {
    // For text type stats (like the home country), you may choose a different check.
    const shouldShowSpinner =
        typeof value === "number"
            ? value === 0
            : !value ||
              (parseFloat(value) === 0 && title === "Total Area Revealed");

    return size === "small" ? (
        <View style={styles.squareStatItem}>
            <View style={styles.statIconValue}>
                {iconType === "ionicons" ? (
                    <Ionicons name={icon as any} color="white" size={28} />
                ) : (
                    <FontAwesome name={icon as any} color="white" size={28} />
                )}

                <Text style={styles.statItemName}>{title}</Text>
            </View>
            <View style={[styles.statIconValue]}>
                {shouldShowSpinner ? (
                    <ActivityIndicator size="small" color="#FFF" />
                ) : (
                    <>
                        {!percent ? (
                            <Text style={styles.statSquareItemValue}>
                                {formatNumber(value as string)}{" "}
                                {metric ? "km²" : "mi²"}
                            </Text>
                        ) : (
                            <Text style={styles.statSquareItemValue}>
                                {value} %
                            </Text>
                        )}
                    </>
                )}
            </View>
        </View>
    ) : (
        <View style={[styles.fullStatItem]}>
            <Text style={styles.statItemName}>{title}</Text>
            {shouldShowSpinner ? (
                <ActivityIndicator size="small" color="#FFF" />
            ) : (
                <View style={[styles.statIconValue]}>
                    {iconType === "ionicons" ? (
                        <Ionicons name={icon as any} color="white" size={28} />
                    ) : (
                        <FontAwesome
                            name={icon as any}
                            color="white"
                            size={28}
                        />
                    )}
                    <Text style={[styles.statItemValue]}>
                        {formatNumber(value as string)} {metric ? "km²" : "mi²"}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    // Isolated Stat Classes
    fullStatItem: {
        display: "flex",
        padding: 20,
        marginHorizontal: 10,
        borderRadius: 20,
        backgroundColor: "#25292e",
        gap: 20,
    },
    statItemName: {
        color: "#FFF",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    statIconValue: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    statItemValue: {
        color: "#FFF",
        fontSize: 32,
        fontWeight: 700,
    },
    squareStatItem: {
        display: "flex",
        justifyContent: "space-between",
        padding: 20,
        borderRadius: 10,
        backgroundColor: "#25292e",
        // borderColor: "#25292e",
        // borderWidth: 2,
        gap: 10,
        flex: 1,
    },
    statSquareItemValue: {
        color: "#FFF",
        fontSize: 22,
        fontWeight: 700,
    },
});
