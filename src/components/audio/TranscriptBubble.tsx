/**
 * Segment de transcription avec effet karaoke fluide.
 * Police Oswald Bold, grande taille, style téléprompter.
 *
 * Améliorations :
 *   - Section headers massifs avec fond gradient, typographie grande
 *   - Karaoke fluide : transition douce sur 3-4 mots avec easing cubique
 *   - Glow progressif sur le front de lecture
 *   - Entrée blur-fade (Magic UI pattern) pour chaque segment
 */

import React, { useEffect, useRef, useMemo, memo } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AudioTranscriptSegment } from '../../types';
import { SPACING } from '../../utils/constants';
import { WordFadeIn } from './WordFadeIn';

// ─── Palette immersive ──────────────────────────────────────
const IMMERSIVE = {
  textSpoken: '#FFFFFF',
  textActive: 'rgba(255,255,255,0.15)',
  textPast: 'rgba(255,255,255,0.35)',
  sectionTitle: '#C4933F',
  sectionTitleGlow: 'rgba(196,147,63,0.60)',
  sectionBg: 'rgba(196,147,63,0.06)',
  sectionBorder: 'rgba(196,147,63,0.18)',
  sectionLine: 'rgba(196,147,63,0.30)',
  sectionLineActive: 'rgba(196,147,63,0.60)',
  sectionSub: 'rgba(255,255,255,0.50)',
  quoteAccent: '#C4933F',
  quoteAccentGlow: 'rgba(196,147,63,0.20)',
};

// ─── Typography ─────────────────────────────────────────────
const FONT = {
  family: 'Oswald_700Bold',
  familyMedium: 'Oswald_500Medium',
  sizeMain: 28,
  lineHeight: 38,
  sizePast: 26,
  lineHeightPast: 36,
  sizeSection: 22,
  sizeSectionSub: 13,
};

interface TranscriptBubbleProps {
  segment: AudioTranscriptSegment;
  state: 'past' | 'active';
  progress: number;
}

export const TranscriptBubble = memo(function TranscriptBubble({
  segment,
  state,
  progress,
}: TranscriptBubbleProps) {
  // ── Blur-fade-in animation (Magic UI blurInUp pattern) ──
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  // ── Transition to past state: dim down gently ──
  const dimAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (state === 'past') {
      Animated.timing(dimAnim, {
        toValue: 0.85,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      dimAnim.setValue(1);
    }
  }, [state, dimAnim]);

  // Track whether this segment was ever in active (karaoke) state.
  // Used to skip re-animating pastText when transitioning active→past
  // (the user already saw the text via karaoke — no need to replay the entrance).
  const wasEverActive = useRef(state === 'active');
  useEffect(() => {
    if (state === 'active') wasEverActive.current = true;
  }, [state]);

  const isCharacter = segment.speakerStyle === 'character';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: Animated.multiply(fadeAnim, dimAnim),
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      {segment.sectionTitle && <MassiveSectionHeader segment={segment} />}

      <View style={[styles.textWrapper, isCharacter && styles.textWrapperQuote]}>
        {isCharacter && <View style={styles.quoteBar} />}
        {state === 'active' ? (
          <SmoothKaraokeText
            text={segment.text}
            progress={progress}
            isCharacter={isCharacter}
          />
        ) : (
          <WordFadeIn
            words={segment.text}
            style={[styles.pastWordText, isCharacter && styles.italicText]}
            skipAnimation={wasEverActive.current}
          />
        )}
      </View>
    </Animated.View>
  );
});

// ─── Smooth karaoke with wide glow front ────────────────────
//
// Au lieu d'un switch binaire mot par mot, on utilise un "front de lecture"
// qui s'étend sur ~3 mots avec un easing cubique pour une transition douce.
// Le mot courant a un dégradé progressif, les 2 mots suivants sont
// partiellement éclairés, créant un effet de lumière qui avance.

interface SmoothKaraokeTextProps {
  text: string;
  progress: number;
  isCharacter: boolean;
}

// Easing cubique pour des transitions douces
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

