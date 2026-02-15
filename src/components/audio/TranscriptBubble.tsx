/**
 * Bulle de transcription audio avec animation d'apparition.
 * Style conversation (WhatsApp-like) avec différents styles selon le speaker.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { AudioTranscriptSegment } from '../../types';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../utils/constants';

interface TranscriptBubbleProps {
  segment: AudioTranscriptSegment;
  index: number;
}

export function TranscriptBubble({ segment, index }: TranscriptBubbleProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Animation d'apparition : fade-in + slide up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const bubbleStyle = getBubbleStyle(segment.speakerStyle);

  return (
    <Animated.View
      style={[
        styles.container,
        bubbleStyle.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.bubble, bubbleStyle.bubble]}>
        <Text style={[styles.text, bubbleStyle.text]}>{segment.text}</Text>
      </View>
    </Animated.View>
  );
}

function getBubbleStyle(speakerStyle?: string) {
  switch (speakerStyle) {
    case 'narrator':
      return {
        container: { alignItems: 'flex-start' as const },
        bubble: {
          backgroundColor: '#E8F4F8',
          borderBottomLeftRadius: 4,
        },
        text: { color: COLORS.textPrimary },
      };
    case 'character':
      return {
        container: { alignItems: 'flex-end' as const },
        bubble: {
          backgroundColor: '#FFF3E0',
          borderBottomRightRadius: 4,
        },
        text: { color: COLORS.textPrimary },
      };
    case 'thought':
      return {
        container: { alignItems: 'center' as const },
        bubble: {
          backgroundColor: '#F3E5F5',
        },
        text: {
          color: COLORS.textPrimary,
          fontStyle: 'italic' as const,
        },
      };
    default:
      return {
        container: { alignItems: 'flex-start' as const },
        bubble: {
          backgroundColor: '#F5F5F5',
        },
        text: { color: COLORS.textPrimary },
      };
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: SPACING.xs,
  },
  bubble: {
    maxWidth: '80%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  text: {
    fontSize: FONTS.sizes.md,
    lineHeight: 22,
  },
});
