/**
 * Store Zustand pour la visite active.
 * Gère le cycle de vie complet d'une visite : démarrage, progression
 * checkpoint par checkpoint, scoring, et persistance dans AsyncStorage.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tour, TourMode, UserProgress, CheckpointProgress, Checkpoint } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

interface TourState {
  activeTour: Tour | null;
  activeCheckpointIndex: number;
  progress: UserProgress | null;
  isNavigating: boolean;
  mode: TourMode | null;
}

interface TourActions {
  startTour: (tour: Tour, mode: TourMode) => Promise<void>;
  reachCheckpoint: (checkpointId: string, points: number) => void;
  solveRiddle: (checkpointId: string, correct: boolean, bonusPoints: number) => void;
  markAudioListened: (checkpointId: string) => void;
  completeTour: () => Promise<void>;
  abandonTour: () => Promise<void>;
  updateDistance: (meters: number) => void;
  updateElapsedTime: (minutes: number) => void;
  loadSavedTour: () => Promise<void>;
  clearActiveTour: () => Promise<void>;
  getNextCheckpoint: () => Checkpoint | null;
  isCheckpointReached: (checkpointId: string) => boolean;
}

const persistState = async (state: TourState) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_TOUR, JSON.stringify(state));
  } catch (error) {
    console.error('[useTourStore] Failed to persist:', error);
  }
};

export const useTourStore = create<TourState & TourActions>((set, get) => ({
  activeTour: null,
  activeCheckpointIndex: 0,
  progress: null,
  isNavigating: false,
  mode: null,

  startTour: async (tour: Tour, mode: TourMode) => {
    const now = new Date().toISOString();
    const riddlesTotal = mode === 'escape_game'
      ? tour.checkpoints.filter((cp) => cp.riddle).length
      : 0;

    const initialProgress: UserProgress = {
      tourId: tour.id,
      mode,
      startedAt: now,
      checkpointsReached: [],
      totalScore: 0,
      riddlesCorrect: 0,
      riddlesTotal,
      status: 'in_progress',
      elapsedTimeMinutes: 0,
      distanceWalkedMeters: 0,
    };

    const newState: TourState = {
      activeTour: tour,
      activeCheckpointIndex: 0,
      progress: initialProgress,
      isNavigating: true,
      mode,
    };

    set(newState);
    await persistState(newState);
  },

  reachCheckpoint: (checkpointId: string, points: number) => {
    set((state) => {
      if (!state.progress) return state;

      const cpProgress: CheckpointProgress = {
        checkpointId,
        reachedAt: new Date().toISOString(),
        audioListened: false,
        pointsEarned: points,
      };

      const updatedProgress: UserProgress = {
        ...state.progress,
        checkpointsReached: [...state.progress.checkpointsReached, cpProgress],
        totalScore: state.progress.totalScore + points,
      };

      const nextIndex = state.activeCheckpointIndex + 1;
      const newState = {
        progress: updatedProgress,
        activeCheckpointIndex: nextIndex,
      };

      persistState({
        activeTour: state.activeTour,
        activeCheckpointIndex: nextIndex,
        progress: updatedProgress,
        isNavigating: state.isNavigating,
        mode: state.mode,
      });

      return newState;
    });
  },

  solveRiddle: (checkpointId: string, correct: boolean, bonusPoints: number) => {
    set((state) => {
      if (!state.progress) return state;

      const updatedCheckpoints = state.progress.checkpointsReached.map((cp) => {
        if (cp.checkpointId !== checkpointId) return cp;
        return {
          ...cp,
          riddleSolved: correct ? true : cp.riddleSolved,
          riddleAttempts: (cp.riddleAttempts ?? 0) + 1,
          pointsEarned: cp.pointsEarned + (correct ? bonusPoints : 0),
        };
      });

      const updatedProgress: UserProgress = {
        ...state.progress,
        checkpointsReached: updatedCheckpoints,
        totalScore: state.progress.totalScore + (correct ? bonusPoints : 0),
        riddlesCorrect: state.progress.riddlesCorrect + (correct ? 1 : 0),
      };

      persistState({
        activeTour: state.activeTour,
        activeCheckpointIndex: state.activeCheckpointIndex,
        progress: updatedProgress,
        isNavigating: state.isNavigating,
        mode: state.mode,
      });

      return { progress: updatedProgress };
    });
  },

  markAudioListened: (checkpointId: string) => {
    set((state) => {
      if (!state.progress) return state;

      const updatedCheckpoints = state.progress.checkpointsReached.map((cp) => {
        if (cp.checkpointId !== checkpointId) return cp;
        return { ...cp, audioListened: true };
      });

      return {
        progress: { ...state.progress, checkpointsReached: updatedCheckpoints },
      };
    });
  },

  completeTour: async () => {
    const state = get();
    if (!state.progress) return;

    const updatedProgress: UserProgress = {
      ...state.progress,
      status: 'completed',
      completedAt: new Date().toISOString(),
    };

    set({ progress: updatedProgress, isNavigating: false });
    await persistState({
      activeTour: state.activeTour,
      activeCheckpointIndex: state.activeCheckpointIndex,
      progress: updatedProgress,
      isNavigating: false,
      mode: state.mode,
    });
  },

  abandonTour: async () => {
    const state = get();
    if (!state.progress) return;

    // Nettoyage complet : la visite abandonnée ne doit plus bloquer le choix de mode
    set({ activeTour: null, activeCheckpointIndex: 0, progress: null, isNavigating: false, mode: null });
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_TOUR);
    } catch (error) {
      console.error('[useTourStore] Failed to clear on abandon:', error);
    }
  },

  updateDistance: (meters: number) => {
    set((state) => {
      if (!state.progress) return state;
      return {
        progress: {
          ...state.progress,
          distanceWalkedMeters: state.progress.distanceWalkedMeters + meters,
        },
      };
    });
  },

  updateElapsedTime: (minutes: number) => {
    set((state) => {
      if (!state.progress) return state;
      return {
        progress: { ...state.progress, elapsedTimeMinutes: minutes },
      };
    });
  },

  loadSavedTour: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_TOUR);
      if (!raw) return;
      const saved = JSON.parse(raw) as TourState;
      if (saved.activeTour && saved.progress?.status === 'in_progress') {
        // Backward compat: default to escape_game if no mode saved
        if (!saved.mode) saved.mode = 'escape_game';
        if (saved.progress && !saved.progress.mode) saved.progress.mode = 'escape_game';
        set(saved);
      }
    } catch (error) {
      console.error('[useTourStore] Failed to load:', error);
    }
  },

  clearActiveTour: async () => {
    set({ activeTour: null, activeCheckpointIndex: 0, progress: null, isNavigating: false, mode: null });
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_TOUR);
    } catch (error) {
      console.error('[useTourStore] Failed to clear:', error);
    }
  },

  getNextCheckpoint: (): Checkpoint | null => {
    const { activeTour, activeCheckpointIndex } = get();
    if (!activeTour || activeCheckpointIndex >= activeTour.checkpoints.length) return null;
    return activeTour.checkpoints[activeCheckpointIndex];
  },

  isCheckpointReached: (checkpointId: string): boolean => {
    const { progress } = get();
    if (!progress) return false;
    return progress.checkpointsReached.some((cp) => cp.checkpointId === checkpointId);
  },
}));
