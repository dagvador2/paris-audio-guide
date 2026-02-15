/**
 * Image inline qui apparaît dans le flux de transcription.
 * Affiche l'image avec sa caption et son crédit.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Image } from 'react-native';
import { AudioContextImage } from '../../types';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../utils/constants';

interface InlineImageProps {
  image: AudioContextImage;
}

export function InlineImage({ image }: InlineImageProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation fade-in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image
        source={{ uri: image.uri }}
        style={styles.image}
        resizeMode="cover"
      />
      {image.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.caption}>{image.caption}</Text>
          {image.credit && (
            <Text style={styles.credit}>© {image.credit}</Text>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
  },
  captionContainer: {
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  caption: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  credit: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});
