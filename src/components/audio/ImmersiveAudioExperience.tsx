/**
 * Composant principal de l'expérience audio immersive.
 * Orchestre la synchronisation audio, la transcription défilante,
 * les images contextuelles, les quiz interactifs et la bannière de section.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ImmersiveAudioExperience as ImmersiveAudioExperienceType } from '../../types';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { useAudioStore } from '../../stores/useAudioStore';
import { useImmersiveAudioSync } from '../../hooks/useImmersiveAudioSync';
import { AudioTranscript } from './AudioTranscript';
import { AudioQuizOverlay } from './AudioQuizOverlay';
import { AudioControls } from './AudioControls';
import { SectionBanner } from './SectionBanner';

const BG = '#0D0D11';

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

  // ── Section tracking ──────────────────────────────────────
  // Extract all sections from transcript segments that have sectionTitle
  const sections = useMemo(() => {
    return experience.transcript
      .filter((seg) => seg.sectionTitle)
      .map((seg) => ({
        title: seg.sectionTitle!,
        subtitle: seg.sectionSubtitle,
        startTimeMillis: seg.startTimeMillis,
      }));
  }, [experience.transcript]);

  // Compute current section based on audio position
  const currentSection = useMemo(() => {
    let sectionIndex = -1;
    for (let i = sections.length - 1; i >= 0; i--) {
      if (audioStore.positionMillis >= sections[i].startTimeMillis) {
        sectionIndex = i;
        break;
      }
    }
    if (sectionIndex < 0) return null;
    return {
      title: sections[sectionIndex].title,
      subtitle: sections[sectionIndex].subtitle,
      index: sectionIndex,
    };
  }, [sections, audioStore.positionMillis]);

  // Synchronisation audio <-> UI
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
    onSegmentRevealed: () => {},
    onImageTriggered: () => {},
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

      onQuizAnswered?.(activeQuiz.id, correct, responseTimeMs);

      // Compléter le quiz → débloque le segment « réponse » dans le transcript
      syncHook.completeQuiz(activeQuiz.id);

      setActiveQuiz(null);

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
  }, [hasStarted, audioStore.isPlaying, audioPlayer, experience.audioFile]);

  return (
    <View style={styles.container}>
      {/* Bannière de section persistante en haut */}
      <SectionBanner
        sectionTitle={currentSection?.title ?? null}
        sectionSubtitle={currentSection?.subtitle ?? null}
        sectionIndex={currentSection?.index ?? 0}
        totalSections={sections.length}
      />

      {/* Transcription scrollable avec highlighting */}
      <AudioTranscript
        segments={syncHook.revealedSegments}
        activeImages={syncHook.activeImages}
        autoScrollEnabled={experience.autoScrollEnabled}
        scrollLockFuture={experience.scrollLockFuture}
        positionMillis={audioStore.positionMillis}
      />

      {/* Quiz overlay */}
      {activeQuiz && (
        <AudioQuizOverlay quiz={activeQuiz} onAnswer={handleQuizAnswer} />
      )}

      {/* Contrôle audio avec progression */}
      <AudioControls
        isPlaying={audioStore.isPlaying}
        onPlayPause={handlePlayPause}
        positionMillis={audioStore.positionMillis}
        durationMillis={audioStore.durationMillis}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    position: 'relative',
  },
});
