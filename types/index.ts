import { Feature, GeoJsonProperties, MultiPolygon, Polygon } from "geojson";

export interface User {
    name: string;
    joinedDate: string;
    mapStyle: string;
    metric: boolean;
    activityLog: {
        [date: string]: {
            revealedArea: Feature<Polygon | MultiPolygon, GeoJsonProperties> | null;
            coordinate: number[][]
        };
    };
    charcoins: number;
    overlayColor: string;
    dotColor: string;
    country: string;
    alliance: number;
    cosmetics: number[];
}