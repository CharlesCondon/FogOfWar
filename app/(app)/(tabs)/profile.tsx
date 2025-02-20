import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useCallback, useContext, useEffect, useState, useMemo } from "react";
import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    InteractionManager,
    Button,
} from "react-native";
import { UserContext } from "@/context/UserContext";
import * as turf from "@turf/turf";
import {
    Feature,
    GeoJsonProperties,
    FeatureCollection,
    Geometry,
    Polygon,
    MultiPolygon,
} from "geojson";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import LoadingScreen from "@/components/Loading/Loading";
import SlidingToggle from "@/components/SlidingToggle/slidingToggle";
import { getUser, useSession } from "@/context/AuthContext";
import React from "react";
import { User } from "@/types";
import StatCard from "@/components/StatCard/StatCard";

function formatNumber(num: string) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function unionGroup(group) {
    let newGroup = [];
    for (let i = 0; i < group.length; i += 2) {
        let a = group[i];
        let b = i + 1 < group.length ? group[i + 1] : null;
        if (b) {
            newGroup.push(turf.union(turf.featureCollection([a, b])));
        } else {
            newGroup.push(a);
        }
    }
    return newGroup;
}
function fasterUnion2(allGeometries) {
    if (allGeometries.length === 1) {
        return allGeometries[0];
    }
    if (allGeometries.length === 2) {
        return turf.union(
            turf.featureCollection([allGeometries[0], allGeometries[1]])
        );
    }
    const size = Math.floor(allGeometries.length / 2);
    const geom1 = fasterUnion2(allGeometries.slice(0, size));
    const geom2 = fasterUnion2(allGeometries.slice(size));
    return turf.union(turf.featureCollection([geom1, geom2]));
}
const unionStrategies = {
    turfUnion: (validAreas: any[]) => {
        try {
            return turf.union(turf.featureCollection(validAreas));
        } catch (e) {
            console.error("Error in turfUnion:", e);
            return null;
        }
    },

    turfDissolve: (validAreas: any[]) => {
        try {
            return turf.dissolve(
                turf.flatten(turf.featureCollection([...(validAreas as any)]))
            );
        } catch (e) {
            console.error("Error in turfDissolve:", e);
            return null;
        }
    },

    fasterUnion: (validAreas: any[]) => {
        try {
            const mid = Math.floor(validAreas.length / 2);
            let group1 = validAreas.slice(0, mid);
            let group2 = validAreas.slice(mid);

            while (group1.length > 1) {
                group1 = unionGroup(group1);
            }
            while (group2.length > 1) {
                group2 = unionGroup(group2);
            }

            if (group1.length === 1 && group2.length === 1) {
                return turf.union(
                    turf.featureCollection([group1[0], group2[0]])
                );
            }
            return group1.length === 1 ? group1[0] : group2[0];
        } catch (e) {
            console.error("Error in fasterUnion:", e);
            return null;
        }
    },

    // Your second custom union function here
    fasterUnion2: (allGeometries: any[]) => {
        if (allGeometries.length === 1) {
            return allGeometries[0];
        }
        if (allGeometries.length === 2) {
            return turf.union(
                turf.featureCollection([allGeometries[0], allGeometries[1]])
            );
        }
        const size = Math.floor(allGeometries.length / 2);
        const geom1 = fasterUnion2(allGeometries.slice(0, size));
        const geom2 = fasterUnion2(allGeometries.slice(size));
        return turf.union(turf.featureCollection([geom1, geom2]));
    },
};

