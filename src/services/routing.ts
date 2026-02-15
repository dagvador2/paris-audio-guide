/**
 * Service de routing piéton via OpenRouteService (ORS).
 * Récupère les itinéraires réels (suivant les rues) entre les checkpoints.
 * Profil : foot-walking (piéton).
 */

import { GeoPoint } from '../types';
import { ORS_API_KEY, ORS_DIRECTIONS_URL } from '../utils/constants';

interface LatLng {
  latitude: number;
  longitude: number;
}

// Cache en mémoire pour éviter les requêtes redondantes
const routeCache = new Map<string, LatLng[]>();

/**
 * Génère une clé de cache à partir des coordonnées.
 */
function getCacheKey(points: GeoPoint[]): string {
  return points.map((p) => `${p.latitude.toFixed(6)},${p.longitude.toFixed(6)}`).join('|');
}

/**
 * Récupère l'itinéraire piéton réel entre une série de points via OpenRouteService.
 * Retourne les coordonnées du tracé suivant les rues.
 * En cas d'erreur, retourne null (le caller peut fallback sur les lignes droites).
 */
export async function fetchWalkingRoute(points: GeoPoint[]): Promise<LatLng[] | null> {
  if (points.length < 2) return null;

  const cacheKey = getCacheKey(points);
  const cached = routeCache.get(cacheKey);
  if (cached) return cached;

  // ORS attend le format : [[lng, lat], [lng, lat], ...]
  const coordinates = points.map((p) => [p.longitude, p.latitude]);

  try {
    const response = await fetch(ORS_DIRECTIONS_URL, {
      method: 'POST',
      headers: {
        'Authorization': ORS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ coordinates }),
    });

    if (!response.ok) return null;

    const data = await response.json();

    // Réponse GeoJSON : features[0].geometry.coordinates = [[lng, lat], ...]
    const coords = data?.features?.[0]?.geometry?.coordinates;
    if (!coords || !Array.isArray(coords)) return null;

    const result: LatLng[] = coords.map((c: number[]) => ({
      latitude: c[1],
      longitude: c[0],
    }));

    routeCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.warn('[routing] ORS request failed, falling back to straight lines:', error);
    return null;
  }
}
