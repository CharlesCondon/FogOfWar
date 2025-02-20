import React from "react";
import Mapbox from "@rnmapbox/maps";
import PropTypes from "prop-types";
import { Feature, GeoJsonProperties, MultiPolygon, Polygon } from "geojson";

interface FogOfWarLayerProps {
    fogGeoJSON: Feature<Polygon | MultiPolygon, GeoJsonProperties>;
    overlayOpacity: number;
    overlayColor: string;
}

const FogLayer = React.memo<FogOfWarLayerProps>(
    ({ fogGeoJSON, overlayOpacity, overlayColor }) => {
        if (!fogGeoJSON) return null;

        return (
            <Mapbox.ShapeSource id="fogSource" shape={fogGeoJSON}>
                <Mapbox.FillLayer
                    id="fogLayer"
                    style={{
                        fillColor: overlayColor || "#000000",
                        fillOpacity: overlayOpacity ?? 0.5,
                    }}
                />
            </Mapbox.ShapeSource>
        );
    }
);

export default FogLayer;

// Usage in your MapView file
// import FogOfWarLayer from "./FogOfWarLayer";
//
// <FogOfWarLayer
//     fogGeoJSON={fogGeoJSON}
//     overlayOpacity={0.5}
//     overlayColor="#333333"
// />
