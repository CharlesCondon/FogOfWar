import "expo-dev-client";
import React, {
    useState,
    useEffect,
    useContext,
    useRef,
    useMemo,
    useCallback,
} from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    TouchableHighlight,
    Alert,
} from "react-native";
import Mapbox from "@rnmapbox/maps";
import * as Location from "expo-location";
import * as turf from "@turf/turf";
import {
    Feature,
    GeoJsonProperties,
    MultiPolygon,
    Polygon,
    LineString,
} from "geojson";
import { UserContext } from "@/context/UserContext";
import { router } from "expo-router";
import {
    FontAwesome,
    Ionicons,
    MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Buffer } from "buffer";
import debounce from "lodash.debounce";
import LoadingScreen from "@/components/Loading/Loading";
import { updateUserLog, useSession } from "@/context/AuthContext";
import FogLayer from "@/components/FogLayer/FogLayer";

Mapbox.setAccessToken(`${process.env.EXPO_PUBLIC_MAPBOX_KEY}`);

function formatDate(date: Date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

let zoomLevel = 16;

export default function Index() {
    const userContext = useContext(UserContext);
    const { session, isLoading } = useSession();

    if (!session) {
        router.replace("/sign-in");
    }
    if (isLoading || !userContext) {
        return <LoadingScreen />;
    }
    const { user, setUser } = userContext;
    if (!user) {
        return <LoadingScreen />;
    }

    const [pathLine, setPathLine] = useState<Feature<
        LineString,
        GeoJsonProperties
    > | null>(null);
    const [initialArea, setInitialArea] =
        useState<Feature<Polygon | MultiPolygon, GeoJsonProperties>>();
    const [location, setLocation] = useState<Location.LocationObjectCoords>();
    const [fogGeoJSON, setFogGeoJSON] = useState<any>(null);
    const [overlay, setOverlay] = useState<boolean>(true);
    const [overlayOpacity, setOverlayOpacity] = useState<number>(0.7);
    const [showJourney, setShowJourney] = useState<boolean>(false);
    const [todaysCoordinates, setTodaysCoordinates] = useState<number[][]>([]);
    const [todaysArea, setTodaysArea] = useState<any>(null);
    const [staticRevealedArea, setStaticRevealedArea] = useState<any>(null);

    const today = formatDate(new Date());
    const camera = useRef<Mapbox.Camera>(null);
    const lastUpdateTime = useRef<number>(0);
    const lastFogUpdate = useRef<number>(0);

    const worldPolygon = turf.polygon([
        [
            [-180, -90],
            [180, -90],
            [180, 90],
            [-180, 90],
            [-180, -90],
        ],
    ]);

    useEffect(() => {
        if (user.activityLog) {
            let accumulatedStatic: Feature<
                Polygon | MultiPolygon,
                GeoJsonProperties
            > | null = null;

            let tempArr: Feature<Polygon | MultiPolygon, GeoJsonProperties>[] =
                [];
            Object.keys(user.activityLog).forEach((day) => {
                if (user.activityLog?.[day]?.revealedArea) {
                    const area = user.activityLog[day].revealedArea;
                    tempArr.push(area);
                }
            });

            const validPreviousAreas = tempArr
                .flat(Infinity)
                .filter(
                    (area: any) =>
                        area &&
                        area.geometry &&
                        Array.isArray(area.geometry.coordinates) &&
                        area.geometry.coordinates.length > 0
                );

            setStaticRevealedArea(validPreviousAreas);
            let initialDifference;
            if (validPreviousAreas && validPreviousAreas.length === 1) {
                initialDifference = turf.difference(
                    turf.featureCollection([
                        worldPolygon,
                        validPreviousAreas[0],
                    ])
                );
            } else if (validPreviousAreas && validPreviousAreas.length >= 1) {
                initialDifference = turf.difference(
                    turf.featureCollection([
                        worldPolygon,
                        ...validPreviousAreas,
                    ])
                );
            } else {
                initialDifference = worldPolygon;
            }

            setInitialArea(initialDifference || worldPolygon);
        }
    }, []);

    //Request location permission and watch for updates
    useEffect(() => {
        let subscription: Location.LocationSubscription;

        (async () => {
            const { status } =
                await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission Denied",
                    "Location access is required for this app to function properly.",
                    [{ text: "OK" }]
                );
                return;
            }

            subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 20, // Update every 10 meters
                },
                (newLocation) => {
                    //if (!location) {
                    setLocation(newLocation.coords);
                    //} else {
                    //setLocation(newLocation.coords);
                    //}
                }
            );
        })();
        return () => subscription?.remove();
    }, []);

    useEffect(() => {
        if (!location) return;
        camera.current?.setCamera({
            centerCoordinate: [location.longitude, location.latitude],
        });
    }, []);

    useEffect(() => {
        if (!location) return;

        const now = Date.now();
        if (now - lastUpdateTime.current < 3000) return; // Skip if less than 1 second since last update

        lastUpdateTime.current = now;

        const center: [number, number] = [
            location.longitude,
            location.latitude,
        ];

        setTodaysCoordinates((prev: any) => {
            if (!prev.length) return [center];
            const lastCoord = prev[prev.length - 1];
            const distance = turf.distance(
                turf.point(lastCoord),
                turf.point(center),
                {
                    units: "meters",
                }
            );
            if (distance > 20) {
                return [...prev, center];
            }
            return prev;
        });

        const radius = 50; // meters
        const newCircle = turf.circle(center, radius, {
            steps: 12,
            units: "meters",
        });
        if (!todaysArea) {
            setTodaysArea([newCircle]);
        } else {
            setTodaysArea((prev: any) => [...prev, newCircle]);
        }
    }, [location]);

    const computedData = useMemo(() => {
        if (!todaysArea) return null;

        // Build the path for today.
        const pathLineComputed =
            todaysCoordinates.length > 1
                ? turf.lineString(todaysCoordinates)
                : null;

        // Combine static and today’s data:
        let totalRevealedArea;
        if (todaysArea) {
            if (staticRevealedArea) {
                totalRevealedArea = [...staticRevealedArea, ...todaysArea];
            } else {
                totalRevealedArea = [...todaysArea];
            }
        } else if (staticRevealedArea) {
            totalRevealedArea = [...staticRevealedArea];
        } else {
            return null;
        }

        return {
            totalRevealedArea,
            pathLine: pathLineComputed,
            todaysCoordinates,
        };
    }, [todaysArea, todaysCoordinates]);
    // --- End Memoization ---

    useEffect(() => {
        if (!computedData) return;

        const now = Date.now();
        if (now - lastFogUpdate.current < 5000) return; // Only update every 5 sec
        lastFogUpdate.current = now;

        const flatRevealed = computedData.totalRevealedArea
            .flat(Infinity)
            .filter(
                (f: { geometry: { coordinates: string | any[] } }) =>
                    f &&
                    f.geometry &&
                    Array.isArray(f.geometry.coordinates) &&
                    f.geometry.coordinates.length > 0
            );

        const difference =
            initialArea && flatRevealed
                ? turf.difference(
                      turf.featureCollection([initialArea, ...flatRevealed])
                  )
                : flatRevealed
                ? turf.difference(
                      turf.featureCollection([worldPolygon, ...flatRevealed])
                  )
                : null;

        const fogPolygon =
            computedData.totalRevealedArea &&
            turf.getType(computedData.totalRevealedArea as any) !== "Point"
                ? difference ?? worldPolygon
                : worldPolygon;

        setFogGeoJSON(turf.polygonSmooth(fogPolygon));
        if (session && setUser) {
            const newLog = {
                ...user.activityLog,
                [today]: {
                    revealedArea: todaysArea,
                    coordinate: computedData.todaysCoordinates,
                },
            };
            updateUserLog(session.user.id, newLog);
            setUser({ ...user, activityLog: newLog });
        }
    }, [computedData]);

    const centerMap = useCallback(() => {
        if (!location) return;
        camera.current?.setCamera({
            centerCoordinate: [location.longitude, location.latitude],
            zoomLevel: 16,
        });
    }, [location]);

    return (
        <View style={styles.container}>
            {location && (
                <>
                    <Mapbox.MapView
                        style={styles.map}
                        styleURL={user.mapStyle}
                        scaleBarEnabled={false}
                        compassEnabled={true}
                        compassViewPosition={0}
                        //onDidFinishRenderingMap={() => setIsMapLoaded(true)}
                    >
                        <Mapbox.Camera
                            ref={camera}
                            zoomLevel={zoomLevel}
                            centerCoordinate={[
                                location.longitude,
                                location.latitude,
                            ]}
                            animationMode="flyTo"
                            animationDuration={1000}
                        />

                        <Mapbox.LocationPuck
                            puckBearingEnabled={true}
                            puckBearing="course"
                        />

                        {/* Fog of War Layer */}
                        {fogGeoJSON && overlay && (
                            <FogLayer
                                fogGeoJSON={fogGeoJSON}
                                overlayOpacity={overlayOpacity}
                                overlayColor={user.overlayColor}
                            />
                        )}

                        <Mapbox.ShapeSource
                            id="userLocation"
                            shape={turf.point([
                                location.longitude,
                                location.latitude,
                            ])}
                            key={user.dotColor}
                        >
                            <Mapbox.CircleLayer
                                id="circleLayers"
                                style={{
                                    circleRadius: 5, // Radius in pixels
                                    circleColor: user.dotColor, // Color of the circle
                                    circleOpacity: 1, // Opacity (0.0 - 1.0)
                                    circleStrokeWidth: 2, // Border thickness
                                    circleStrokeColor: "white", // Border color
                                }}
                            />
                        </Mapbox.ShapeSource>
                    </Mapbox.MapView>
                </>
            )}
            {!location && (
                <View style={styles.loadingContainer}>
                    <LoadingScreen />
                </View>
            )}

            {/* Settings Button */}
            <TouchableHighlight
                underlayColor="transparent"
                onPress={() => router.push("/settings")}
                style={styles.headerButtons}
            >
                <Ionicons name="settings-outline" color="#fff" size={26} />
            </TouchableHighlight>

            {/* Center Map Button */}
            <View style={styles.centerUserButton}>
                <TouchableOpacity
                    accessibilityLabel="Center Map"
                    onPress={() => centerMap()}
                    style={styles.overlayToggle}
                >
                    <MaterialCommunityIcons
                        name="target"
                        color="#fff"
                        size={26}
                    />
                </TouchableOpacity>
            </View>

            {/* Toggle Overlay Button */}
            <View style={styles.overlayToggleContainer}>
                <TouchableOpacity
                    style={styles.overlayToggle}
                    onPress={() => setOverlay(!overlay)}
                    accessibilityLabel="Toggle Overlay"
                >
                    <Ionicons
                        name={overlay ? "eye-off-outline" : "eye-outline"}
                        color="#FFF"
                        size={26}
                    />
                </TouchableOpacity>
            </View>

            {/* Toggle Overlay Opacity Button */}
            <View
                style={[
                    styles.opacityToggleContainer,
                    !overlay && styles.opacityToggleDisabled,
                ]}
            >
                <TouchableOpacity
                    style={[styles.opacityToggle]}
                    onPress={() =>
                        setOverlayOpacity(overlayOpacity === 0.9 ? 0.7 : 0.9)
                    }
                    accessibilityLabel="Toggle Overlay Opacity"
                    disabled={!overlay}
                >
                    <FontAwesome
                        name={overlayOpacity === 0.9 ? "sun-o" : "moon-o"}
                        color="#FFF"
                        size={26}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        zIndex: 1000,
    },
    headerButtons: {
        position: "absolute",
        top: 60,
        right: 20,
    },
    page: {
        flex: 1,
        backgroundColor: "#25292e",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        height: "110%",
        width: "100%",
    },
    map: {
        flex: 1,
    },
    marker: {
        width: 20,
        height: 20,
        borderRadius: "100%",
        zIndex: 10,
        opacity: 1,
    },
    zoomControls: {
        position: "absolute",
        right: 22,
        bottom: 32,
        backgroundColor: "#25292e",
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        transform: [{ translateY: -60 }],
    },
    zoomButton: {
        paddingHorizontal: 9,
        paddingVertical: 2,
        justifyContent: "center",
        alignItems: "center",
    },
    zoomInButton: {
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
    },
    zoomOutButton: {
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
    },
    zoomButtonText: {
        fontSize: 28,
        color: "#fff",
        fontWeight: "400",
    },
    divider: {
        height: 1,
        backgroundColor: "rgb(80, 80, 80)",
        marginHorizontal: 2,
    },
    overlayToggleContainer: {
        width: 40,
        position: "absolute",
        left: 18,
        bottom: 32,
        backgroundColor: "#25292e",
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        transform: [{ translateY: -60 }],
    },
    overlayToggle: {
        padding: 6,
        justifyContent: "center",
        alignItems: "center",
    },
    centerUserButton: {
        width: 40,
        position: "absolute",
        right: 20,
        bottom: 32,
        backgroundColor: "#25292e",
        borderRadius: "100%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        transform: [{ translateY: -60 }],
    },
    opacityToggleContainer: {
        width: 40,
        position: "absolute",
        left: 70,
        bottom: 32,
        backgroundColor: "#25292e",
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        transform: [{ translateY: -60 }],
    },
    opacityToggle: {
        padding: 6,
        justifyContent: "center",
        alignItems: "center",
    },
    opacityToggleDisabled: {
        opacity: 0.2,
    },
    journeyToggleContainer: {
        width: 40,
        position: "absolute",
        left: 122,
        bottom: 32,
        backgroundColor: "#25292e",
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        transform: [{ translateY: -60 }],
    },
    journeyToggle: {
        padding: 6,
        justifyContent: "center",
        alignItems: "center",
    },
    journeyToggleDisabled: {
        opacity: 0.2,
    },
});
