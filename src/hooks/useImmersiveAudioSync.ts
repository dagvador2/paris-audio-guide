/**
 * Hook de synchronisation pour l'expérience audio immersive.
 * Gère la révélation progressive des segments, images et quiz
 * en fonction de la position audio actuelle.
 *
 * Quiz timing aligné sur les bornes SRT :
 *   - Chaque quiz.triggerTimeMillis correspond au endTimeMillis du segment
 *     « question » (la frontière exacte issue du SRT Whisper).
 *   - Les segments « réponse » (dont le startTimeMillis = quiz.triggerTimeMillis)
 *     sont bloqués tant que le quiz n'est pas complété, empêchant le SYNC_BUFFER
 *     de révéler la réponse avant que le quiz ne s'affiche.
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
  completeQuiz: (quizId: string) => void;
  revealSegmentManually: (segmentId: string) => void;
}

// Segments are revealed slightly ahead for smooth appearance
const SYNC_BUFFER_MS = 200;

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

  // ── Quiz boundary map ────────────────────────────────────────
  // Maps quiz.triggerTimeMillis → quiz.id for pending quizzes.
  // Segments whose startTimeMillis matches a pending quiz boundary
  // are held back until the quiz is answered.
  const pendingQuizBoundaries = useMemo(() => {
    if (!experience.quizzes) return new Map<number, string>();
    const map = new Map<number, string>();
    experience.quizzes.forEach((quiz) => {
      if (!completedQuizIds.includes(quiz.id)) {
        map.set(quiz.triggerTimeMillis, quiz.id);
      }
    });
    return map;
  }, [experience.quizzes, completedQuizIds]);

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

    // 1. Révéler les segments dont le temps est passé.
    //    Les segments « réponse » (startTime = quiz boundary) sont bloqués
    //    tant que le quiz correspondant n'est pas complété.
    const segmentsToReveal = experience.transcript.filter(
      (seg) =>
        seg.startTimeMillis <= currentPos + SYNC_BUFFER_MS &&
        !revealedSegmentIds.includes(seg.id) &&
        !pendingQuizBoundaries.has(seg.startTimeMillis)
    );

    if (segmentsToReveal.length > 0) {
      const newIds = segmentsToReveal.map((s) => s.id);
      setRevealedSegmentIds((prev) => [...prev, ...newIds]);

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

    // 3. Déclencher les quiz exactement sur la borne SRT.
    //    Le triggerTimeMillis correspond au endTimeMillis du segment « question »
    //    dans le transcript (frontière Whisper). Pas de SYNC_BUFFER ici pour
    //    ne pas déclencher le quiz avant que la question ne soit finie.
    if (experience.quizzes && !activeQuizId) {
      const quizToTrigger = experience.quizzes.find(
        (quiz) =>
          quiz.triggerTimeMillis <= currentPos &&
          !completedQuizIds.includes(quiz.id)
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
    pendingQuizBoundaries,
    onQuizTriggered,
    onSegmentRevealed,
    onImageTriggered,
  ]);

  // Marquer un quiz comme complété — cela débloque le segment réponse
  const completeQuiz = useCallback((quizId: string) => {
    setCompletedQuizIds((prev) => [...prev, quizId]);
    setActiveQuizId(null);
  }, []);

  return {
    revealedSegments,
    activeImages,
    activeQuiz,
    completedQuizIds,
    completeQuiz,
    revealSegmentManually,
  };
}
