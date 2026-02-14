/**
 * Fonctions de formatage pour durées, distances, scores, etc.
 */

/**
 * Formate une distance en mètres en texte lisible.
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Formate une durée en minutes en texte lisible.
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h${mins.toString().padStart(2, '0')}`;
}

/**
 * Formate une durée en secondes pour l'affichage audio (MM:SS).
 */
export function formatAudioTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formate un score avec séparateur de milliers.
 */
export function formatScore(score: number): string {
  return score.toLocaleString('fr-FR');
}

/**
 * Formate une date ISO en texte lisible.
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Formate un pourcentage (0-1) en texte.
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}
