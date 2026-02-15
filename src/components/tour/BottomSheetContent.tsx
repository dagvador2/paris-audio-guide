/**
 * Contenu du bottom sheet en positions MEDIUM et FULL.
 * Affiche l'audio player, la direction, et la timeline selon la position.
 */

import React from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Checkpoint, TourMode } from '../../types';
import { AudioPlayer } from './AudioPlayer';
import { DirectionIndicator } from './DirectionIndicator';
import { TourTimeline } from './TourTimeline';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { COLORS, SPACING, FONTS } from '../../utils/constants';

interface BottomSheetContentProps {
  position: 'medium' | 'full';
  checkpoints: Checkpoint[];
  reachedCheckpointIds: string[];
  activeCheckpointIndex: number;
  nextCheckpoint: Checkpoint | null;
  distanceToNext: number | null;
  currentCheckpointNumber: number;
  totalCheckpoints: number;
  mode: TourMode;
  onAbandonTour: () => void;
  // Audio props (optional - will show if provided)
  currentAudioFile?: string;
  currentAudioDuration?: number;
  onAudioComplete?: () => void;
}

export function BottomSheetContent({
  position,
  checkpoints,
  reachedCheckpointIds,
  activeCheckpointIndex,
  nextCheckpoint,
  distanceToNext,
  currentCheckpointNumber,
  totalCheckpoints,
  mode,
  onAbandonTour,
  currentAudioFile,
  currentAudioDuration,
  onAudioComplete,
}: BottomSheetContentProps) {
  const { t } = useTranslation();
  const progressValue = totalCheckpoints > 0 ? currentCheckpointNumber / totalCheckpoints : 0;

  // For MEDIUM position, show only a few checkpoints around the active one
  const visibleCheckpoints = position === 'medium'
    ? checkpoints.slice(Math.max(0, activeCheckpointIndex - 1), Math.min(checkpoints.length, activeCheckpointIndex + 3))
    : checkpoints;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Progress indicator (FULL only) */}
      {position === 'full' && (
        <View style={styles.progressContainer}>
          <ProgressBar progress={progressValue} showLabel />
          <Text style={styles.progressText}>
            {t('tour.checkpoint')} {currentCheckpointNumber} {t('tour.of')} {totalCheckpoints}
          </Text>
        </View>
      )}

      {/* Audio Player (if available) */}
      {currentAudioFile && currentAudioDuration && (
        <View style={styles.section}>
          <AudioPlayer
            audioFile={currentAudioFile}
            audioDuration={currentAudioDuration}
            onComplete={onAudioComplete}
            autoPlay={false}
          />
        </View>
      )}

      {/* Direction to next checkpoint */}
      {nextCheckpoint && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {mode === 'guided' ? nextCheckpoint.title : t('tour.nextCheckpoint')}
          </Text>
          <DirectionIndicator distanceMeters={distanceToNext} />
        </View>
      )}

      {/* Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('tour.progress')}</Text>
        <TourTimeline
          checkpoints={visibleCheckpoints}
          reachedCheckpointIds={reachedCheckpointIds}
          activeIndex={activeCheckpointIndex}
          mode={mode}
        />
        {position === 'medium' && checkpoints.length > visibleCheckpoints.length && (
          <Text style={styles.moreHint}>
            {t('tour.swipeUpForMore')}
          </Text>
        )}
      </View>

      {/* Abandon button (FULL only) */}
      {position === 'full' && (
        <View style={styles.abandonSection}>
          <Button
            title={t('tour.abandonTour')}
            onPress={onAbandonTour}
            variant="outline"
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  progressContainer: {
    marginBottom: SPACING.lg,
  },
  progressText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  moreHint: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  abandonSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
});
