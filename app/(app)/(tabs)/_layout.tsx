import { Tabs, router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { TouchableHighlight, View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabLayout() {
    function settingsButton() {
        return (
            <TouchableHighlight
                underlayColor="transparent"
                onPress={() => router.push("/settings")}
                style={styles.headerButtons}
            >
                <Ionicons name="settings-outline" color="#fff" size={24} />
            </TouchableHighlight>
        );
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                tabBarActiveTintColor: "#ffd33d",
                headerStyle: {
                    backgroundColor: "#25292e",
                },
                headerShadowVisible: false,
                headerTintColor: "#fff",
                tabBarStyle: {
                    backgroundColor: "#25292e",
                },
                lazy: true,
            }}
        >
            <Tabs.Screen
                name="shop"
                options={{
                    headerShown: true,
                    title: "Shop",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "bag" : "bag-outline"}
                            color={color}
                            size={24}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="alliance"
                options={{
                    headerShown: false,
                    title: "Alliance",
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialCommunityIcons
                            name={
                                focused
                                    ? "account-group"
                                    : "account-group-outline"
                            }
                            color={color}
                            size={24}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    headerShown: false,
                    title: "Home",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "home-sharp" : "home-outline"}
                            color={color}
                            size={24}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="social"
                options={{
                    headerShown: false,
                    title: "Social",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "trophy" : "trophy-outline"}
                            color={color}
                            size={24}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    headerRight: () => settingsButton(),
                    tabBarIcon: ({ color, focused }) => (
                        <FontAwesome
                            name={focused ? "user-circle" : "user-circle-o"}
                            color={color}
                            size={24}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    headerShown: false, // Let the stack inside settings handle its own header
                    tabBarStyle: { backgroundColor: "#25292e" },
                    href: null,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    headerButtons: {
        paddingHorizontal: 10,
    },
});
