/**
 * Barre de contrôle audio immersive en bas de l'écran.
 *
 * Comprend :
 *   - Barre de progression fine
 *   - Bouton play/pause central
 *   - Temps écoulé / durée totale
 *   - Fond semi-transparent
 */

import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SPACING, FONTS } from '../../utils/constants';

const CONTROLS = {
  bg: 'rgba(13,13,17,0.92)',
  progressBg: 'rgba(255,255,255,0.12)',
  progressFill: '#C4933F',
  buttonBg: '#C4933F',
  buttonIcon: '#0D0D11',
  timeText: 'rgba(255,255,255,0.50)',
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

  return (
    <View style={styles.container}>
      {/* ── Progress bar ──────────────────────────────────── */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      {/* ── Controls row ──────────────────────────────────── */}
      <View style={styles.row}>
        <Text style={styles.time}>{formatTime(positionMillis)}</Text>

        <TouchableOpacity
          style={styles.playButton}
          onPress={onPlayPause}
          activeOpacity={0.8}
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

        <Text style={styles.time}>{formatTime(durationMillis)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: CONTROLS.bg,
    paddingBottom: 40, // safe area
    zIndex: 100,
  },
  // ── Progress ────────────────────────────────────────────
  progressBar: {
    height: 3,
    backgroundColor: CONTROLS.progressBg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: CONTROLS.progressFill,
  },
  // ── Controls row ────────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.xl,
  },
  time: {
    fontSize: FONTS.sizes.sm,
    color: CONTROLS.timeText,
    fontVariant: ['tabular-nums'],
    width: 45,
    textAlign: 'center',
  },
  // ── Play button ─────────────────────────────────────────
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: CONTROLS.buttonBg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C4933F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
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
    borderLeftColor: CONTROLS.buttonIcon,
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
    backgroundColor: CONTROLS.buttonIcon,
  },
});
