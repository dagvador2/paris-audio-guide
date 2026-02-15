/**
 * Barre "peek" du bottom sheet visible en position MINI.
 * Affiche la progression et la distance vers le prochain checkpoint.
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatDistance } from '../../utils/formatters';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import { TourMode } from '../../types';

interface BottomSheetPeekBarProps {
  currentCheckpointNumber: number;
  totalCheckpoints: number;
  distanceMeters: number | null;
  nextCheckpointTitle?: string;
  mode: TourMode;
  gpsError: string | null;
  onTap?: () => void;
}

export function BottomSheetPeekBar({
  currentCheckpointNumber,
  totalCheckpoints,
  distanceMeters,
  nextCheckpointTitle,
  mode,
  gpsError,
  onTap,
}: BottomSheetPeekBarProps) {
  const { t } = useTranslation();

  const displayTitle = mode === 'guided' && nextCheckpointTitle
    ? nextCheckpointTitle
    : t('tour.nextCheckpoint');

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onTap}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={t('tour.expandBottomSheet')}
    >
      {/* Handle indicator */}
      <View style={styles.handle} />

      {/* GPS Error */}
      {gpsError && (
        <Text style={styles.errorText} numberOfLines={1}>
          ⚠️ {gpsError}
        </Text>
      )}

      {/* Main content */}
      <View style={styles.content}>
        {/* Left: Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>
            {t('tour.step')} {currentCheckpointNumber}/{totalCheckpoints}
          </Text>
          <View style={styles.miniProgressBar}>
            <View
              style={[
                styles.miniProgressFill,
                {
                  width: `${Math.round((currentCheckpointNumber / totalCheckpoints) * 100)}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Right: Distance & Direction */}
        <View style={styles.distanceSection}>
          <Text style={styles.distanceLabel} numberOfLines={1}>
            {displayTitle}
          </Text>
          <View style={styles.distanceRow}>
            <Text style={styles.arrowIcon}>→</Text>
            <Text style={styles.distanceText}>
              {distanceMeters != null ? formatDistance(distanceMeters) : '--'}
            </Text>
          </View>
        </View>
      </View>

      {/* Subtle hint to swipe up */}
      <Text style={styles.swipeHint}>⌄</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  progressSection: {
    flex: 1,
  },
  progressLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  miniProgressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  distanceSection: {
    alignItems: 'flex-end',
  },
  distanceLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  arrowIcon: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
  },
  distanceText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  swipeHint: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});
