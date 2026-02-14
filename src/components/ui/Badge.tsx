/**
 * Badge pill/chip pour tags, niveaux de difficulté, etc.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
  size?: 'sm' | 'md';
}

export function BadgeChip({ label, color = COLORS.primary, textColor = '#FFFFFF', size = 'md' }: BadgeProps) {
  const isSm = size === 'sm';
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color,
          paddingVertical: isSm ? 2 : SPACING.xs,
          paddingHorizontal: isSm ? SPACING.xs : SPACING.sm,
        },
      ]}
      accessibilityRole="text"
    >
      <Text style={[styles.label, { color: textColor, fontSize: isSm ? 11 : 13 }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontWeight: '500',
  },
});
