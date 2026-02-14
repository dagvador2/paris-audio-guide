/**
 * Indicateur de direction vers le prochain checkpoint (distance + flèche).
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatDistance } from '../../utils/formatters';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

interface DirectionIndicatorProps {
  distanceMeters: number | null;
  bearing?: number;
}

export function DirectionIndicator({ distanceMeters, bearing }: DirectionIndicatorProps) {
  const { t } = useTranslation();
  const rotation = bearing != null ? `${bearing}deg` : '0deg';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('tour.nextCheckpoint')}</Text>
      <View style={styles.row}>
        <View style={[styles.arrow, { transform: [{ rotate: rotation }] }]}>
          <Text style={styles.arrowText}>↑</Text>
        </View>
        <Text style={styles.distance}>
          {distanceMeters != null ? formatDistance(distanceMeters) : '--'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: SPACING.sm },
  label: { fontSize: 12, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  arrow: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  arrowText: { fontSize: 24, color: '#FFF', fontWeight: '700' },
  distance: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
});
