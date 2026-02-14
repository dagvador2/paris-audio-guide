/**
 * Barre de progression animée.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '../../utils/constants';

interface ProgressBarProps {
  progress: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  showLabel?: boolean;
}

export function ProgressBar({
  progress,
  color = COLORS.primary,
  backgroundColor = COLORS.border,
  height = 8,
  showLabel = false,
}: ProgressBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const clamped = Math.min(Math.max(progress, 0), 1);

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: clamped,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [clamped, animatedWidth]);

  return (
    <View style={styles.container} accessibilityRole="progressbar">
      <View style={[styles.track, { backgroundColor, height, borderRadius: height / 2 }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              height,
              borderRadius: height / 2,
              width: animatedWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={styles.label}>{Math.round(clamped * 100)}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  track: { flex: 1, overflow: 'hidden' },
  fill: { position: 'absolute', left: 0, top: 0 },
  label: { marginLeft: SPACING.sm, fontSize: 13, color: COLORS.textSecondary },
});
