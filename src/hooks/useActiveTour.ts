/**
 * Hook principal pour la logique de visite active.
 * Coordonne geofencing, audio, progression et scoring.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useTourStore } from '../stores/useTourStore';
import { useUserStore } from '../stores/useUserStore';
import { useGeofencing } from './useGeofencing';
import { useAudioPlayer } from './useAudioPlayer';
import { Checkpoint } from '../types';
import { AUDIO_AUTO_PLAY } from '../utils/constants';
import { sendCheckpointNotification } from '../services/notifications';

export function useActiveTour() {
  const tourStore = useTourStore();
  const userStore = useUserStore();
  const audioPlayer = useAudioPlayer();
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reachedIds = (tourStore.progress?.checkpointsReached ?? []).map(
    (cp) => cp.checkpointId
  );

  const handleCheckpointReached = useCallback(
    (checkpoint: Checkpoint) => {
      // Enregistrer le checkpoint atteint
      tourStore.reachCheckpoint(checkpoint.id, checkpoint.points);

      // Notification
      sendCheckpointNotification(checkpoint.title);

      // Auto-play audio si activé
      if (AUDIO_AUTO_PLAY && checkpoint.content.audioFile) {
        audioPlayer.loadAndPlay(checkpoint.content.audioFile);
      }
    },
    [tourStore, audioPlayer]
  );

  const geofencing = useGeofencing({
    checkpoints: tourStore.activeTour?.checkpoints ?? [],
    activeCheckpointIndex: tourStore.activeCheckpointIndex,
    reachedCheckpointIds: reachedIds,
    onCheckpointReached: handleCheckpointReached,
    enabled: tourStore.isNavigating,
  });

  // Timer pour mettre à jour le temps écoulé
  useEffect(() => {
    if (tourStore.isNavigating) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 60000;
        tourStore.updateElapsedTime(elapsed);
      }, 30000); // Update every 30 seconds
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [tourStore.isNavigating]);

  const completeTour = useCallback(() => {
    tourStore.completeTour();
    audioPlayer.stop();
    if (tourStore.progress) {
      userStore.addCompletedTour(tourStore.progress);
    }
  }, [tourStore, userStore, audioPlayer]);

  const abandonTour = useCallback(() => {
    tourStore.abandonTour();
    audioPlayer.stop();
  }, [tourStore, audioPlayer]);

  const nextCheckpoint = tourStore.activeTour?.checkpoints[tourStore.activeCheckpointIndex] ?? null;
  const totalCheckpoints = tourStore.activeTour?.checkpoints.length ?? 0;
  const isLastCheckpoint = tourStore.activeCheckpointIndex >= totalCheckpoints;

  return {
    tour: tourStore.activeTour,
    mode: tourStore.mode,
    progress: tourStore.progress,
    activeCheckpointIndex: tourStore.activeCheckpointIndex,
    nextCheckpoint,
    totalCheckpoints,
    isLastCheckpoint,
    isNavigating: tourStore.isNavigating,
    userLocation: geofencing.userLocation,
    distanceToNext: geofencing.distanceToNext,
    isTracking: geofencing.isTracking,
    gpsError: geofencing.error,
    audioPlayer,
    completeTour,
    abandonTour,
    solveRiddle: tourStore.solveRiddle,
    markAudioListened: tourStore.markAudioListened,
  };
}
