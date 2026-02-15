/**
 * Timeline verticale de progression dans une visite.
 * Affiche les checkpoints avec leur statut (atteint, actif, à venir).
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Checkpoint, TourMode } from '../../types';
import { COLORS, SPACING } from '../../utils/constants';

interface TourTimelineProps {
  checkpoints: Checkpoint[];
  reachedCheckpointIds: string[];
  activeIndex: number;
  mode?: TourMode;
}

export function TourTimeline({ checkpoints, reachedCheckpointIds, activeIndex, mode = 'escape_game' }: TourTimelineProps) {
  const { t } = useTranslation();
  const getStatus = (cp: Checkpoint, i: number) => {
    if (reachedCheckpointIds.includes(cp.id)) return 'reached';
    if (i === activeIndex) return 'active';
    return 'upcoming';
  };

  const statusColor = { reached: COLORS.checkpointReached, active: COLORS.checkpointNext, upcoming: COLORS.checkpointLocked };

  return (
    <View style={styles.container}>
      {checkpoints.map((cp, i) => {
        const status = getStatus(cp, i);
        const color = statusColor[status];
        const isLast = i === checkpoints.length - 1;

        // In escape mode, hide upcoming checkpoints
        if (mode === 'escape_game' && status === 'upcoming') {
          return null;
        }

        return (
          <View key={cp.id} style={styles.row}>
            <View style={styles.left}>
              <View style={[styles.circle, { backgroundColor: status === 'upcoming' ? 'transparent' : color, borderColor: color }, status === 'active' && styles.circleActive]}>
                {status === 'reached' ? (
                  <Text style={styles.check}>✓</Text>
                ) : mode === 'escape_game' && status === 'active' ? (
                  <Text style={[styles.index, { color: '#FFF' }]}>?</Text>
                ) : (
                  <Text style={[styles.index, status === 'upcoming' && { color }]}>{i + 1}</Text>
                )}
              </View>
              {!isLast && status !== 'upcoming' && <View style={[styles.line, { backgroundColor: color + 'AA' }]} />}
            </View>
            <View style={styles.right}>
              <Text style={[styles.title, status === 'reached' && { color: COLORS.checkpointReached }, status === 'active' && { color: COLORS.checkpointNext, fontWeight: '700' }, status === 'upcoming' && { color: COLORS.textLight }]} numberOfLines={2}>
                {mode === 'escape_game' && status === 'active'
                  ? t('tour.nextCheckpoint')
                  : cp.title}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  left: { alignItems: 'center', width: 36, marginRight: SPACING.sm },
  circle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  circleActive: { width: 32, height: 32, borderRadius: 16, borderWidth: 3 },
  check: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  index: { fontSize: 13, fontWeight: '700', color: '#FFF' },
  line: { width: 2, height: 32, marginVertical: 2 },
  right: { flex: 1, justifyContent: 'center', minHeight: 32, paddingVertical: 4 },
  title: { fontSize: 15, fontWeight: '500', color: COLORS.textPrimary },
});
