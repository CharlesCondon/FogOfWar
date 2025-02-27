import { Stack } from "expo-router";

export default function SocialLayout() {
    function capitalizeFirstLetter(val: any) {
        if (!val) {
            return "";
        }
        return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }

    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: "#25292e" },
                headerTintColor: "#fff", // This affects both back title and icon color
            }}
        >
            <Stack.Screen
                name="index"
                options={{ title: "Alliance", headerBackVisible: false }}
            />

            <Stack.Screen
                name="ranks/[team]"
                options={({ route }) => ({
                    title: "Ranks",
                })}
            />
        </Stack>
    );
}
