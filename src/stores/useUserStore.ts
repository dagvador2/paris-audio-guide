/**
 * Store Zustand pour le profil utilisateur.
 * Gère les visites terminées, badges, stats cumulées, et persistance.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, Badge } from '../types';
import { STORAGE_KEYS } from '../utils/constants';
import badgesData from '../data/badges.json';

interface UserState {
  completedTours: UserProgress[];
  badges: Badge[];
  totalDistance: number;
  totalScore: number;
}

interface UserActions {
  addCompletedTour: (progress: UserProgress) => Promise<void>;
  unlockBadge: (badge: Badge) => Promise<void>;
  loadUserData: () => Promise<void>;
  checkBadges: (completedTours: UserProgress[], currentTour?: UserProgress) => void;
  getStats: () => { totalToursCompleted: number; totalScore: number; totalDistanceKm: number; totalBadges: number };
}

const persistUserData = async (state: UserState) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(state));
  } catch (error) {
    console.error('[useUserStore] Failed to persist:', error);
  }
};

export const useUserStore = create<UserState & UserActions>((set, get) => ({
  completedTours: [],
  badges: [],
  totalDistance: 0,
  totalScore: 0,

  addCompletedTour: async (progress: UserProgress) => {
    const state = get();
    const updatedTours = [...state.completedTours, progress];
    const updatedDistance = state.totalDistance + progress.distanceWalkedMeters;
    const updatedScore = state.totalScore + progress.totalScore;

    const newState: UserState = {
      completedTours: updatedTours,
      badges: state.badges,
      totalDistance: updatedDistance,
      totalScore: updatedScore,
    };

    set({ completedTours: updatedTours, totalDistance: updatedDistance, totalScore: updatedScore });
    await persistUserData(newState);
    get().checkBadges(updatedTours, progress);
  },

  unlockBadge: async (badge: Badge) => {
    const state = get();
    if (state.badges.some((b) => b.id === badge.id)) return;

    const badgeWithDate: Badge = { ...badge, unlockedAt: new Date().toISOString() };
    const updatedBadges = [...state.badges, badgeWithDate];
    set({ badges: updatedBadges });
    await persistUserData({ ...state, badges: updatedBadges });
  },

  loadUserData: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
      if (!raw) return;
      const saved = JSON.parse(raw) as UserState;
      set({
        completedTours: saved.completedTours ?? [],
        badges: saved.badges ?? [],
        totalDistance: saved.totalDistance ?? 0,
        totalScore: saved.totalScore ?? 0,
      });
    } catch (error) {
      console.error('[useUserStore] Failed to load:', error);
    }
  },

  checkBadges: (completedTours: UserProgress[], _currentTour?: UserProgress) => {
    const { badges, unlockBadge } = get();
    const allBadges = badgesData as Badge[];

    for (const badge of allBadges) {
      if (badges.some((b) => b.id === badge.id)) continue;

      let earned = false;
      const { condition } = badge;

      switch (condition.type) {
        case 'tour_completed':
          earned = completedTours.some(
            (t) => t.tourId === condition.tourId && t.status === 'completed'
          );
          break;
        case 'tours_count':
          earned = completedTours.filter((t) => t.status === 'completed').length >= (condition.value ?? 0);
          break;
        case 'distance_total': {
          const total = completedTours.reduce((sum, t) => sum + t.distanceWalkedMeters, 0);
          earned = total >= (condition.value ?? 0);
          break;
        }
        case 'perfect_score':
          earned = completedTours.some(
            (t) =>
              t.tourId === condition.tourId &&
              t.status === 'completed' &&
              t.riddlesCorrect === t.riddlesTotal &&
              t.riddlesTotal > 0
          );
          break;
        case 'riddles_streak':
          earned = false; // Requires tracking across tours — future enhancement
          break;
        case 'speed_run':
          earned = completedTours.some(
            (t) => t.status === 'completed' && t.elapsedTimeMinutes > 0 && t.elapsedTimeMinutes < 30
          );
          break;
      }

      if (earned) {
        unlockBadge(badge);
      }
    }
  },

  getStats: () => {
    const { completedTours, totalScore, totalDistance, badges } = get();
    return {
      totalToursCompleted: completedTours.filter((t) => t.status === 'completed').length,
      totalScore,
      totalDistanceKm: Math.round((totalDistance / 1000) * 10) / 10,
      totalBadges: badges.length,
    };
  },
}));
