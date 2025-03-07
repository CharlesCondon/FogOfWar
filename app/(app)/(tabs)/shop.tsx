import { FontAwesome, FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useContext, useEffect, useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Linking,
} from "react-native";
import { UserContext } from "@/context/UserContext";
import LoadingScreen from "@/components/Loading/Loading";
import Purchases, { PurchasesPackage } from "react-native-purchases";
import {
    updateCoins,
    updateCosmetics,
    useSession,
} from "@/context/AuthContext";

const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export default function ShopScreen() {
    const userContext = useContext(UserContext);
    const { session } = useSession();
    const [packages, setPackages] = useState<PurchasesPackage[]>([]);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [shopCosmetics, setShopCosmetics] = useState([
        {
            id: 0,
            name: "Blueprint Style",
            price: 500,
            url: require("@/assets/images/blueprint.png"),
            disabled: false,
        },
        {
            id: 1,
            name: "Overcast Style",
            price: 500,
            url: require("@/assets/images/overcast.png"),
            disabled: false,
        },
        {
            id: 2,
            name: "X-Ray Style",
            price: 500,
            url: require("@/assets/images/x-ray.png"),
            disabled: false,
        },
        {
            id: 3,
            name: "Neon Style",
            price: 500,
            url: require("@/assets/images/neon.png"),
            disabled: false,
        },
        {
            id: 4,
            name: "Camo Style",
            price: 500,
            url: require("@/assets/images/camo.png"),
            disabled: false,
        },
        {
            id: 5,
            name: "Vintage Style",
            price: 500,
            url: require("@/assets/images/vintage.png"),
            disabled: false,
        },
    ]);

    if (!userContext) {
        return <LoadingScreen />;
    }

    const { user, setUser } = userContext;

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

    function formatNumber(num: string) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    useEffect(() => {
        // Get current available packages
        const getPackages = async () => {
            try {
                const offerings = await Purchases.getOfferings();
                if (
                    offerings.current !== null &&
                    offerings.current.availablePackages.length !== 0
                ) {
                    const sortedOfferings =
                        offerings.current.availablePackages.sort(
                            (a, b) => a.product.price - b.product.price
                        );
                    setPackages(sortedOfferings);
                }
            } catch (e: any) {
                Alert.alert("Error getting offers", e.message);
            }
        };

        getPackages();
    }, []);

    useEffect(() => {
        if (user?.cosmetics && user.cosmetics.length > 0) {
            setShopCosmetics((prevCosmetics) => {
                const updatedCosmetics = [...prevCosmetics];
                user.cosmetics.forEach((cosmeticId) => {
                    if (
                        cosmeticId >= 0 &&
                        cosmeticId < updatedCosmetics.length
                    ) {
                        updatedCosmetics[cosmeticId] = {
                            ...updatedCosmetics[cosmeticId],
                            disabled: true,
                        };
                    }
                });
                return updatedCosmetics;
            });
        }
    }, [user?.cosmetics]);

    const handleLink = () => {
        const url =
            "https://gist.github.com/CharlesCondon/9d3eaa5555d4ef0cdcecee2c1dc2cf4d";
        Linking.openURL(url).catch((err) =>
            console.error("An error occurred", err)
        );
    };

    const handlePurchasePachage = async (purchasePackage: PurchasesPackage) => {
        setIsPurchasing(true);
        console.log(JSON.stringify(purchasePackage));
        try {
            const { customerInfo } = await Purchases.purchasePackage(
                purchasePackage
            );
            if (customerInfo) {
                const coins = parseInt(purchasePackage.identifier);

                if (setUser && user && session) {
                    updateCoins(session.user.id, user.charcoins + coins);
                    setUser({ ...user, charcoins: user.charcoins + coins });
                }
            }
        } catch (e: any) {
            if (
                e.code ===
                Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
            ) {
                Alert.alert("Error purchasing package", e.message);
            }
        } finally {
            setIsPurchasing(false);
        }
    };

    const handlePurchaseCosmetic = (cosmeticId: number, price: number) => {
        if (
            user &&
            (user.cosmetics.includes(cosmeticId) || user.charcoins < price)
        ) {
            Alert.alert("Unable to purchase cosmetic");
            return;
        }

        if (setUser && user && session) {
            updateCosmetics(
                session.user.id,
                [...user.cosmetics, cosmeticId],
                user.charcoins - price
            );
            setUser({
                ...user,
                charcoins: user.charcoins - price,
                cosmetics: [...user.cosmetics, cosmeticId],
            });
        }
    };

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
                        {user?.charcoins ? (
                            formatNumber(user?.charcoins.toString())
                        ) : (
                            <></>
                        )}
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
                    {shopCosmetics.map((product) => {
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.productItem,
                                    product.disabled && styles.productDisabled,
                                ]}
                                onPress={() => {
                                    handlePurchaseCosmetic(
                                        product.id,
                                        product.price
                                    );
                                }}
                                key={product.id}
                                disabled={product.disabled}
                            >
                                <View>
                                    <Image
                                        style={styles.image}
                                        source={product.url}
                                        placeholder={{ blurhash }}
                                        contentFit="contain"
                                        transition={500}
                                    />
                                    <Text
                                        style={[
                                            styles.productText,
                                            { marginVertical: 4 },
                                        ]}
                                    >
                                        {product.name}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        styles.productPrice,
                                        product.disabled &&
                                            styles.productPriceDisabled,
                                    ]}
                                >
                                    <FontAwesome
                                        name="user-circle"
                                        color="rgb(18, 18, 18)"
                                        size={16}
                                    />
                                    <Text style={styles.priceText}>
                                        {product.price}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                {/* <Text style={styles.sectionTitle}>ITEMS</Text>
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
                                <MaterialIcons
                                    name="token"
                                    color="white"
                                    size={50}
                                />
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
                </View> */}
                <Text style={styles.sectionTitle}>CHARCOINS</Text>
                <View
                    style={[
                        styles.headerContainer,
                        styles.section,
                        styles.productList,
                    ]}
                >
                    {packages.map((option) => {
                        return (
                            <TouchableOpacity
                                style={styles.productItem}
                                onPress={() => handlePurchasePachage(option)}
                                key={option.identifier}
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
                                    {option.identifier} Coins
                                </Text>
                                <View style={styles.productPrice}>
                                    <Text style={[styles.priceText]}>
                                        ${option.product.price.toFixed(2)}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <View style={[styles.policiesContainer]}>
                    {/* <FontAwesome name="user-circle" color="white" size={48} /> */}
                    <TouchableOpacity style={{}} onPress={handleLink}>
                        <Text
                            style={{
                                color: "#fff",
                                fontSize: 10,
                                textAlign: "right",
                                opacity: 0.5,
                            }}
                        >
                            Privacy Policy ~ Terms & Conditions
                        </Text>
                    </TouchableOpacity>
                </View>
                {isPurchasing && <View style={styles.overlay} />}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    productDisabled: {
        opacity: 0.25,
    },
    overlay: {
        flex: 1,
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        opacity: 0.5,
        backgroundColor: "black",
    },
    policiesContainer: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    image: {
        flex: 1,
        width: 80,
        height: 80,
        maxHeight: 80,
        borderWidth: 1,
        borderColor: "rgb(18, 18, 18)",
        borderRadius: 6,
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
    productPriceDisabled: {
        backgroundColor: "rgb(120,120,120)",
    },
    priceText: {
        color: "rgb(18, 18, 18)",
        fontWeight: 700,
        textAlign: "center",
    },
});
