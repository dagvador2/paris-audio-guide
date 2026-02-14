/**
 * Calcul de distance entre coordonnées GPS avec la formule de Haversine.
 * Utilisé pour le geofencing et l'affichage des distances.
 */

import { GeoPoint } from '../types';

const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calcule la distance en mètres entre deux points GPS (formule de Haversine).
 */
export function calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
      Math.cos(toRadians(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Vérifie si un point est dans le rayon d'un checkpoint.
 */
export function isWithinRadius(
  userLocation: GeoPoint,
  checkpointLocation: GeoPoint,
  radiusMeters: number,
  bufferMeters: number = 0
): boolean {
  const distance = calculateDistance(userLocation, checkpointLocation);
  return distance <= radiusMeters + bufferMeters;
}

/**
 * Calcule le bearing (direction) entre deux points en degrés (0-360).
 */
export function calculateBearing(from: GeoPoint, to: GeoPoint): number {
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Calcule la distance totale d'un parcours (somme des segments).
 */
export function calculateTotalRouteDistance(points: GeoPoint[]): number {
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += calculateDistance(points[i], points[i + 1]);
  }
  return total;
}
