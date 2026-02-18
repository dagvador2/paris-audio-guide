/**
 * Banniere de section persistante en haut de l'ecran immersif.
 * Affiche la section actuelle avec transition fade-out / fade-in.
 * Fond translucide avec BlurView natif (dev build requis).
 *
 * Transition entre sections :
 *   1. Fade out du titre actuel (200ms)
 *   2. Mise a jour du texte affiche
 *   3. Fade in du nouveau titre (400ms + spring slide)
 */

import React, { useEffect, useRef, useState, memo } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { SPACING } from '../../utils/constants';

const BANNER = {
  bg: 'rgba(13,13,17,0.75)',
  accent: '#C4933F',
  accentDim: 'rgba(196,147,63,0.40)',
  text: '#FFFFFF',
  textDim: 'rgba(255,255,255,0.50)',
  divider: 'rgba(196,147,63,0.25)',
};

interface SectionBannerProps {
  sectionTitle: string | null;
  sectionSubtitle?: string | null;
  sectionIndex: number;
  totalSections: number;
}

export const SectionBanner = memo(function SectionBanner({
  sectionTitle,
  sectionSubtitle,
  sectionIndex,
  totalSections,
}: SectionBannerProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-8)).current;
  const prevTitleRef = useRef<string | null>(null);

  // Displayed text (updated between fade-out and fade-in)
  const [displayedTitle, setDisplayedTitle] = useState(sectionTitle);
  const [displayedSubtitle, setDisplayedSubtitle] = useState(sectionSubtitle);

  useEffect(() => {
    if (!sectionTitle) return;
    if (sectionTitle === prevTitleRef.current) return;

    const hadPrevious = prevTitleRef.current !== null;
    prevTitleRef.current = sectionTitle;

    if (hadPrevious) {
      // ── Fade out current → swap text → fade in new ──
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        // Update displayed text while invisible
        setDisplayedTitle(sectionTitle);
        setDisplayedSubtitle(sectionSubtitle);

        // Fade in new title
        slideAnim.setValue(-8);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 60,
            friction: 12,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      // ── First section: just fade in ──
      setDisplayedTitle(sectionTitle);
      setDisplayedSubtitle(sectionSubtitle);
      fadeAnim.setValue(0);
      slideAnim.setValue(-8);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 60,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [sectionTitle, sectionSubtitle, fadeAnim, slideAnim]);

  if (!displayedTitle) return null;

  // Section progress dots
  const dots = [];
  for (let i = 0; i < totalSections; i++) {
    dots.push(
      <View
        key={i}
        style={[
          styles.dot,
          i < sectionIndex
            ? styles.dotCompleted
            : i === sectionIndex
              ? styles.dotActive
              : styles.dotFuture,
        ]}
      />,
    );
  }

  return (
    <View style={styles.container}>
      <BlurView intensity={40} tint="dark" style={styles.bannerBg}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Progress dots */}
          <View style={styles.dotsRow}>{dots}</View>

          {/* Section title */}
          <Text style={styles.title} numberOfLines={1}>
            {displayedTitle.toUpperCase()}
          </Text>

          {/* Subtitle */}
          {displayedSubtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {displayedSubtitle}
            </Text>
          )}
        </Animated.View>
      </BlurView>

      {/* Bottom divider */}
      <View style={styles.divider} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  bannerBg: {
    paddingTop: 54, // safe area top
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: BANNER.bg,
  },
  content: {
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotCompleted: {
    backgroundColor: BANNER.accent,
  },
  dotActive: {
    backgroundColor: BANNER.accent,
    width: 18,
    borderRadius: 3,
  },
  dotFuture: {
    backgroundColor: BANNER.accentDim,
  },
  title: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 14,
    color: BANNER.accent,
    letterSpacing: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(196,147,63,0.50)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 11,
    color: BANNER.textDim,
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: BANNER.divider,
  },
});
