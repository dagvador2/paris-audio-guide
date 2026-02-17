/**
 * Hook pour contrôler le lecteur audio.
 * Gère le chargement, la lecture, la pause et la progression.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useAudioStore } from '../stores/useAudioStore';
import * as AudioService from '../services/audio';

export function useAudioPlayer() {
  const store = useAudioStore();
  const soundRef = useRef<any>(null);

  useEffect(() => {
    AudioService.configureAudioSession();
  }, []);

  const loadAndPlay = useCallback(
    async (filePath: string | number) => {
      // Stopper l'audio en cours si nécessaire
      if (soundRef.current) {
        await AudioService.stopAudio(soundRef.current);
      }

      store.reset();
      store.setCurrentFile(filePath);

      try {
        const sound = await AudioService.loadAudio(filePath);
        soundRef.current = sound;

        AudioService.setOnPlaybackStatusUpdate(sound, (status) => {
          if (!status.isLoaded) return;
          store.setLoaded(true);
          store.updatePosition(status.positionMillis);
          store.setDuration(status.durationMillis ?? 0);
          store.setPlaying(status.isPlaying);

          if (status.didJustFinish) {
            store.setPlaying(false);
          }
        });

        await AudioService.playAudio(sound);
        store.setPlaying(true);
        store.setLoaded(true);
      } catch (err) {
        console.error('Audio load error:', err);
        store.reset();
      }
    },
    [store]
  );

  const play = useCallback(async () => {
    if (soundRef.current) {
      await AudioService.playAudio(soundRef.current);
      store.setPlaying(true);
    }
  }, [store]);

  const pause = useCallback(async () => {
    if (soundRef.current) {
      await AudioService.pauseAudio(soundRef.current);
      store.setPlaying(false);
    }
  }, [store]);

  const seekTo = useCallback(async (positionMillis: number) => {
    if (soundRef.current) {
      await AudioService.seekTo(soundRef.current, positionMillis);
    }
  }, []);

  const stop = useCallback(async () => {
    if (soundRef.current) {
      await AudioService.stopAudio(soundRef.current);
      soundRef.current = null;
    }
    store.reset();
  }, [store]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        AudioService.stopAudio(soundRef.current);
      }
    };
  }, []);

  return {
    isPlaying: store.isPlaying,
    isLoaded: store.isLoaded,
    currentFile: store.currentFile,
    positionMillis: store.positionMillis,
    durationMillis: store.durationMillis,
    loadAndPlay,
    play,
    pause,
    seekTo,
    stop,
  };
}
