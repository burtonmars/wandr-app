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
  fogOpacity?: number;
}

export const FogOverlay: React.FC<FogOverlayProps> = ({
  mapRegion,
  fogColor = '#000000',
  fogOpacity = 1,
}) => {
  const bounds = useMemo(() => ({
    minLat: mapRegion.latitude - mapRegion.latitudeDelta / 2,
    maxLat: mapRegion.latitude + mapRegion.latitudeDelta / 2,
    minLng: mapRegion.longitude - mapRegion.longitudeDelta / 2,
    maxLng: mapRegion.longitude + mapRegion.longitudeDelta / 2,
  }), [mapRegion]);

  const visibleExploredAreas = useSelector((state: RootState) => 
    selectExploredAreasInBounds(state, bounds)
  );

  // Convert hex color to RGBA with opacity
  const fogColorWithOpacity = useMemo(() => {
    const hex = fogColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${fogOpacity})`;
  }, [fogColor, fogOpacity]);

  // Convert geohashes to polygon holes
  const holes = useMemo(() => {
    // Group by precision for optimization
    const groupedByPrecision = visibleExploredAreas.reduce((acc, area) => {
      if (!acc[area.precision]) acc[area.precision] = [];
      acc[area.precision].push(area);
      return acc;
    }, {} as Record<number, typeof visibleExploredAreas>);

    // Convert to polygons, starting with lowest precision (largest areas)
    const polygons: { latitude: number; longitude: number }[][] = [];
    const processedHashes = new Set<string>();

    Object.keys(groupedByPrecision)
      .map(Number)
      .sort((a, b) => a - b) // Process lower precision first
      .forEach(precision => {
        groupedByPrecision[precision].forEach(area => {
          // Skip if this area is already covered by a lower precision hash
          let isCovered = false;
          for (let p = area.precision - 1; p >= 6; p--) {
            const parentHash = area.geohash.substring(0, p);
            if (processedHashes.has(parentHash)) {
              isCovered = true;
              break;
            }
          }

          if (!isCovered) {
            const bbox = geohash.decode_bbox(area.geohash);
            const [minLat, minLng, maxLat, maxLng] = bbox;
            
           // Create polygon for this geohash (CLOCKWISE)
            polygons.push([
                { latitude: minLat, longitude: minLng }, // Bottom-Left
                { latitude: maxLat, longitude: minLng }, // Top-Left
                { latitude: maxLat, longitude: maxLng }, // Top-Right
                { latitude: minLat, longitude: maxLng }, // Bottom-Right
            ]);
            
            processedHashes.add(area.geohash);
          }
        });
      });

    return polygons;
  }, [visibleExploredAreas]);

  // Create the outer polygon that covers the entire viewport
  const outerPolygon = [
    { latitude: bounds.minLat - 0.1, longitude: bounds.minLng - 0.1 },
    { latitude: bounds.minLat - 0.1, longitude: bounds.maxLng + 0.1 },
    { latitude: bounds.maxLat + 0.1, longitude: bounds.maxLng + 0.1 },
    { latitude: bounds.maxLat + 0.1, longitude: bounds.minLng - 0.1 },
  ];

  // Don't render if no fog needed
  if (holes.length === 0) {
    return (
      <Polygon
        coordinates={outerPolygon}
        fillColor={fogColorWithOpacity}
        strokeWidth={0}
        strokeColor="transparent"
        zIndex={1}
      />
    );
  }

  return (
    <Polygon
      coordinates={outerPolygon}
      holes={holes}
      fillColor={fogColorWithOpacity}
      strokeWidth={0}
      strokeColor="transparent"
      zIndex={1}
    />
  );
};