export default function ProfileScreen() {
    const { session, isLoading } = useSession();
    //const userContext = useContext(UserContext);
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState<User>();

    if (isLoading) {
        return <LoadingScreen />;
    }

    const [totalArea, setTotalArea] = useState<number | string>(0);
    const [activityTime, setActivityTime] = useState<string>("Week");
    const [unionMethod, setUnionMethod] =
        useState<keyof typeof unionStrategies>("turfUnion");
    const [performanceResults, setPerformanceResults] = useState<
        Record<string, number>
    >({});

    const fetchUserData = async () => {
        if (!session) return;
        const u = await getUser(session.user.id);
        setUser(u);
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchUserData();
        setRefreshing(false);
    }, []);

    function getJoinedDay() {
        if (!user) return;
        let day = new Date(user.joinedDate).toLocaleDateString();
        return day;
    }

    function measureExecutionTime(fn: () => any, label: string): [any, number] {
        const start = Date.now();
        const result = fn();
        const end = Date.now();
        const duration = end - start;
        console.log(`${label} took ${duration.toFixed(2)}ms`);
        return [result, duration];
    }

    // function fasterUnion2(allGeometries) {
    //     if (allGeometries.length === 1) {
    //         return allGeometries[0];
    //     }
    //     if (allGeometries.length === 2) {
    //         return turf.union(
    //             turf.featureCollection([allGeometries[0], allGeometries[1]])
    //         );
    //     }
    //     const size = Math.floor(allGeometries.length / 2);
    //     const geom1 = fasterUnion2(allGeometries.slice(0, size));
    //     const geom2 = fasterUnion2(allGeometries.slice(size));
    //     return turf.union(turf.featureCollection([geom1, geom2]));
    // }

    // function fasterUnion(allGeometries) {
    //     const mid = Math.floor(allGeometries.length / 2);
    //     let group1 = allGeometries.slice(0, mid);
    //     let group2 = allGeometries.slice(mid);

    //     while (group1.length > 1) {
    //         group1 = unionGroup(group1);
    //     }
    //     while (group2.length > 1) {
    //         group2 = unionGroup(group2);
    //     }

    //     let result;
    //     if (group1.length === 1 && group2.length === 1) {
    //         result = turf.union(turf.featureCollection([group1[0], group2[0]]));
    //     } else if (group1.length === 1) {
    //         result = group1[0];
    //     } else {
    //         result = group2[0];
    //     }

    //     return result;
    // }

    // function unionGroup(group) {
    //     let newGroup = [];
    //     for (let i = 0; i < group.length; i += 2) {
    //         let a = group[i];
    //         let b = i + 1 < group.length ? group[i + 1] : null;
    //         if (b) {
    //             newGroup.push(turf.union(turf.featureCollection([a, b])));
    //         } else {
    //             newGroup.push(a);
    //         }
    //     }
    //     return newGroup;
    // }

    // check for changes to activity log and update total area
    useEffect(() => {
        if (!user?.activityLog || Object.keys(user?.activityLog).length === 0)
            return;

        // Extract and flatten all revealed areas from the activity log.
        const allAreas = Object.values(user.activityLog).map(
            (log: any) => log.revealedArea
        );
        const validAreas: Feature<Polygon | MultiPolygon, GeoJsonProperties>[] =
            allAreas
                .flat(Infinity)
                .filter(
                    (area: any) =>
                        area &&
                        area.geometry &&
                        Array.isArray(area.geometry.coordinates) &&
                        area.geometry.coordinates.length > 0
                );

        // If there are no valid areas, set totalArea to 0.
        if (validAreas.length === 0) {
            setTotalArea(0);
            return;
        }

        let totalArea = 0;
        if (validAreas) {
            try {
                totalArea = turf.area(
                    turf.dissolve(
                        turf.flatten(
                            turf.featureCollection([...(validAreas as any)])
                        )
                    )
                );
            } catch (e) {
                console.error("Error calculating area on unified feature:", e);
                totalArea = 0;
            }
        } else {
            // If union failed, fallback on the area of the first valid area.
            try {
                totalArea = turf.area(validAreas[0]);
            } catch (e) {
                console.error(
                    "Error calculating area on first valid feature:",
                    e
                );
                totalArea = 0;
            }
        }

        setTotalArea(totalArea);
    }, [user?.activityLog]);

    // units of measurement conversion helper function
    function getFeatureArea(revealedArea: any): number {
        if (!revealedArea) return 0;

        let area = 0;
        // If it's an array, calculate the combined area.
        if (Array.isArray(revealedArea)) {
            area = revealedArea.reduce((total: number, feature: any) => {
                if (
                    feature &&
                    feature.geometry &&
                    Array.isArray(feature.geometry.coordinates) &&
                    feature.geometry.coordinates.length > 0
                ) {
                    try {
                        return total + turf.area(feature);
                    } catch (e) {
                        console.error("Error calculating area for feature:", e);
                        return total;
                    }
                }
                return total;
            }, 0);
        } else if (
            revealedArea.geometry &&
            Array.isArray(revealedArea.geometry.coordinates) &&
            revealedArea.geometry.coordinates.length > 0
        ) {
            // Else if it's a single feature with valid coordinates.
            try {
                area = turf.area(revealedArea);
            } catch (e) {
                console.error("Error calculating area:", e);
                area = 0;
            }
        }
        return area;
    }

    function calcArea(
        revealedArea:
            | Feature<any, GeoJsonProperties>
            | FeatureCollection<any, GeoJsonProperties>
            | Geometry
            | null
    ) {
        if (revealedArea) {
            const area = getFeatureArea(revealedArea);
            if (user?.metric) {
                return area / 1000;
            }
            return area / 1609;
        } else return 0;
    }
    function calcHome() {
        if (totalArea) {
            if (user?.metric) {
                return (totalArea as number) / 1000 / 9147420;
            }
            return (totalArea as number) / 1609 / 3809525;
        } else return 0;
    }
    function calcWorld() {
        if (totalArea) {
            if (user?.metric) {
                return (totalArea as number) / 1000 / 510072000;
            }
            return (totalArea as number) / 1609 / 196900000;
        } else return 0;
    }
    function getDaysActive() {
        if (user?.activityLog && Object.keys(user?.activityLog).length > 0) {
            return Object.keys(user?.activityLog).length;
        }
        return 0;
    }
    function getLongestActiveStreak() {
        if (!user?.activityLog) return 0;
        // Get the list of keys (dates)
        const dates = Object.keys(user?.activityLog);
        // Sort the dates in ascending order
        const sortedDates = dates.sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
        );
        let longestStreak = 0;
        let currentStreak = 1; // Start with a streak of 1 since the first day is always counted
        // Loop through the sorted dates to check for consecutive days
        for (let i = 1; i < sortedDates.length; i++) {
            const currentDay = new Date(sortedDates[i]);
            const previousDay = new Date(sortedDates[i - 1]);
            // Check if the current day is the day after the previous day
            const timeDiff = currentDay.getTime() - previousDay.getTime();
            if (timeDiff === 86400000) {
                // 86400000 ms = 1 day
                // If consecutive, increase the current streak
                currentStreak++;
            } else {
                // If not consecutive, reset the current streak and compare with longest streak
                longestStreak = Math.max(longestStreak, currentStreak);
                currentStreak = 1; // Reset streak to 1 (start from the current day)
            }
        }
        // Final check after the loop to account for the last streak
        longestStreak = Math.max(longestStreak, currentStreak);
        return longestStreak;
    }
    function getTotalArea() {
        let averageArea = user?.metric
            ? (totalArea as number) / 1000
            : (totalArea as number) / 1609;

        if (averageArea) {
            if (user?.metric) {
                return averageArea;
            }
            return averageArea;
        } else return 0;
    }
    function getNewAreaToday() {
        const today = formatDate(new Date());

        if (!user?.activityLog || Object.keys(user.activityLog).length === 0) {
            return 0;
        }

        // Separate today's activities and previous activities
        const previousActivities = Object.entries(user.activityLog)
            .filter(([date]) => date !== today)
            .map(([_, log]) => log.revealedArea);

        const validPreviousAreas = previousActivities
            .flat(Infinity)
            .filter(
                (area: any) =>
                    area &&
                    area.geometry &&
                    Array.isArray(area.geometry.coordinates) &&
                    area.geometry.coordinates.length > 0
            );

        // Calculate previous total area
        let previousTotal = 0;
        if (validPreviousAreas.length > 1) {
            // Iteratively union valid previous area features.
            const unifiedPreviousArea = turf.union(
                turf.featureCollection(validPreviousAreas as any)
            );

            try {
                previousTotal = unifiedPreviousArea
                    ? turf.area(unifiedPreviousArea)
                    : 0;
            } catch (e) {
                console.error(
                    "Error calculating area for unified previous area:",
                    e
                );
                previousTotal = 0;
            }
        } else if (validPreviousAreas.length === 1) {
            try {
                previousTotal = turf.area(validPreviousAreas[0] as any);
            } catch (e) {
                console.error(
                    "Error calculating area for single previous area:",
                    e
                );
                previousTotal = 0;
            }
        } else {
            previousTotal = 0;
        }

        // Convert units if needed.
        previousTotal = user.metric
            ? previousTotal / 1000
            : previousTotal / 1609;

        // New area revealed today is the difference.
        const newAreaToday = getTotalArea() - previousTotal;
        return newAreaToday < 0 ? 0 : newAreaToday;
    }
    function getAverageArea() {
        let averageArea = user?.metric
            ? (totalArea as number) / 1000
            : (totalArea as number) / 1609;
        averageArea = averageArea / getDaysActive();

        return (
            formatNumber(averageArea.toFixed(2)) +
            (user?.metric ? " km²" : " mi²")
        );
    }
    function formatDate(date: Date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    function getTodaysArea() {
        const today = formatDate(new Date());
        const revealedArea = user?.activityLog?.[today]?.revealedArea;
        if (revealedArea) {
            return calcArea(revealedArea);
        }
        return 0;
    }
    function getTimeData() {
        const today = new Date();
        const lastXDays = [];
        let days = 0;
        if (activityTime === "Week") {
            days = 6;
        } else if (activityTime === "Month") {
            days = 30;
        } else {
            days = 364;
        }

        // Get the past 7 days' dates formatted as YYYY-MM-DD
        for (let i = days; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            lastXDays.push(formatDate(date));
        }

        const data = lastXDays.map((day) => {
            const revealedArea = user?.activityLog?.[day]?.revealedArea;

            // If nothing is saved for the day, return 0.
            if (!revealedArea) return 0;

            let area = 0;
            if (Array.isArray(revealedArea)) {
                // Sum the area of each valid feature.
                area = revealedArea.reduce((total, feature) => {
                    if (
                        feature &&
                        feature.geometry &&
                        Array.isArray(feature.geometry.coordinates) &&
                        feature.geometry.coordinates.length > 0
                    ) {
                        try {
                            return total + turf.area(feature);
                        } catch (e) {
                            console.error(
                                "Error calculating area for feature:",
                                e
                            );
                            return total;
                        }
                    }
                    return total;
                }, 0);
            } else if (
                revealedArea.geometry &&
                Array.isArray(revealedArea.geometry.coordinates) &&
                revealedArea.geometry.coordinates.length > 0
            ) {
                try {
                    area = turf.area(revealedArea);
                } catch (e) {
                    console.error("Error calculating area:", e);
                    area = 0;
                }
            } else {
                // If the geometry is empty or invalid, set the area to 0.
                area = 0;
            }

            return user?.metric ? area / 1000 : area / 1609;
        });

        const labels = lastXDays.map((d, i) => {
            if (activityTime === "Month") {
                if (i % 5 !== 0) return "";
            } else if (activityTime === "Year") {
                if (i % 30 !== 0) return "";
            }
            const [year, month, day] = d.split("-"); // Split YYYY-MM-DD
            return `${parseInt(month)}/${parseInt(day)}`; // Convert to "M/D"
        });

        return { labels, data };
    }
    const { labels, data } = getTimeData();
    function getWeeklyTotal() {
        return data.reduce((total, curr) => (total += curr), 0);
    }
    const screenWidth = Dimensions.get("window").width;
    function getChartAxisInterval() {
        if (activityTime === "Week") {
            return 1;
        } else if (activityTime === "Month") {
            return 5;
        }
        return 30;
    }
    const chartConfig = {
        backgroundGradientFrom: "#25292e",
        backgroundGradientTo: "#25292e",
        decimalPlaces: 0,
        color: (opacity = 0) => `rgba(255, 255, 0, .15)`,
        labelColor: (opacity = 0) => `rgba(255, 255, 255, 1)`,
        propsForDots: {
            r: activityTime === "Week" ? "4" : "1",
            strokeWidth: "2",
            stroke: "#ffa726",
        },
    };

    const validAreas = useMemo(() => {
        if (!user?.activityLog || Object.keys(user?.activityLog).length === 0)
            return [];

        const allAreas = Object.values(user.activityLog)
            .map((log: any) => log.revealedArea)
            .flat(Infinity)
            .filter(
                (area: any) =>
                    area &&
                    area.geometry &&
                    Array.isArray(area.geometry.coordinates) &&
                    area.geometry.coordinates.length > 0
            );

        return allAreas;
    }, [user?.activityLog]);

    const testUnionMethods = useCallback(async () => {
        const results: Record<string, number> = {};

        // Test each strategy
        for (const [name, strategy] of Object.entries(unionStrategies)) {
            const [result, duration] = measureExecutionTime(
                () => strategy(validAreas),
                name
            );
            results[name] = duration;

            // Verify the result is valid
            if (result) {
                try {
                    const area = turf.area(result);
                    console.log(`${name} produced valid area: ${area}`);
                } catch (e) {
                    console.error(`${name} produced invalid result:`, e);
                }
            }
        }

        setPerformanceResults(results);

        // Use the fastest method for future calculations
        const fastestMethod = Object.entries(results).reduce((a, b) =>
            a[1] < b[1] ? a : b
        )[0] as keyof typeof unionStrategies;
        setUnionMethod(fastestMethod);
        console.log(`Fastest method: ${fastestMethod}`);

        return results;
    }, [validAreas]);

    useEffect(() => {
        if (!validAreas.length) {
            setTotalArea(0);
            return;
        }

        const task = InteractionManager.runAfterInteractions(() => {
            let isCancelled = false;

            try {
                const [unifiedFeature, duration] = measureExecutionTime(
                    () => unionStrategies[unionMethod](validAreas),
                    `Area calculation using ${unionMethod}`
                );

                if (!isCancelled && unifiedFeature) {
                    const area = turf.area(unifiedFeature);
                    setTotalArea(area);
                }
            } catch (e) {
                console.error("Error calculating area:", e);
                if (!isCancelled) setTotalArea(0);
            }

            return () => {
                isCancelled = true;
            };
        });

        return () => task.cancel();
    }, [validAreas, unionMethod]);

    const runPerformanceTest = () => {
        InteractionManager.runAfterInteractions(() => {
            testUnionMethods().then((results) => {
                console.log("Performance test results:", results);
            });
        });
    };

    // Memoize extraction of valid areas from the activity log (this could be heavy if the log is large)
    // const validAreas = useMemo(() => {
    //     if (!user?.activityLog) return [];
    //     // Extract the revealedArea from each log entry
    //     const allAreas = Object.values(user.activityLog).map(
    //         (log: any) => log.revealedArea
    //     );
    //     // Flatten deeply and filter out any invalid or empty geometries.
    //     const areas = allAreas
    //         .flat(Infinity)
    //         .filter(
    //             (area: any) =>
    //                 area &&
    //                 area.geometry &&
    //                 Array.isArray(area.geometry.coordinates) &&
    //                 area.geometry.coordinates.length > 0
    //         );
    //     return areas;
    // }, [user?.activityLog]);

    // Defer heavy total area calculation until after any interactions (animations, etc.) are finished.
    // useEffect(() => {
    //     if (validAreas.length === 0) {
    //         // if no valid areas, reset total area.
    //         setTotalArea(0);
    //         return;
    //     }

    //     let isCancelled = false;
    //     const task = InteractionManager.runAfterInteractions(() => {
    //         let computedTotal = 0;
    //         try {
    //             // Using Turf.js union to merge all polygons and then getting the area.
    //             // This operation might be heavy if there are many features.
    //             const unified = turf.union(
    //                 turf.featureCollection([...validAreas])
    //             );
    //             if (unified) {
    //                 computedTotal = turf.area(unified);
    //             } else {
    //                 // Fallback: calculate area for first valid area if union fails.
    //                 computedTotal = turf.area(validAreas[0]);
    //             }
    //         } catch (e) {
    //             console.error("Error during heavy area calculation:", e);
    //             computedTotal = 0;
    //         }
    //         if (!isCancelled) {
    //             setTotalArea(computedTotal);
    //         }
    //     });
    //     return () => {
    //         isCancelled = true;
    //         // Cancel the interaction manager task if possible.
    //         if (typeof task.cancel === "function") {
    //             task.cancel();
    //         }
    //     };
    // }, [validAreas]);

    return (
        <ScrollView style={styles.pageContainer}>
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            <View style={styles.container}>
                <View style={[styles.headerContainer, styles.section]}>
                    <FontAwesome name="user-circle" color="white" size={48} />
                    <Text style={styles.text}>{user?.name}</Text>
                </View>
                <Button
                    onPress={() => {
                        runPerformanceTest();
                    }}
                    title="Hello"
                />
                {user && (
                    <>
                        <StatCard
                            title="Total Area Revealed"
                            iconType="ionicons"
                            icon="footsteps"
                            value={getTotalArea().toFixed(2)}
                            size="large"
                            metric={user.metric}
                            percent={false}
                        />
                        <View style={[styles.statSquareContainer]}>
                            <View style={styles.statSquareRow}>
                                <View style={styles.squareStatItem}>
                                    <View style={styles.statIconValue}>
                                        <FontAwesome
                                            name="calendar"
                                            color="white"
                                            size={28}
                                        />
                                        <Text style={styles.statItemName}>
                                            New Area{"\n"}Revealed Today
                                        </Text>
                                    </View>
                                    <View style={[styles.statIconValue]}>
                                        <Text
                                            style={styles.statSquareItemValue}
                                        >
                                            {formatNumber(
                                                getNewAreaToday().toFixed(2)
                                            )}{" "}
                                            {user.metric ? "km²" : "mi²"}
                                        </Text>
                                    </View>
                                </View>
                                <StatCard
                                    title={`Area Covered${"\n"}Today`}
                                    iconType="fontawesome"
                                    icon="calendar"
                                    value={getTodaysArea().toFixed(2)}
                                    size="small"
                                    metric={user.metric}
                                    percent={false}
                                />
                            </View>
                            <View style={styles.statSquareRow}>
                                <StatCard
                                    title="Home Country Revealed"
                                    iconType="fontawesome"
                                    icon="home"
                                    value={(calcHome() * 100).toFixed(5)}
                                    size="small"
                                    metric={user.metric}
                                    percent={true}
                                />
                                <StatCard
                                    title={`World${"\n"}Revealed`}
                                    iconType="ionicons"
                                    icon="globe-outline"
                                    value={(calcWorld() * 100).toFixed(5)}
                                    size="small"
                                    metric={user.metric}
                                    percent={true}
                                />
                            </View>
                        </View>
                        <View style={styles.fullStatItem}>
                            <Text
                                style={[
                                    styles.subtext,
                                    styles.subtextValue,
                                    { textAlign: "center", marginBottom: 4 },
                                ]}
                            >
                                Activity This {activityTime}
                            </Text>
                            <SlidingToggle
                                options={["Week", "Month", "Year"]}
                                onToggle={(selected: string) =>
                                    setActivityTime(selected)
                                }
                                small={true}
                            />
                            <LineChart
                                data={{
                                    labels: labels,
                                    datasets: [{ data: data }],
                                }}
                                width={screenWidth - 40}
                                height={220}
                                yAxisSuffix={user.metric ? " km²" : " mi²"}
                                yAxisInterval={getChartAxisInterval()}
                                chartConfig={chartConfig}
                                bezier
                                withDots={activityTime !== "Year"}
                                verticalLabelRotation={0}
                                style={{
                                    borderRadius: 16,
                                    alignSelf: "center",
                                }}
                            />
                        </View>
                        {getWeeklyTotal() > 0 ? (
                            <View
                                style={[
                                    styles.squareStatItem,
                                    { marginHorizontal: 10 },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.subtext,
                                        styles.subtextValue,
                                        { textAlign: "center", lineHeight: 20 },
                                    ]}
                                >
                                    You covered{" "}
                                    {formatNumber(getWeeklyTotal().toFixed(1))}
                                    {user.metric ? " km²" : " mi²"}
                                    {"\n"} this week!
                                </Text>
                            </View>
                        ) : (
                            <></>
                        )}
                        <View style={styles.fullStatItem}>
                            <View style={styles.statItem}>
                                <View style={styles.statName}>
                                    <FontAwesome
                                        name="calendar"
                                        color="white"
                                        size={20}
                                    />
                                    <Text style={styles.subtext}>
                                        Average Revealed Per Day:
                                    </Text>
                                </View>
                                <Text
                                    style={[
                                        styles.subtext,
                                        styles.subtextValue,
                                    ]}
                                >
                                    {getAverageArea()}
                                </Text>
                            </View>
                            <View style={styles.statItem}>
                                <View style={styles.statName}>
                                    <FontAwesome
                                        name="calendar"
                                        color="white"
                                        size={20}
                                    />
                                    <Text style={styles.subtext}>
                                        Start Date:
                                    </Text>
                                </View>
                                <Text
                                    style={[
                                        styles.subtext,
                                        styles.subtextValue,
                                    ]}
                                >
                                    {getJoinedDay()}
                                </Text>
                            </View>

                            <View style={styles.statItem}>
                                <View style={styles.statName}>
                                    <FontAwesome
                                        name="calendar"
                                        color="white"
                                        size={20}
                                    />
                                    <Text style={styles.subtext}>
                                        Longest Streak:
                                    </Text>
                                </View>
                                <Text
                                    style={[
                                        styles.subtext,
                                        styles.subtextValue,
                                    ]}
                                >
                                    {getLongestActiveStreak()} days
                                </Text>
                            </View>
                            <View style={styles.statItem}>
                                <View style={styles.statName}>
                                    <FontAwesome
                                        name="calendar"
                                        color="white"
                                        size={20}
                                    />
                                    <Text style={styles.subtext}>
                                        Days Active:
                                    </Text>
                                </View>
                                <Text
                                    style={[
                                        styles.subtext,
                                        styles.subtextValue,
                                    ]}
                                >
                                    {getDaysActive()}
                                </Text>
                            </View>
                        </View>
                    </>
                )}
                {!user && (
                    <View style={styles.loadingContainer}>
                        <LoadingScreen />
                    </View>
                )}
            </View>
        </ScrollView>
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
    text: {
        color: "#fff",
        fontSize: 24,
    },
    subtext: {
        color: "#fff",
    },
    subtextValue: {
        fontSize: 16,
        fontWeight: 700,
    },

    section: {
        padding: 20,
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
    statName: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

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
    statSquareContainer: {
        display: "flex",
        flexDirection: "column",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 10,
    },
    statSquareRow: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 10,
        marginHorizontal: 10,
        marginVertical: 5,
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
    statCard: {
        marginVertical: 8,
        padding: 12,
        backgroundColor: "#ffffff",
        borderRadius: 8,
        // Add shadow or border as needed.
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    statTitle: {
        fontSize: 16,
        fontWeight: "500",
    },
    statValue: {
        fontSize: 16,
        fontWeight: "bold",
    },
});
