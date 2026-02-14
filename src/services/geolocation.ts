/**
 * Service de géolocalisation.
 * Gère les permissions GPS, la position courante et le suivi continu.
 */

import * as Location from 'expo-location';
import { GeoPoint } from '../types';
import { GPS_UPDATE_INTERVAL, GPS_DISTANCE_FILTER } from '../utils/constants';

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function checkPermissions(): Promise<boolean> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentPosition(): Promise<GeoPoint> {
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

export async function startWatching(
  callback: (location: GeoPoint) => void
): Promise<Location.LocationSubscription> {
  return await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: GPS_UPDATE_INTERVAL,
      distanceInterval: GPS_DISTANCE_FILTER,
    },
    (location) => {
      callback({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  );
}

export function stopWatching(subscription: Location.LocationSubscription): void {
  subscription.remove();
}
