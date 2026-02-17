/**
 * Store Zustand pour l'état du lecteur audio.
 * Gère l'état de lecture (play/pause, position, durée) de manière réactive.
 */

import { create } from 'zustand';

interface AudioStoreState {
  isPlaying: boolean;
  isLoaded: boolean;
  currentFile: string | number | null;
  positionMillis: number;
  durationMillis: number;
}

interface AudioStoreActions {
  setPlaying: (playing: boolean) => void;
  setLoaded: (loaded: boolean) => void;
  setCurrentFile: (file: string | number | null) => void;
  updatePosition: (millis: number) => void;
  setDuration: (millis: number) => void;
  reset: () => void;
}

const INITIAL_STATE: AudioStoreState = {
  isPlaying: false,
  isLoaded: false,
  currentFile: null,
  positionMillis: 0,
  durationMillis: 0,
};

export const useAudioStore = create<AudioStoreState & AudioStoreActions>(
  (set) => ({
    ...INITIAL_STATE,

    setPlaying: (playing: boolean) => set({ isPlaying: playing }),
    setLoaded: (loaded: boolean) => set({ isLoaded: loaded }),
    setCurrentFile: (file: string | number | null) => set({ currentFile: file }),
    updatePosition: (millis: number) => set({ positionMillis: millis }),
    setDuration: (millis: number) => set({ durationMillis: millis }),
    reset: () => set({ ...INITIAL_STATE }),
  })
);
