import {
    FontAwesome,
    Ionicons,
    MaterialCommunityIcons,
    Fontisto,
    FontAwesome5,
    FontAwesome6,
} from "@expo/vector-icons";
// import { Image } from "expo-image";
import { useContext, useEffect, useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { UserContext } from "@/context/UserContext";
import { router } from "expo-router";
import LoadingScreen from "@/components/Loading/Loading";

const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export default function ShopScreen() {
    const userContext = useContext(UserContext);

    if (!userContext) {
        return <LoadingScreen />;
    }

    const { user, setUser } = userContext;

    const cosmetics = [
        {
            id: 0,
            name: "Blueprint Style",
            price: 500,
        },
        {
            id: 1,
            name: "Overcast Style",
            price: 500,
        },
        {
            id: 2,
            name: "X-Ray Style",
            price: 500,
        },
        {
            id: 3,
            name: "Neon Style",
            price: 500,
        },
        {
            id: 4,
            name: "Camo Style",
            price: 500,
        },
        {
            id: 5,
            name: "Vintage Style",
            price: 500,
        },
    ];

    const items = [
        {
            id: 0,
            name: "Name Change Token",
            price: 200,
        },
        {
            id: 1,
            name: "Alliance Change Token",
            price: 1000,
        },
    ];

    const coinOptions = [
        {
            id: 0,
            amount: 100,
            price: "$0.99",
        },
        {
            id: 1,
            amount: 550,
            price: "$4.99",
        },
        {
            id: 2,
            amount: "1,200",
            price: "$9.99",
        },
        {
            id: 3,
            amount: "2,500",
            price: "$19.99",
        },
        {
            id: 4,
            amount: "5,200",
            price: "$39.99",
        },
        {
            id: 5,
            amount: "15,000",
            price: "$99.99",
        },
    ];

    function handleIncreaseRadius() {
        if (user && user.charcoins >= 200) {
            if (setUser) {
                setUser({
                    ...user,
                    charcoins: (user.charcoins -= 200),
                    radius: (user.radius += 100),
                });
                router.push("/");
            }
        }
    }

    return (
        <ScrollView style={styles.pageContainer}>
            <View style={styles.container}>
                <View style={[styles.headerContainer, styles.section]}>
                    <View style={styles.centContainer}>
                        <FontAwesome6
                            name="cent-sign"
                            color="white"
                            size={32}
                        />
                    </View>

                    <Text style={[styles.text, { fontWeight: 700 }]}>
                        {user?.charcoins}
                    </Text>
                </View>
                {/* <Text style={styles.sectionTitle}>DEALS</Text>
                <View
                    style={[
                        styles.headerContainer,
                        styles.section,
                        styles.productList,
                    ]}
                >
                    <TouchableOpacity
                        style={styles.productItem}
                        onPress={() => router.push("/shop")}
                    >
                        <Ionicons name="gift-outline" color="white" size={70} />
                        <Text style={[styles.productText]}>Product Name</Text>
                        <View style={styles.productPrice}>
                            <FontAwesome
                                name="user-circle"
                                color="rgb(18, 18, 18)"
                                size={16}
                            />
                            <Text style={[styles.priceText]}>100</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.productItem}
                        onPress={() => router.push("/shop")}
                    >
                        <Ionicons name="gift-outline" color="white" size={70} />
                        <Text style={[styles.productText]}>Product Name</Text>
                        <View style={styles.productPrice}>
                            <FontAwesome
                                name="user-circle"
                                color="rgb(18, 18, 18)"
                                size={16}
                            />
                            <Text style={[styles.priceText]}>100</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.productItem}
                        onPress={() => router.push("/shop")}
                    >
                        <Ionicons name="gift-outline" color="white" size={70} />
                        <Text style={[styles.productText]}>Product Name</Text>
                        <View style={styles.productPrice}>
                            <FontAwesome
                                name="user-circle"
                                color="rgb(18, 18, 18)"
                                size={16}
                            />
                            <Text style={[styles.priceText]}>100</Text>
                        </View>
                    </TouchableOpacity>
                </View> */}

                <Text style={styles.sectionTitle}>COSMETICS</Text>
                <View
                    style={[
                        styles.headerContainer,
                        styles.section,
                        styles.productList,
                    ]}
                >
                    {cosmetics.map((product) => {
                        return (
                            <TouchableOpacity
                                style={styles.productItem}
                                onPress={() => {}}
                                key={product.id}
                            >
                                {/* <Image
                                    style={styles.image}
                                    source="https://picsum.photos/seed/696/3000/2000"
                                    placeholder={{ blurhash }}
                                    contentFit="cover"
                                    transition={1000}
                                /> */}
                                <Text
                                    style={[
                                        styles.productText,
                                        { marginVertical: 4 },
                                    ]}
                                >
                                    {product.name}
                                </Text>
                                <View style={styles.productPrice}>
                                    <FontAwesome
                                        name="user-circle"
                                        color="rgb(18, 18, 18)"
                                        size={16}
                                    />
                                    <Text style={[styles.priceText]}>
                                        {product.price}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <Text style={styles.sectionTitle}>ITEMS</Text>
                <View
                    style={[
                        styles.headerContainer,
                        styles.section,
                        styles.altProductList,
                    ]}
                >
                    {items.map((product) => {
                        return (
                            <TouchableOpacity
                                style={styles.productItem}
                                onPress={() => {}}
                                key={product.id}
                            >
                                {/* <Image
                                    style={styles.image}
                                    source="https://picsum.photos/seed/696/3000/2000"
                                    placeholder={{ blurhash }}
                                    contentFit="cover"
                                    transition={1000}
                                /> */}
                                <Text
                                    style={[
                                        styles.productText,
                                        { marginVertical: 4 },
                                    ]}
                                >
                                    {product.name}
                                </Text>
                                <View style={styles.productPrice}>
                                    <FontAwesome
                                        name="user-circle"
                                        color="rgb(18, 18, 18)"
                                        size={16}
                                    />
                                    <Text style={[styles.priceText]}>
                                        {product.price}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <Text style={styles.sectionTitle}>CHARCOINS</Text>
                <View
                    style={[
                        styles.headerContainer,
                        styles.section,
                        styles.productList,
                    ]}
                >
                    {coinOptions.map((option) => {
                        return (
                            <TouchableOpacity
                                style={styles.productItem}
                                onPress={() => {}}
                                key={option.id}
                            >
                                <FontAwesome5
                                    name="coins"
                                    color="white"
                                    size={50}
                                />
                                <Text
                                    style={[
                                        styles.productText,
                                        { marginVertical: 4 },
                                    ]}
                                >
                                    {option.amount}
                                </Text>
                                <View style={styles.productPrice}>
                                    <Text style={[styles.priceText]}>
                                        {option.price}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    image: {
        flex: 1,
        width: "100%",
        backgroundColor: "#0553",
    },
    centContainer: {
        display: "flex",
        width: 50,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        borderColor: "white",
        borderWidth: 2,
        borderRadius: "100%",
        paddingRight: 2,
    },
    text: {
        color: "#fff",
        fontSize: 32,
    },
    pageContainer: {
        backgroundColor: "rgb(18, 18, 18)",
    },
    container: {
        flex: 1,
        backgroundColor: "rgb(18, 18, 18)",
        paddingVertical: 10,
        gap: 10,
        minHeight: "100%",
    },
    section: {
        backgroundColor: "rgb(30, 30, 30)",
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    sectionTitle: {
        color: "#fff",
        fontSize: 12,
        fontWeight: 700,
        paddingHorizontal: 20,
        marginTop: 10,
    },
    headerContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    statItem: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    productList: {
        display: "flex",
        gap: 32,
        rowGap: 30,
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    altProductList: {
        display: "flex",
        gap: 32,
        rowGap: 30,
        flexWrap: "wrap",
        justifyContent: "space-evenly",
    },
    productItem: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 4,
        width: 80,
        alignSelf: "stretch",
    },
    productText: {
        color: "#fff",
        textAlign: "center",
    },
    productPrice: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#ffd33d",
        borderRadius: 4,
        paddingVertical: 2,
        paddingHorizontal: 8,
    },
    priceText: {
        color: "rgb(18, 18, 18)",
        fontWeight: 700,
        textAlign: "center",
    },
});
