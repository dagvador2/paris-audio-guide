/**
 * Texte narratif avec revelation mot par mot synchronisee avec l'audio.
 * Inspire du pattern text-reveal de Magic UI, adapte pour React Native.
 *
 * Fonctionnement :
 *   - Les mots commencent a opacite tres faible (ghost text)
 *   - Au fur et a mesure de la lecture audio, chaque mot s'illumine
 *     avec une animation fade-in douce (easeOutCubic, ~280ms)
 *   - Si des segments SRT sont fournis, le timing est precis par segment
 *   - Sinon, les mots sont distribues lineairement sur la duree audio
 *
 * Utilise react-native-reanimated pour des animations performantes
 * sur le thread UI natif.
 */

import React, { useMemo, useEffect, memo } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { SrtSegment } from '../../types';
import { COLORS, SPACING, FONTS } from '../../utils/constants';

// ─── Constants ──────────────────────────────────────────────
const GHOST_OPACITY = 0.12;
const REVEAL_DURATION_MS = 280;
const FALLBACK_WORDS_PER_SEC = 3;

// ─── Types ──────────────────────────────────────────────────
interface WordTiming {
  word: string;
  revealMs: number;
}

interface SyncedNarrativeTextProps {
  text: string;
  srtSegments?: SrtSegment[];
  audioPositionMs: number;
  isPlaying: boolean;
  audioDurationMs?: number;
}

// ─── Word timing computation ────────────────────────────────

function computeWordTimings(
  text: string,
  srtSegments?: SrtSegment[],
  audioDurationMs?: number,
): WordTiming[] {
  // SRT-based: precise per-segment timing
  if (srtSegments && srtSegments.length > 0) {
    const timings: WordTiming[] = [];
    for (const seg of srtSegments) {
      const words = seg.text.split(/\s+/).filter(Boolean);
      const wordCount = words.length;
      const segDuration = seg.endMs - seg.startMs;
      words.forEach((word, i) => {
        timings.push({
          word,
          revealMs: seg.startMs + (i / Math.max(1, wordCount)) * segDuration,
        });
      });
    }
    return timings;
  }

  // Fallback: distribute words across audio duration, or 3 words/sec
  const words = text.split(/\s+/).filter(Boolean);

  if (audioDurationMs && audioDurationMs > 0) {
    return words.map((word, i) => ({
      word,
      revealMs: (i / Math.max(1, words.length)) * audioDurationMs,
    }));
  }

  return words.map((word, i) => ({
    word,
    revealMs: (i / FALLBACK_WORDS_PER_SEC) * 1000,
  }));
}

// ─── Animated word (Magic UI text-reveal pattern) ───────────
//
// Each word starts as ghost text (very low opacity).
// When revealed, it animates to full opacity with easeOutCubic.
// Uses Animated.Text nested inside parent Text for natural text flow.

const WordSpan = memo(function WordSpan({
  word,
  revealed,
}: {
  word: string;
  revealed: boolean;
}) {
  const opacity = useSharedValue(revealed ? 1 : GHOST_OPACITY);

  useEffect(() => {
    if (revealed) {
      opacity.value = withTiming(1, {
        duration: REVEAL_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [revealed, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.word, animatedStyle]}>
      {word}{' '}
    </Animated.Text>
  );
});

// ─── Main component ─────────────────────────────────────────

export function SyncedNarrativeText({
  text,
  srtSegments,
  audioPositionMs,
  audioDurationMs,
}: SyncedNarrativeTextProps) {
  const wordTimings = useMemo(
    () => computeWordTimings(text, srtSegments, audioDurationMs),
    [text, srtSegments, audioDurationMs],
  );

  // Binary search for revealed word count based on audio position
  const revealedCount = useMemo(() => {
    if (audioPositionMs <= 0) return 0;
    let lo = 0;
    let hi = wordTimings.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (wordTimings[mid].revealMs <= audioPositionMs) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    return lo;
  }, [wordTimings, audioPositionMs]);

  return (
    <Text style={styles.container}>
      {wordTimings.map((wt, i) => (
        <WordSpan
          key={`${i}-${wt.word}`}
          word={wt.word}
          revealed={i < revealedCount}
        />
      ))}
    </Text>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    lineHeight: 26,
  },
  word: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
  },
});
