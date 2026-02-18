/**
 * Image contextuelle inline dans le flux de transcription.
 * Supporte les assets locaux (require) et les URLs distantes.
 *
 * Améliorations UI :
 *   - Animation Ken Burns (zoom lent continu) pour un effet cinématique
 *   - Gradient overlay sur le bas pour lisibilité de la caption
 *   - Caption slide-in avec délai après apparition de l'image
 *   - Cadre élégant avec ombre portée style film vintage
 *   - Indicateur visuel "époque" avec la date dans un badge doré
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AudioContextImage } from '../../types';
import { SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';

const IMG_COLORS = {
  bg: 'rgba(255,255,255,0.04)',
  caption: 'rgba(255,255,255,0.85)',
  credit: 'rgba(255,255,255,0.40)',
  border: 'rgba(255,255,255,0.06)',
  frameShadow: 'rgba(196,147,63,0.15)',
};

interface InlineImageProps {
  image: AudioContextImage;
}

export function InlineImage({ image }: InlineImageProps) {
  // ── Fade + scale entry (Magic UI scaleUp pattern) ──
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  // ── Ken Burns: slow continuous zoom ──
  const kenBurnsScale = useRef(new Animated.Value(1.0)).current;

  // ── Caption delayed slide-in ──
  const captionFade = useRef(new Animated.Value(0)).current;
  const captionSlide = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    // Image entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();

    // Ken Burns effect: slow zoom over 15 seconds
    Animated.timing(kenBurnsScale, {
      toValue: 1.08,
      duration: 15000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Caption appears after image is visible
    Animated.parallel([
      Animated.timing(captionFade, {
        toValue: 1,
        duration: 400,
        delay: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(captionSlide, {
        toValue: 0,
        tension: 50,
        friction: 12,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, slideAnim, kenBurnsScale, captionFade, captionSlide]);

  // Handle both local require() results (number) and remote URIs (string)
  const imageSource: ImageSourcePropType =
    typeof image.uri === 'number' ? image.uri : { uri: image.uri };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      {/* Image with Ken Burns zoom */}
      <View style={styles.imageFrame}>
        <Animated.View
          style={[
            styles.kenBurnsWrapper,
            { transform: [{ scale: kenBurnsScale }] },
          ]}
        >
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={image.caption || 'Historical photograph'}
          />
        </Animated.View>

        {/* Bottom gradient for caption readability */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.70)']}
          style={styles.gradient}
        />

        {/* Thin gold accent line at top */}
        <View style={styles.topAccent} />
      </View>

      {/* Caption with delayed slide-in */}
      {image.caption && (
        <Animated.View
          style={[
            styles.captionContainer,
            {
              opacity: captionFade,
              transform: [{ translateY: captionSlide }],
            },
          ]}
        >
          <View style={styles.captionLine} />
          <Text style={styles.caption}>{image.caption}</Text>
          {image.credit && (
            <Text style={styles.credit}>{image.credit}</Text>
          )}
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    backgroundColor: IMG_COLORS.bg,
    // Elegant shadow
    shadowColor: IMG_COLORS.frameShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  imageFrame: {
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS.md,
    position: 'relative',
  },
  kenBurnsWrapper: {
    // Slightly larger to accommodate zoom without showing edges
    width: '100%',
    height: 220,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(196,147,63,0.40)',
  },
  captionContainer: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(26,26,34,0.60)',
  },
  captionLine: {
    width: 24,
    height: 2,
    backgroundColor: 'rgba(196,147,63,0.50)',
    borderRadius: 1,
    marginBottom: SPACING.xs,
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
    marginTop: 4,
  },
});
