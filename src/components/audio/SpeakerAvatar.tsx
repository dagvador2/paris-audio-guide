/**
 * Avatar du locuteur dans les bulles de transcription
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../utils/constants';

export type SpeakerStyle = 'narrator' | 'character' | 'thought';

interface SpeakerAvatarProps {
  style: SpeakerStyle;
}

export function SpeakerAvatar({ style }: SpeakerAvatarProps) {
  const getAvatarConfig = () => {
    switch (style) {
      case 'narrator':
        return {
          icon: '🎙️',
          backgroundColor: COLORS.primary,
          label: 'Narrateur',
        };
      case 'character':
        return {
          icon: '👤',
          backgroundColor: '#8B4513',
          label: 'Personnage',
        };
      case 'thought':
        return {
          icon: '💭',
          backgroundColor: '#9370DB',
          label: 'Pensée',
        };
    }
  };

  const config = getAvatarConfig();

  return (
    <View style={[styles.container, { backgroundColor: config.backgroundColor }]}>
      <Text style={styles.icon}>{config.icon}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  icon: {
    fontSize: 20,
  },
});
