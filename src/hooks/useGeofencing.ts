/**
 * Hook de geofencing — cœur de l'application.
 * Surveille la position GPS et déclenche les checkpoints
 * quand l'utilisateur entre dans leur rayon.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { GeoPoint, Checkpoint } from '../types';
import { calculateDistance } from '../utils/distance';
import { GPS_ACCURACY_BUFFER } from '../utils/constants';
import * as GeolocationService from '../services/geolocation';

interface GeofencingState {
  userLocation: GeoPoint | null;
  distanceToNext: number | null;
  isTracking: boolean;
  error: string | null;
}

interface UseGeofencingOptions {
  checkpoints: Checkpoint[];
  activeCheckpointIndex: number;
  reachedCheckpointIds: string[];
  onCheckpointReached: (checkpoint: Checkpoint) => void;
  enabled: boolean;
}

export function useGeofencing({
  checkpoints,
  activeCheckpointIndex,
  reachedCheckpointIds,
  onCheckpointReached,
  enabled,
}: UseGeofencingOptions): GeofencingState {
  const [userLocation, setUserLocation] = useState<GeoPoint | null>(null);
  const [distanceToNext, setDistanceToNext] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);

  const nextCheckpoint = checkpoints[activeCheckpointIndex] ?? null;

  const handleLocationUpdate = useCallback(
    (location: GeoPoint) => {
      setUserLocation(location);

      if (!nextCheckpoint) return;

      // Calcul de distance vers le prochain checkpoint
      const distance = calculateDistance(location, nextCheckpoint.location);
      setDistanceToNext(distance);

      // Vérification de l'entrée dans le rayon de geofencing
      const effectiveRadius = nextCheckpoint.triggerRadius + GPS_ACCURACY_BUFFER;

      if (
        distance <= effectiveRadius &&
        !reachedCheckpointIds.includes(nextCheckpoint.id)
      ) {
        onCheckpointReached(nextCheckpoint);
      }
    },
    [nextCheckpoint, reachedCheckpointIds, onCheckpointReached]
  );

  useEffect(() => {
    if (!enabled) {
      if (subscriptionRef.current) {
        GeolocationService.stopWatching(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      setIsTracking(false);
      return;
    }

    let mounted = true;

    const startTracking = async () => {
      try {
        const hasPermission = await GeolocationService.requestPermissions();
        if (!hasPermission) {
          if (mounted) setError('GPS permission denied');
          return;
        }

        // Position initiale
        const initial = await GeolocationService.getCurrentPosition();
        if (mounted) {
          setUserLocation(initial);
          setError(null);
        }

        // Surveillance continue
        const sub = await GeolocationService.startWatching((location) => {
          if (mounted) handleLocationUpdate(location);
        });

        if (mounted) {
          subscriptionRef.current = sub;
          setIsTracking(true);
        } else {
          GeolocationService.stopWatching(sub);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Geolocation error');
          setIsTracking(false);
        }
      }
    };

    startTracking();

    return () => {
      mounted = false;
      if (subscriptionRef.current) {
        GeolocationService.stopWatching(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [enabled, handleLocationUpdate]);

  return { userLocation, distanceToNext, isTracking, error };
}
