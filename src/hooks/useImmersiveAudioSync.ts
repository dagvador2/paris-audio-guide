/**
 * Hook de synchronisation pour l'expérience audio immersive.
 * Gère la révélation progressive des segments, images et quiz
 * en fonction de la position audio actuelle.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ImmersiveAudioExperience,
  AudioTranscriptSegment,
  AudioContextImage,
  AudioQuiz,
} from '../types';

interface UseImmersiveAudioSyncProps {
  experience: ImmersiveAudioExperience;
  positionMillis: number;
  isPlaying: boolean;
  onQuizTriggered?: (quiz: AudioQuiz) => void;
  onSegmentRevealed?: (segment: AudioTranscriptSegment) => void;
  onImageTriggered?: (image: AudioContextImage) => void;
}

interface UseImmersiveAudioSyncReturn {
  revealedSegments: AudioTranscriptSegment[];
  activeImages: AudioContextImage[];
  activeQuiz: AudioQuiz | null;
  completedQuizIds: string[];
  revealSegmentManually: (segmentId: string) => void;
}

const SYNC_BUFFER_MS = 200; // Tolérance de synchronisation ±200ms

export function useImmersiveAudioSync({
  experience,
  positionMillis,
  isPlaying,
  onQuizTriggered,
  onSegmentRevealed,
  onImageTriggered,
}: UseImmersiveAudioSyncProps): UseImmersiveAudioSyncReturn {
  const [revealedSegmentIds, setRevealedSegmentIds] = useState<string[]>([]);
  const [displayedImageIds, setDisplayedImageIds] = useState<string[]>([]);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [completedQuizIds, setCompletedQuizIds] = useState<string[]>([]);

  // Throttling : ne re-render que toutes les 100ms
  const throttledPosition = useMemo(
    () => Math.floor(positionMillis / 100) * 100,
    [positionMillis]
  );

  // Segments révélés (ceux dont le startTime est passé)
  const revealedSegments = useMemo(() => {
    return experience.transcript.filter((seg) =>
      revealedSegmentIds.includes(seg.id)
    );
  }, [experience.transcript, revealedSegmentIds]);

  // Images actives (celles qui doivent être affichées)
  const activeImages = useMemo(() => {
    if (!experience.contextImages) return [];

    return experience.contextImages.filter((img) =>
      displayedImageIds.includes(img.id)
    );
  }, [experience.contextImages, displayedImageIds]);

  // Quiz actif
  const activeQuiz = useMemo(() => {
    if (!activeQuizId || !experience.quizzes) return null;
    return experience.quizzes.find((q) => q.id === activeQuizId) || null;
  }, [activeQuizId, experience.quizzes]);

  // Révélation manuelle d'un segment (pour scroll manuel)
  const revealSegmentManually = useCallback((segmentId: string) => {
    setRevealedSegmentIds((prev) => {
      if (prev.includes(segmentId)) return prev;
      return [...prev, segmentId];
    });
  }, []);

  // Logique principale de synchronisation
  useEffect(() => {
    const currentPos = throttledPosition;

    // 1. Révéler les segments dont le temps est passé
    const segmentsToReveal = experience.transcript.filter(
      (seg) =>
        seg.startTimeMillis <= currentPos + SYNC_BUFFER_MS &&
        !revealedSegmentIds.includes(seg.id)
    );

    if (segmentsToReveal.length > 0) {
      const newIds = segmentsToReveal.map((s) => s.id);
      setRevealedSegmentIds((prev) => [...prev, ...newIds]);

      // Callback pour chaque nouveau segment
      segmentsToReveal.forEach((seg) => {
        onSegmentRevealed?.(seg);
      });
    }

    // 2. Afficher les images dont le trigger time est passé
    if (experience.contextImages) {
      const imagesToDisplay = experience.contextImages.filter(
        (img) =>
          img.triggerTimeMillis <= currentPos + SYNC_BUFFER_MS &&
          !displayedImageIds.includes(img.id)
      );

      if (imagesToDisplay.length > 0) {
        const newImageIds = imagesToDisplay.map((i) => i.id);
        setDisplayedImageIds((prev) => [...prev, ...newImageIds]);

        // Callback pour chaque nouvelle image
        imagesToDisplay.forEach((img) => {
          onImageTriggered?.(img);
        });
      }

      // Masquer les images avec displayDuration si le temps est écoulé
      const imagesToHide = experience.contextImages.filter(
        (img) =>
          img.displayDurationMillis &&
          displayedImageIds.includes(img.id) &&
          currentPos > img.triggerTimeMillis + img.displayDurationMillis
      );

      if (imagesToHide.length > 0) {
        setDisplayedImageIds((prev) =>
          prev.filter((id) => !imagesToHide.some((img) => img.id === id))
        );
      }
    }

    // 3. Déclencher les quiz au bon moment
    if (experience.quizzes && !activeQuizId) {
      const quizToTrigger = experience.quizzes.find(
        (quiz) =>
          Math.abs(quiz.triggerTimeMillis - currentPos) < SYNC_BUFFER_MS &&
          !completedQuizIds.includes(quiz.id) &&
          quiz.triggerTimeMillis <= currentPos
      );

      if (quizToTrigger) {
        setActiveQuizId(quizToTrigger.id);
        onQuizTriggered?.(quizToTrigger);
      }
    }
  }, [
    throttledPosition,
    experience,
    revealedSegmentIds,
    displayedImageIds,
    activeQuizId,
    completedQuizIds,
    onQuizTriggered,
    onSegmentRevealed,
    onImageTriggered,
  ]);

  // Fonction publique pour marquer un quiz comme complété
  const completeQuiz = useCallback((quizId: string) => {
    setCompletedQuizIds((prev) => [...prev, quizId]);
    setActiveQuizId(null);
  }, []);

  return {
    revealedSegments,
    activeImages,
    activeQuiz,
    completedQuizIds,
    revealSegmentManually,
    // @ts-ignore - Export completeQuiz for external use
    completeQuiz,
  };
}
