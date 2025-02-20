import { Stack } from "expo-router";

export default function SettingsLayout() {
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
                options={{ title: "Settings", headerBackVisible: false }}
            />
            <Stack.Screen name="appearance" options={{ title: "Appearance" }} />
            <Stack.Screen
                name="color/[id]"
                options={({ route }) => ({
                    title:
                        capitalizeFirstLetter((route.params as any).id) +
                        " Color",
                })}
            />
        </Stack>
    );
}
