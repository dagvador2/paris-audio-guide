/**
 * Types TypeScript principaux de l'application Paris Audio Guide.
 * Définit les modèles de données pour les visites, checkpoints, énigmes,
 * progression utilisateur et badges.
 */

// === GÉOLOCALISATION ===
export interface GeoPoint {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

// === CONTENU IMAGE ===
export interface ContentImage {
  uri: string;
  caption: string;
  credit?: string;
}

// === CONTENU D'UN CHECKPOINT ===
export interface CheckpointContent {
  audioFile: string;
  audioDuration: number;
  title: string;
  narrativeText: string;
  historicalFact?: string;
  images?: ContentImage[];
  funFact?: string;
}

// === ÉNIGME ===
export interface Riddle {
  id: string;
  type: 'multiple_choice' | 'text_input' | 'photo_spot' | 'observation';
  question: string;
  hint?: string;
  options?: string[];
  correctAnswerIndex?: number;
  acceptedAnswers?: string[];
  photoPrompt?: string;
  observationPrompt?: string;
  explanation: string;
  explanationAudio?: string;
  maxAttempts: number;
  timeLimitSeconds?: number;
}

// === CHECKPOINT (POINT DE PASSAGE) ===
export interface Checkpoint {
  id: string;
  tourId: string;
  order: number;
  title: string;
  location: GeoPoint;
  triggerRadius: number;
  content: CheckpointContent;
  riddle?: Riddle;
  points: number;
  bonusPoints?: number;
  hint?: string;
  nextCheckpointHint?: string;
}

// === VISITE (TOUR) ===
export interface Tour {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  coverImage: string;
  duration: number;
  distance: number;
  difficulty: 'easy' | 'medium' | 'hard';
  theme: string;
  arrondissements: number[];
  startPoint: GeoPoint;
  checkpoints: Checkpoint[];
  totalPoints: number;
  tags: string[];
  available: boolean;
}

// === PROGRESSION UTILISATEUR ===
export interface CheckpointProgress {
  checkpointId: string;
  reachedAt: string;
  audioListened: boolean;
  riddleSolved?: boolean;
  riddleAttempts?: number;
  pointsEarned: number;
}

export interface UserProgress {
  tourId: string;
  startedAt: string;
  completedAt?: string;
  checkpointsReached: CheckpointProgress[];
  totalScore: number;
  riddlesCorrect: number;
  riddlesTotal: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  elapsedTimeMinutes: number;
  distanceWalkedMeters: number;
}

// === BADGES / GAMIFICATION ===
export interface BadgeCondition {
  type:
    | 'tour_completed'
    | 'tours_count'
    | 'riddles_streak'
    | 'distance_total'
    | 'perfect_score'
    | 'speed_run';
  tourId?: string;
  value?: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: BadgeCondition;
  unlockedAt?: string;
}

// === ÉTAT DU STORE ===
export interface TourState {
  activeTour: Tour | null;
  activeCheckpointIndex: number;
  progress: UserProgress | null;
  isNavigating: boolean;
}

export interface UserState {
  completedTours: UserProgress[];
  badges: Badge[];
  totalDistance: number;
  totalScore: number;
}

export interface AudioState {
  isPlaying: boolean;
  isLoaded: boolean;
  currentFile: string | null;
  positionMillis: number;
  durationMillis: number;
}
