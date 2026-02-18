/**
 * Barre de controle audio immersive en bas de l'ecran.
 *
 * Design moderne style podcast :
 *   - Barre de progression avec curseur rond dore et halo pulse
 *   - Bouton play/pause central proéminent
 *   - Temps ecoule (gauche) + temps restant en -MM:SS (droite)
 *   - Fond semi-transparent sombre
 */

import React, { useMemo, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
} from 'react-native';
import { SPACING } from '../../utils/constants';

// ─── Dimensions ─────────────────────────────────────────────
const TRACK_HEIGHT = 5;
const THUMB_SIZE = 14;
const THUMB_GLOW_SIZE = 24;
const PLAY_SIZE = 56;

// ─── Palette immersive ──────────────────────────────────────
const C = {
  bg: 'rgba(13,13,17,0.94)',
  trackBg: 'rgba(255,255,255,0.10)',
  trackFill: '#C4933F',
  trackFillGlow: 'rgba(196,147,63,0.35)',
  thumb: '#FFFFFF',
  thumbBorder: '#C4933F',
  thumbGlow: 'rgba(196,147,63,0.40)',
  buttonBg: '#C4933F',
  buttonIcon: '#0D0D11',
  buttonShadow: 'rgba(196,147,63,0.40)',
  currentTime: 'rgba(255,255,255,0.85)',
  remainingTime: 'rgba(255,255,255,0.40)',
};

interface AudioControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  positionMillis: number;
  durationMillis: number;
}

function formatTime(ms: number): string {
  const totalSecs = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function AudioControls({
  isPlaying,
  onPlayPause,
  positionMillis,
  durationMillis,
}: AudioControlsProps) {
  const progressPercent = useMemo(() => {
    if (durationMillis <= 0) return 0;
    return Math.min(100, (positionMillis / durationMillis) * 100);
  }, [positionMillis, durationMillis]);

  const remainingMs = Math.max(0, durationMillis - positionMillis);

  // Thumb glow pulse when playing
  const glowAnim = useRef(new Animated.Value(0)).current;
  const glowRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isPlaying) {
      glowRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      glowRef.current.start();
    } else {
      glowRef.current?.stop();
      glowAnim.setValue(0);
    }
  }, [isPlaying, glowAnim]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.7],
  });
  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  return (
    <View style={styles.container}>
      {/* ── Progress bar with thumb ────────────────────────── */}
      <View style={styles.trackWrapper}>
        {/* Background track */}
        <View style={styles.track} />

        {/* Filled portion with subtle glow */}
        <View style={[styles.fill, { width: `${progressPercent}%` }]} />

        {/* Thumb at current position */}
        <View style={[styles.thumbAnchor, { left: `${progressPercent}%` }]}>
          {/* Glow ring (pulses when playing) */}
          {isPlaying && (
            <Animated.View
              style={[
                styles.thumbGlow,
                {
                  opacity: glowOpacity,
                  transform: [{ scale: glowScale }],
                },
              ]}
            />
          )}
          {/* Solid thumb */}
          <View style={styles.thumb} />
        </View>
      </View>

      {/* ── Controls row ───────────────────────────────────── */}
      <View style={styles.row}>
        {/* Current time */}
        <Text style={styles.currentTime}>{formatTime(positionMillis)}</Text>

        {/* Play/Pause button */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={onPlayPause}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <View style={styles.pauseIcon}>
              <View style={styles.pauseBar} />
              <View style={styles.pauseBar} />
            </View>
          ) : (
            <View style={styles.playIcon} />
          )}
        </TouchableOpacity>

        {/* Remaining time */}
        <Text style={styles.remainingTime}>
          -{formatTime(remainingMs)}
        </Text>
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.bg,
    paddingBottom: 40, // safe area
    zIndex: 100,
  },

  // ── Progress track ─────────────────────────────────────────
  trackWrapper: {
    height: THUMB_GLOW_SIZE,
    justifyContent: 'center',
    position: 'relative',
    marginHorizontal: SPACING.lg,
  },

  track: {
    height: TRACK_HEIGHT,
    backgroundColor: C.trackBg,
    borderRadius: TRACK_HEIGHT / 2,
    position: 'absolute',
    left: 0,
    right: 0,
  },

  fill: {
    height: TRACK_HEIGHT,
    backgroundColor: C.trackFill,
    borderRadius: TRACK_HEIGHT / 2,
    position: 'absolute',
    left: 0,
    // Subtle side glow
    shadowColor: C.trackFillGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },

  // Thumb anchor: zero-width container centered on progress point
  thumbAnchor: {
    position: 'absolute',
    width: 0,
    height: THUMB_GLOW_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  thumbGlow: {
    position: 'absolute',
    width: THUMB_GLOW_SIZE,
    height: THUMB_GLOW_SIZE,
    borderRadius: THUMB_GLOW_SIZE / 2,
    backgroundColor: C.thumbGlow,
  },

  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: C.thumb,
    borderWidth: 2.5,
    borderColor: C.thumbBorder,
    shadowColor: C.thumbBorder,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },

  // ── Controls row ───────────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.xl,
  },

  currentTime: {
    fontSize: 16,
    fontWeight: '600',
    color: C.currentTime,
    fontVariant: ['tabular-nums'],
    width: 52,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  remainingTime: {
    fontSize: 14,
    fontWeight: '500',
    color: C.remainingTime,
    fontVariant: ['tabular-nums'],
    width: 52,
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  // ── Play button ────────────────────────────────────────────
  playButton: {
    width: PLAY_SIZE,
    height: PLAY_SIZE,
    borderRadius: PLAY_SIZE / 2,
    backgroundColor: C.buttonBg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.buttonShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },

  playIcon: {
    width: 0,
    height: 0,
    marginLeft: 4,
    borderLeftWidth: 18,
    borderTopWidth: 11,
    borderBottomWidth: 11,
    borderLeftColor: C.buttonIcon,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },

  pauseIcon: {
    flexDirection: 'row',
    gap: 5,
  },

  pauseBar: {
    width: 5,
    height: 20,
    borderRadius: 2,
    backgroundColor: C.buttonIcon,
  },
});
