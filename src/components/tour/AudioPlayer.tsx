/**
 * Lecteur audio avec contrôles play/pause, barre de progression et temps.
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { formatAudioTime } from '../../utils/formatters';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

interface AudioPlayerProps {
  audioFile: string;
  audioDuration: number;
  onComplete?: () => void;
  autoPlay?: boolean;
}

export function AudioPlayer({ audioFile, audioDuration, onComplete, autoPlay = false }: AudioPlayerProps) {
  const { t } = useTranslation();
  const { isPlaying, isLoaded, positionMillis, durationMillis, loadAndPlay, play, pause, stop } = useAudioPlayer();

  useEffect(() => {
    if (autoPlay) {
      loadAndPlay(audioFile);
    }
    return () => { stop(); };
  }, [audioFile]);

  const totalSeconds = durationMillis > 0 ? durationMillis / 1000 : audioDuration;
  const currentSeconds = positionMillis / 1000;
  const progress = totalSeconds > 0 ? currentSeconds / totalSeconds : 0;

  // Detect completion
  useEffect(() => {
    if (isLoaded && !isPlaying && positionMillis > 0 && durationMillis > 0 && positionMillis >= durationMillis - 500) {
      onComplete?.();
    }
  }, [isPlaying, positionMillis, durationMillis]);

  const handlePlayPause = () => {
    if (!isLoaded) {
      loadAndPlay(audioFile);
    } else if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  return (
    <View style={styles.container} accessibilityLabel={t('audio.play')}>
      {/* Play/Pause Button */}
      <TouchableOpacity style={styles.playButton} onPress={handlePlayPause} accessibilityRole="button" accessibilityLabel={isPlaying ? t('audio.pause') : t('audio.play')}>
        {!isLoaded && positionMillis === 0 ? (
          <Text style={styles.playIcon}>▶</Text>
        ) : isPlaying ? (
          <Text style={styles.playIcon}>⏸</Text>
        ) : (
          <Text style={styles.playIcon}>▶</Text>
        )}
      </TouchableOpacity>

      {/* Progress and time */}
      <View style={styles.progressSection}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatAudioTime(currentSeconds)}</Text>
          <Text style={styles.timeText}>{formatAudioTime(totalSeconds)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  playIcon: { fontSize: 22, color: '#FFF' },
  progressSection: { flex: 1 },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeText: { fontSize: 12, color: COLORS.textSecondary },
});
