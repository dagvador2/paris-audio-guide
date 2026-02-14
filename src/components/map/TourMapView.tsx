/**
 * Carte interactive de la visite en cours.
 * Affiche la position utilisateur, le tracé du parcours,
 * les checkpoints avec leur statut, et les cercles de geofencing.
 */

import React, { useRef, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { Checkpoint, GeoPoint } from '../../types';
import { GeofenceCircle } from './GeofenceCircle';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, MAP_ZOOM_TOUR } from '../../utils/constants';

interface TourMapViewProps {
  checkpoints: Checkpoint[];
  reachedCheckpointIds: string[];
  activeCheckpointIndex: number;
  userLocation: GeoPoint | null;
  showGeofence?: boolean;
}

export function TourMapView({
  checkpoints,
  reachedCheckpointIds,
  activeCheckpointIndex,
  userLocation,
  showGeofence = true,
}: TourMapViewProps) {
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);

  const getMarkerColor = (checkpoint: Checkpoint, index: number): string => {
    if (reachedCheckpointIds.includes(checkpoint.id)) {
      return COLORS.checkpointReached;
    }
    if (index === activeCheckpointIndex) {
      return COLORS.checkpointNext;
    }
    return COLORS.checkpointLocked;
  };

  const routeCoords = checkpoints.map((cp) => ({
    latitude: cp.location.latitude,
    longitude: cp.location.longitude,
  }));

  const centerOnUser = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        ...MAP_ZOOM_TOUR,
      });
    }
  }, [userLocation]);

  const initialRegion = checkpoints.length > 0
    ? {
        latitude: checkpoints[0].location.latitude,
        longitude: checkpoints[0].location.longitude,
        ...MAP_ZOOM_TOUR,
      }
    : undefined;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        mapType="standard"
      >
        {/* Tracé du parcours */}
        <Polyline
          coordinates={routeCoords}
          strokeColor={COLORS.mapRoute}
          strokeWidth={3}
          lineDashPattern={[10, 5]}
        />

        {/* Marqueurs des checkpoints */}
        {checkpoints.map((checkpoint, index) => {
          const color = getMarkerColor(checkpoint, index);
          const isReached = reachedCheckpointIds.includes(checkpoint.id);
          const isNext = index === activeCheckpointIndex;

          return (
            <Marker
              key={checkpoint.id}
              coordinate={{
                latitude: checkpoint.location.latitude,
                longitude: checkpoint.location.longitude,
              }}
              title={checkpoint.title}
              description={isReached ? '✓' : `${t('tour.checkpoint')} ${checkpoint.order}`}
            >
              <View
                style={[
                  styles.markerContainer,
                  { backgroundColor: color },
                  isNext && styles.markerNext,
                ]}
                accessibilityLabel={`${t('tour.checkpoint')} ${checkpoint.order}: ${checkpoint.title}`}
              >
                <Text style={styles.markerText}>
                  {isReached ? '✓' : checkpoint.order}
                </Text>
              </View>
            </Marker>
          );
        })}

        {/* Cercle de geofencing du prochain checkpoint */}
        {showGeofence && checkpoints[activeCheckpointIndex] && (
          <GeofenceCircle
            center={checkpoints[activeCheckpointIndex].location}
            radius={checkpoints[activeCheckpointIndex].triggerRadius}
          />
        )}
      </MapView>

      {/* Bouton recentrer */}
      <TouchableOpacity
        style={styles.centerButton}
        onPress={centerOnUser}
        accessibilityLabel={t('map.centerOnMe')}
        accessibilityRole="button"
      >
        <Text style={styles.centerButtonText}>◎</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  markerNext: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
  },
  markerText: {
    color: COLORS.surface,
    fontWeight: 'bold',
    fontSize: FONTS.sizes.sm,
  },
  centerButton: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  centerButtonText: {
    fontSize: 24,
    color: COLORS.primary,
  },
});
