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
                options={{ title: "Social", headerBackVisible: false }}
            />
            {/* <Stack.Screen name="appearance" options={{ title: "Appearance" }} /> */}
            <Stack.Screen
                name="leaderboard/[area]/[time]"
                options={({ route }) => ({
                    title:
                        capitalizeFirstLetter((route.params as any).area) +
                        " " +
                        capitalizeFirstLetter((route.params as any).time) +
                        " Leaderboard",
                })}
            />
        </Stack>
    );
}
