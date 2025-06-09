import geohash from 'ngeohash';
import React, { useMemo } from 'react';
import { Polygon } from 'react-native-maps';
import { useSelector } from 'react-redux';

import { RootState } from '../../store';
import { selectExploredAreasInBounds } from '../../store/slices/exploredSlice';

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
    const buffer = 1.5;
    return {
      minLat: mapRegion.latitude - mapRegion.latitudeDelta * (0.5 + buffer),
      maxLat: mapRegion.latitude + mapRegion.latitudeDelta * (0.5 + buffer),
      minLng: mapRegion.longitude - mapRegion.longitudeDelta * (0.5 + buffer),
      maxLng: mapRegion.longitude + mapRegion.longitudeDelta * (0.5 + buffer),
    };
  }, [mapRegion]);

  // The main fog polygon, which must be COUNTER-CLOCKWISE
  const fogBoundary = useMemo(() => [
    { latitude: bounds.minLat, longitude: bounds.minLng },
    { latitude: bounds.maxLat, longitude: bounds.minLng },
    { latitude: bounds.maxLat, longitude: bounds.maxLng },
    { latitude: bounds.minLat, longitude: bounds.maxLng },
  ], [bounds]);

  const visibleExploredAreas = useSelector((state: RootState) =>
    selectExploredAreasInBounds(state, {
        minLat: mapRegion.latitude - mapRegion.latitudeDelta / 2,
        maxLat: mapRegion.latitude + mapRegion.latitudeDelta / 2,
        minLng: mapRegion.longitude - mapRegion.longitudeDelta / 2,
        maxLng: mapRegion.longitude + mapRegion.longitudeDelta / 2,
    })
  );

  const holes = useMemo(() => {
    return visibleExploredAreas.map(area => {
      const bbox = geohash.decode_bbox(area.geohash);
      const [minLat, minLng, maxLat, maxLng] = bbox;
      return [
        { latitude: minLat, longitude: minLng },
        { latitude: minLat, longitude: maxLng },
        { latitude: maxLat, longitude: maxLng },
        { latitude: maxLat, longitude: minLng },
      ];
    });
  }, [visibleExploredAreas]);

  return (
    <Polygon
      coordinates={fogBoundary}
      holes={holes}
      fillColor={fogColor}
      strokeWidth={0}
    />
  );
};