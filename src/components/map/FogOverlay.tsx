import geohash from 'ngeohash';
import React, { useMemo } from 'react';
import { Polygon } from 'react-native-maps';
import { useSelector } from 'react-redux';

import { createSquarePolygon } from '@/src/utils/geo';
import { RootState } from '../../store';
import { selectExploredAreasInBounds } from '../../store/slices/exploredSlice';

const REVEAL_SQUARE_SIZE_METERS = 120;


// --- Component Definition ---

interface FogOverlayProps {
  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  fogColor?: string;
}

export const FogOverlay: React.FC<FogOverlayProps> = ({
  mapRegion,
  fogColor = 'rgba(0,0,0,0.8)',
}) => {
  const bounds = useMemo(() => {
    const buffer = 0.5;
    return {
      minLat: mapRegion.latitude - mapRegion.latitudeDelta * (0.5 + buffer),
      maxLat: mapRegion.latitude + mapRegion.latitudeDelta * (0.5 + buffer),
      minLng: mapRegion.longitude - mapRegion.longitudeDelta * (0.5 + buffer),
      maxLng: mapRegion.longitude + mapRegion.longitudeDelta * (0.5 + buffer),
    };
  }, [mapRegion]);

  const fogBoundary = useMemo(() => [
    { latitude: bounds.minLat, longitude: bounds.minLng },
    { latitude: bounds.minLat, longitude: bounds.maxLng },
    { latitude: bounds.maxLat, longitude: bounds.maxLng },
    { latitude: bounds.maxLat, longitude: bounds.minLng },
  ], [bounds]);

  const visibleExploredAreas = useSelector((state: RootState) =>
    selectExploredAreasInBounds(state, {
        minLat: mapRegion.latitude - mapRegion.latitudeDelta / 2,
        maxLat: mapRegion.latitude + mapRegion.latitudeDelta / 2,
        minLng: mapRegion.longitude - mapRegion.longitudeDelta / 2,
        maxLng: mapRegion.longitude + mapRegion.longitudeDelta / 2,
    })
  );

  // --- Start of Corrected Section ---
  // Create the square "holes" for our fog polygon
  const holes = useMemo(() => {
    return visibleExploredAreas.map(area => {
      // 1. Decode the CENTER of the geohash, not the bounding box
      const center = geohash.decode(area.geohash);

      // 2. Create a square polygon using our helper function
      return createSquarePolygon(center, REVEAL_SQUARE_SIZE_METERS);
    });
  }, [visibleExploredAreas]);
  // --- End of Corrected Section ---

  return (
    <Polygon
      coordinates={fogBoundary}
      holes={holes}
      fillColor={fogColor}
      strokeWidth={0}
    />
  );
};