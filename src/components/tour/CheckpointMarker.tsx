/**
 * Marqueur de checkpoint pour la carte (react-native-maps).
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Checkpoint } from '../../types';
import { COLORS } from '../../utils/constants';

interface CheckpointMarkerProps {
  checkpoint: Checkpoint;
  status: 'locked' | 'next' | 'reached';
}

const STATUS_COLORS = {
  locked: COLORS.checkpointLocked,
  next: COLORS.checkpointNext,
  reached: COLORS.checkpointReached,
};

export function CheckpointMarker({ checkpoint, status }: CheckpointMarkerProps) {
  const color = STATUS_COLORS[status];
  return (
    <View style={styles.container}>
      <View style={[styles.circle, { backgroundColor: color }, status === 'next' && styles.circleNext]}>
        <Text style={styles.text}>{status === 'reached' ? '✓' : checkpoint.order}</Text>
      </View>
      <Text style={styles.title} numberOfLines={1}>{checkpoint.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: 80 },
  circle: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFF',
  },
  circleNext: { width: 38, height: 38, borderRadius: 19, borderWidth: 3 },
  text: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  title: { fontSize: 11, color: COLORS.textPrimary, marginTop: 2, textAlign: 'center' },
});
