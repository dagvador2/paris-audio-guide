/**
 * Image contextuelle inline dans le flux de transcription.
 * Supporte les assets locaux (require) et les URLs distantes.
 * Animation de fondu + scale à l'apparition.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Image, ImageSourcePropType } from 'react-native';
import { AudioContextImage } from '../../types';
import { SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';

const IMG_COLORS = {
  bg: 'rgba(255,255,255,0.06)',
  caption: 'rgba(255,255,255,0.60)',
  credit: 'rgba(255,255,255,0.35)',
  border: 'rgba(255,255,255,0.08)',
};

interface InlineImageProps {
  image: AudioContextImage;
}

export function InlineImage({ image }: InlineImageProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  // Handle both local require() results (number) and remote URIs (string)
  const imageSource: ImageSourcePropType =
    typeof image.uri === 'number' ? image.uri : { uri: image.uri };

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Image
        source={imageSource}
        style={styles.image}
        resizeMode="cover"
      />
      {image.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.caption}>{image.caption}</Text>
          {image.credit && (
            <Text style={styles.credit}>{image.credit}</Text>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    backgroundColor: IMG_COLORS.bg,
    borderWidth: 1,
    borderColor: IMG_COLORS.border,
  },
  image: {
    width: '100%',
    height: 200,
  },
  captionContainer: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  caption: {
    fontSize: FONTS.sizes.sm,
    color: IMG_COLORS.caption,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  credit: {
    fontSize: FONTS.sizes.xs,
    color: IMG_COLORS.credit,
    marginTop: 2,
  },
});
