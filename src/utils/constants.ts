/**
 * Constantes globales de l'application Paris Audio Guide.
 */

// Géolocalisation
export const DEFAULT_GEOFENCE_RADIUS = 30; // mètres
export const GPS_UPDATE_INTERVAL = 3000; // ms
export const GPS_DISTANCE_FILTER = 5; // mètres minimum entre deux mises à jour
export const GPS_ACCURACY_BUFFER = 10; // mètres de buffer pour GPS imprécis

// Carte
export const PARIS_CENTER = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const MAP_ZOOM_TOUR = {
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

// Audio
export const AUDIO_AUTO_PLAY = true;

// Scoring
export const DEFAULT_CHECKPOINT_POINTS = 100;
export const DEFAULT_RIDDLE_BONUS = 50;

// Couleurs
export const COLORS = {
  primary: '#2D5A27',
  primaryLight: '#4A8C3F',
  primaryDark: '#1A3A17',
  secondary: '#C4933F',
  secondaryLight: '#E0B86A',
  accent: '#8B4513',
  background: '#FAFAF5',
  surface: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textLight: '#999999',
  border: '#E5E5E0',
  success: '#2D8B46',
  error: '#D32F2F',
  warning: '#F9A825',
  info: '#1976D2',
  checkpointLocked: '#BDBDBD',
  checkpointNext: '#C4933F',
  checkpointReached: '#2D8B46',
  mapRoute: '#2D5A27',
};

// Typographie
export const FONTS = {
  regular: 'System',
  bold: 'System',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    title: 32,
  },
};

// Dimensions
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};

// AsyncStorage keys
export const STORAGE_KEYS = {
  USER_PROGRESS: '@paris_audio_guide/user_progress',
  COMPLETED_TOURS: '@paris_audio_guide/completed_tours',
  BADGES: '@paris_audio_guide/badges',
  USER_STATS: '@paris_audio_guide/user_stats',
  ACTIVE_TOUR: '@paris_audio_guide/active_tour',
  LANGUAGE: '@paris_audio_guide/language',
};
