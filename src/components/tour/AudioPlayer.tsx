/**
 * Lecteur audio style podcast moderne.
 * Barre de progression avec curseur rond, temps ecoulé et temps restant.
 * Bouton play/pause proéminent avec animation de pulsation douce.
 */

import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { formatAudioTime } from '../../utils/formatters';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

// ─── Dimensions ─────────────────────────────────────────────
const THUMB_SIZE = 14;
const THUMB_GLOW_SIZE = 22;
const TRACK_HEIGHT = 5;
const PLAY_SIZE = 56;

// ─── Palette ────────────────────────────────────────────────
const PLAYER = {
  trackBg: '#E8E4DF',
  fill: COLORS.secondary,
  fillGlow: 'rgba(196,147,63,0.25)',
  thumb: '#FFFFFF',
  thumbBorder: COLORS.secondary,
  thumbGlow: 'rgba(196,147,63,0.30)',
  currentTime: COLORS.textPrimary,
  remainingTime: COLORS.textLight,
  playBg: COLORS.primary,
  playBgActive: COLORS.primaryDark,
  playShadow: 'rgba(45,90,39,0.30)',
  cardBg: '#FFFFFF',
  cardShadow: 'rgba(0,0,0,0.08)',
};

interface AudioPlayerProps {
  audioFile: string;
  audioDuration: number;
  onComplete?: () => void;
  autoPlay?: boolean;
}

export function AudioPlayer({
  audioFile,
  audioDuration,
  onComplete,
  autoPlay = false,
}: AudioPlayerProps) {
  const { t } = useTranslation();
  const {
    isPlaying,
    isLoaded,
    positionMillis,
    durationMillis,
    loadAndPlay,
    play,
    pause,
    stop,
  } = useAudioPlayer();

  // Gentle thumb glow pulse when playing
  const glowAnim = useRef(new Animated.Value(0)).current;
  const glowLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (autoPlay) {
      loadAndPlay(audioFile);
    }
    return () => {
      stop();
    };
  }, [audioFile]);

  useEffect(() => {
    if (isPlaying) {
      glowLoop.current = Animated.loop(
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
      glowLoop.current.start();
    } else {
      glowLoop.current?.stop();
      glowAnim.setValue(0);
    }
  }, [isPlaying, glowAnim]);

  const totalSeconds =
    durationMillis > 0 ? durationMillis / 1000 : audioDuration;
  const currentSeconds = positionMillis / 1000;
  const remainingSeconds = Math.max(0, totalSeconds - currentSeconds);
  const progress = totalSeconds > 0 ? currentSeconds / totalSeconds : 0;
  const progressPct = Math.min(progress * 100, 100);

  // Detect completion
  useEffect(() => {
    if (
      isLoaded &&
      !isPlaying &&
      positionMillis > 0 &&
      durationMillis > 0 &&
      positionMillis >= durationMillis - 500
    ) {
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

  // Animated glow opacity for the thumb halo
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });
  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.4],
  });

  return (
    <View style={styles.container}>
      {/* Play/Pause Button */}
      <TouchableOpacity
        style={styles.playButton}
        onPress={handlePlayPause}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? t('audio.pause') : t('audio.play')}
        activeOpacity={0.75}
      >
        <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
      </TouchableOpacity>

      {/* Progress section */}
      <View style={styles.progressSection}>
        {/* Track + thumb */}
        <View style={styles.trackWrapper}>
          {/* Background track */}
          <View style={styles.track} />

          {/* Filled portion */}
          <View
            style={[styles.fill, { width: `${progressPct}%` }]}
          />

          {/* Thumb at current position */}
          <View
            style={[
              styles.thumbAnchor,
              { left: `${progressPct}%` },
            ]}
          >
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

        {/* Time row */}
        <View style={styles.timeRow}>
          <Text style={styles.currentTime}>
            {formatAudioTime(currentSeconds)}
          </Text>
          <Text style={styles.remainingTime}>
            -{formatAudioTime(remainingSeconds)}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PLAYER.cardBg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    paddingVertical: SPACING.md + 2,
    shadowColor: PLAYER.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },

  // ── Play button ────────────────────────────────────────────
  playButton: {
    width: PLAY_SIZE,
    height: PLAY_SIZE,
    borderRadius: PLAY_SIZE / 2,
    backgroundColor: PLAYER.playBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    shadowColor: PLAYER.playShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  playIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    marginLeft: 2, // optical centering for play triangle
  },

  // ── Progress section ───────────────────────────────────────
  progressSection: {
    flex: 1,
  },

  trackWrapper: {
    height: THUMB_GLOW_SIZE,
    justifyContent: 'center',
    position: 'relative',
  },

  track: {
    height: TRACK_HEIGHT,
    backgroundColor: PLAYER.trackBg,
    borderRadius: TRACK_HEIGHT / 2,
    position: 'absolute',
    left: 0,
    right: 0,
  },

  fill: {
    height: TRACK_HEIGHT,
    backgroundColor: PLAYER.fill,
    borderRadius: TRACK_HEIGHT / 2,
    position: 'absolute',
    left: 0,
  },

  // Thumb anchor: centered on the progress point
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
    backgroundColor: PLAYER.thumbGlow,
  },

  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: PLAYER.thumb,
    borderWidth: 2.5,
    borderColor: PLAYER.thumbBorder,
    shadowColor: PLAYER.thumbBorder,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },

  // ── Time row ───────────────────────────────────────────────
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 2,
  },

  currentTime: {
    fontSize: 15,
    fontWeight: '600',
    color: PLAYER.currentTime,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },

  remainingTime: {
    fontSize: 13,
    fontWeight: '500',
    color: PLAYER.remainingTime,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.3,
  },
});