const SmoothKaraokeText = memo(function SmoothKaraokeText({
  text,
  progress,
  isCharacter,
}: SmoothKaraokeTextProps) {
  const words = useMemo(() => text.split(' '), [text]);

  // ── Entrance: each word is a real Animated.View (not inline Text span) ──
  // This lets the native driver animate opacity + translateY per word smoothly.
  // Inline Animated.Text inside Text doesn't work well because RN renders
  // nested text as NSAttributedString ranges, not separate native views.
  const entranceAnims = useRef(
    words.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(6),
    })),
  ).current;

  useEffect(() => {
    const animations = entranceAnims.flatMap((anim, i) => [
      Animated.timing(anim.opacity, {
        toValue: 1,
        duration: 180,
        delay: 30 + i * 20,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(anim.translateY, {
        toValue: 0,
        duration: 180,
        delay: 30 + i * 20,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    Animated.parallel(animations).start();
    // Intentionnel : animer une seule fois au montage du segment
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Position précise du curseur (avec fraction)
  const cursorPos = progress * words.length;

  // Largeur du front lumineux en nombre de mots
  const GLOW_WIDTH = 2.5;

  return (
    <View style={styles.karaokeWrap}>
      {words.map((word, i) => {
        // Distance du mot au curseur
        const distance = i - cursorPos;

        let brightness: number;
        let glowRadius = 0;

        if (distance < -0.5) {
          // Mot déjà prononcé — pleine luminosité
          brightness = 1;
        } else if (distance < 0) {
          // Mot en cours de finalisation — presque plein
          const t = easeOutCubic(1 + distance * 2); // 0→1 smooth
          brightness = 0.85 + 0.15 * t;
          glowRadius = 4;
        } else if (distance < 1) {
          // Mot courant — transition principale
          const t = easeOutCubic(1 - distance);
          brightness = 0.15 + 0.70 * t;
          glowRadius = 6 * t;
        } else if (distance < GLOW_WIDTH) {
          // Mots proches — pré-luminosité douce (anticipation)
          const t = easeOutCubic(1 - (distance - 1) / (GLOW_WIDTH - 1));
          brightness = 0.15 + 0.10 * t;
        } else {
          // Mots futurs — sombre
          brightness = 0.15;
        }

        const colorVal = Math.round(255 * Math.min(1, Math.max(0, brightness)));
        const color = `rgb(${colorVal},${colorVal},${colorVal})`;

        return (
          <Animated.View
            key={i}
            style={{
              opacity: entranceAnims[i].opacity,
              transform: [{ translateY: entranceAnims[i].translateY }],
            }}
          >
            <Text
              style={[
                styles.karaokeWord,
                isCharacter && styles.italicText,
                {
                  color,
                  ...(glowRadius > 0 && {
                    textShadowColor: `rgba(255,255,255,${brightness * 0.20})`,
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: glowRadius,
                  }),
                },
              ]}
            >
              {word}
            </Text>
          </Animated.View>
        );
      })}
    </View>
  );
});

// ─── Massive section header ─────────────────────────────────
//
// Header plein écran avec :
//   - Fond semi-transparent doré
//   - Grande typographie (22px)
//   - Lignes décoratives animées de chaque côté
//   - Scale-in dramatique

function MassiveSectionHeader({ segment }: { segment: AudioTranscriptSegment }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const lineWidthAnim = useRef(new Animated.Value(0)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Lines expand from center
      Animated.timing(lineWidthAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      // Title scales in dramatically
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Subtitle fades in
      Animated.timing(subtitleFade, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, lineWidthAnim, subtitleFade]);

  const lineWidth = lineWidthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 80],
  });

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionInner}>
        {/* Top decorative line */}
        <View style={styles.sectionLineRow}>
          <Animated.View
            style={[styles.sectionLine, { width: lineWidth }]}
          />
          <View style={styles.sectionDiamond} />
          <Animated.View
            style={[styles.sectionLine, { width: lineWidth }]}
          />
        </View>

        {/* Title — large and dramatic */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Text style={styles.sectionTitle}>
            {segment.sectionTitle!.toUpperCase()}
          </Text>
        </Animated.View>

        {/* Subtitle */}
        {segment.sectionSubtitle && (
          <Animated.Text
            style={[styles.sectionSubtitle, { opacity: subtitleFade }]}
          >
            {segment.sectionSubtitle}
          </Animated.Text>
        )}

        {/* Bottom decorative line */}
        <View style={styles.sectionLineRow}>
          <Animated.View
            style={[styles.sectionLine, { width: lineWidth }]}
          />
          <View style={styles.sectionDiamond} />
          <Animated.View
            style={[styles.sectionLine, { width: lineWidth }]}
          />
        </View>
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  textWrapper: {
    paddingVertical: SPACING.xs,
  },
  textWrapperQuote: {
    flexDirection: 'row',
    paddingLeft: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    backgroundColor: IMMERSIVE.quoteAccentGlow,
    marginVertical: SPACING.xs,
  },
  quoteBar: {
    width: 3,
    backgroundColor: IMMERSIVE.quoteAccent,
    borderRadius: 2,
    marginRight: SPACING.md,
  },
  // ── flexWrap word layout (karaoke active) ────────────────
  karaokeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 7,
    flex: 1,
  },
  karaokeWord: {
    fontFamily: FONT.family,
    fontSize: FONT.sizeMain,
    lineHeight: FONT.lineHeight,
  },
  // ── Past word text (used by WordFadeIn, no flex:1 — container handles it) ──
  pastWordText: {
    fontFamily: FONT.familyMedium,
    fontSize: FONT.sizePast,
    lineHeight: FONT.lineHeightPast,
    color: IMMERSIVE.textPast,
  },
  italicText: {
    fontStyle: 'italic',
  },

  // ── Massive section header ────────────────────────────────
  sectionContainer: {
    marginTop: SPACING.xxl + SPACING.lg,
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
    backgroundColor: IMMERSIVE.sectionBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: IMMERSIVE.sectionBorder,
  },
  sectionInner: {
    alignItems: 'center',
  },
  sectionLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionLine: {
    height: 1.5,
    backgroundColor: IMMERSIVE.sectionLineActive,
    borderRadius: 1,
  },
  sectionDiamond: {
    width: 6,
    height: 6,
    backgroundColor: IMMERSIVE.sectionTitle,
    transform: [{ rotate: '45deg' }],
  },
  sectionTitle: {
    fontFamily: FONT.family,
    fontSize: FONT.sizeSection,
    color: IMMERSIVE.sectionTitle,
    letterSpacing: 6,
    textAlign: 'center',
    marginVertical: SPACING.md,
    textShadowColor: IMMERSIVE.sectionTitleGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  sectionSubtitle: {
    fontFamily: FONT.familyMedium,
    fontSize: FONT.sizeSectionSub,
    color: IMMERSIVE.sectionSub,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    letterSpacing: 2,
  },
});
