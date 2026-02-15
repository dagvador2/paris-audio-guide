/**
 * Composant principal de l'expérience audio immersive.
 * Orchestre la synchronisation audio, la transcription défilante,
 * les images contextuelles et les quiz interactifs.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { ImmersiveAudioExperience as ImmersiveAudioExperienceType } from '../../types';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { useAudioStore } from '../../stores/useAudioStore';
import { useImmersiveAudioSync } from '../../hooks/useImmersiveAudioSync';
import { AudioTranscript } from './AudioTranscript';
import { AudioQuizOverlay } from './AudioQuizOverlay';
import { AudioControls } from './AudioControls';
import { COLORS } from '../../utils/constants';

interface ImmersiveAudioExperienceProps {
  experience: ImmersiveAudioExperienceType;
  autoPlay?: boolean;
  onComplete?: () => void;
  onQuizAnswered?: (quizId: string, correct: boolean, responseTimeMs: number) => void;
}

export function ImmersiveAudioExperience({
  experience,
  autoPlay = false,
  onComplete,
  onQuizAnswered,
}: ImmersiveAudioExperienceProps) {
  const audioPlayer = useAudioPlayer();
  const audioStore = useAudioStore();
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Synchronisation audio ↔ UI
  const syncHook = useImmersiveAudioSync({
    experience,
    positionMillis: audioStore.positionMillis,
    isPlaying: audioStore.isPlaying,
    onQuizTriggered: (quiz) => {
      setActiveQuiz(quiz);
      if (quiz.pauseAudio) {
        audioPlayer.pause();
      }
    },
    onSegmentRevealed: (segment) => {
      // Callback optionnel si besoin
    },
    onImageTriggered: (image) => {
      // Callback optionnel si besoin
    },
  });

  // Auto-play au montage
  useEffect(() => {
    if (autoPlay && !hasStarted) {
      setHasStarted(true);
      audioPlayer.loadAndPlay(experience.audioFile);
    }
  }, [autoPlay, hasStarted, experience.audioFile, audioPlayer]);

  // Détecter fin de l'audio
  useEffect(() => {
    const isComplete =
      audioStore.isLoaded &&
      !audioStore.isPlaying &&
      audioStore.positionMillis > 0 &&
      audioStore.durationMillis > 0 &&
      audioStore.positionMillis >= audioStore.durationMillis - 500;

    if (isComplete && onComplete) {
      onComplete();
    }
  }, [
    audioStore.isLoaded,
    audioStore.isPlaying,
    audioStore.positionMillis,
    audioStore.durationMillis,
    onComplete,
  ]);

  // Gérer la réponse au quiz
  const handleQuizAnswer = useCallback(
    (correct: boolean, responseTimeMs: number) => {
      if (!activeQuiz) return;

      // Callback externe
      onQuizAnswered?.(activeQuiz.id, correct, responseTimeMs);

      // Marquer comme complété dans le hook sync
      // @ts-ignore - completeQuiz est exporté par le hook
      syncHook.completeQuiz?.(activeQuiz.id);

      // Fermer le quiz
      setActiveQuiz(null);

      // Reprendre l'audio si configuré
      if (activeQuiz.resumeAfterAnswer) {
        audioPlayer.play();
      }
    },
    [activeQuiz, onQuizAnswered, syncHook, audioPlayer]
  );

  // Contrôle play/pause
  const handlePlayPause = useCallback(() => {
    if (!hasStarted) {
      setHasStarted(true);
      audioPlayer.loadAndPlay(experience.audioFile);
    } else if (audioStore.isPlaying) {
      audioPlayer.pause();
    } else {
      audioPlayer.play();
    }
  }, [
    hasStarted,
    audioStore.isPlaying,
    audioPlayer,
    experience.audioFile,
  ]);

  return (
    <View style={styles.container}>
      {/* Transcription scrollable */}
      <AudioTranscript
        segments={syncHook.revealedSegments}
        activeImages={syncHook.activeImages}
        autoScrollEnabled={experience.autoScrollEnabled}
        scrollLockFuture={experience.scrollLockFuture}
      />

      {/* Quiz overlay */}
      {activeQuiz && (
        <AudioQuizOverlay quiz={activeQuiz} onAnswer={handleQuizAnswer} />
      )}

      {/* Contrôle audio unique */}
      <AudioControls
        isPlaying={audioStore.isPlaying}
        onPlayPause={handlePlayPause}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    position: 'relative',
  },
});
