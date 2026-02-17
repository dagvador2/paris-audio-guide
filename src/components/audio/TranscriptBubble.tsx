/**
 * Segment de transcription avec effet karaoke (mot par mot).
 * Police Oswald Bold, grande taille, style téléprompter.
 *
 * 3 états possibles :
 *   - "past"   → texte entier visible, légèrement atténué
 *   - "active" → mots progressivement mis en surbrillance (karaoke)
 *   - "future" → non rendu (le parent ne l'inclut pas)
 */

import React, { useEffect, useRef, useMemo, memo } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { AudioTranscriptSegment } from '../../types';
import { SPACING } from '../../utils/constants';

// ─── Palette immersive ──────────────────────────────────────
const IMMERSIVE = {
  textSpoken: '#FFFFFF',
  textActive: 'rgba(255,255,255,0.25)',
  textPast: 'rgba(255,255,255,0.40)',
  sectionTitle: '#C4933F',
  sectionLine: 'rgba(196,147,63,0.30)',
  sectionSub: 'rgba(255,255,255,0.45)',
  quoteAccent: '#C4933F',
};

// ─── Typography ─────────────────────────────────────────────
const FONT = {
  family: 'Oswald_700Bold',
  familyMedium: 'Oswald_500Medium',
  sizeMain: 28,
  lineHeight: 38,
  sizePast: 26,
  lineHeightPast: 36,
  sizeSection: 13,
  sizeSectionSub: 12,
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 70,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const isCharacter = segment.speakerStyle === 'character';

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {segment.sectionTitle && <SectionHeader segment={segment} />}

      <View style={[styles.textWrapper, isCharacter && styles.textWrapperQuote]}>
        {isCharacter && <View style={styles.quoteBar} />}
        {state === 'active' ? (
          <HighlightedText
            text={segment.text}
            progress={progress}
            isCharacter={isCharacter}
          />
        ) : (
          <Text style={[styles.pastText, isCharacter && styles.italicText]}>
            {segment.text}
          </Text>
        )}
      </View>
    </Animated.View>
  );
});

// ─── Word-by-word karaoke highlight ─────────────────────────

interface HighlightedTextProps {
  text: string;
  progress: number;
  isCharacter: boolean;
}

const HighlightedText = memo(function HighlightedText({
  text,
  progress,
  isCharacter,
}: HighlightedTextProps) {
  const words = useMemo(() => text.split(' '), [text]);

  const spokenCount = Math.floor(progress * words.length);
  const wordFraction = (progress * words.length) % 1;

  return (
    <Text style={[styles.textBase, isCharacter && styles.italicText]}>
      {words.map((word, i) => {
        let color: string;
        if (i < spokenCount) {
          color = IMMERSIVE.textSpoken;
        } else if (i === spokenCount) {
          const t = wordFraction;
          const brightness = Math.round(255 * (0.25 + 0.75 * t));
          color = `rgb(${brightness},${brightness},${brightness})`;
        } else {
          color = IMMERSIVE.textActive;
        }

        return (
          <Text key={i} style={{ color }}>
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </Text>
        );
      })}
    </Text>
  );
});

// ─── Section header ─────────────────────────────────────────

function SectionHeader({ segment }: { segment: AudioTranscriptSegment }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.sectionHeader, { opacity: fadeAnim }]}>
      <View style={styles.sectionLine} />
      <Text style={styles.sectionTitle}>
        {segment.sectionTitle!.toUpperCase()}
      </Text>
      {segment.sectionSubtitle && (
        <Text style={styles.sectionSubtitle}>{segment.sectionSubtitle}</Text>
      )}
      <View style={styles.sectionLine} />
    </Animated.View>
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
  },
  quoteBar: {
    width: 3,
    backgroundColor: IMMERSIVE.quoteAccent,
    borderRadius: 2,
    marginRight: SPACING.md,
  },
  textBase: {
    fontFamily: FONT.family,
    fontSize: FONT.sizeMain,
    lineHeight: FONT.lineHeight,
    flex: 1,
  },
  pastText: {
    fontFamily: FONT.familyMedium,
    fontSize: FONT.sizePast,
    lineHeight: FONT.lineHeightPast,
    color: IMMERSIVE.textPast,
    flex: 1,
  },
  italicText: {
    fontStyle: 'italic',
  },
  // ── Section header ──────────────────────────────────────
  sectionHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  sectionLine: {
    height: 1,
    width: 60,
    backgroundColor: IMMERSIVE.sectionLine,
    marginVertical: SPACING.sm,
  },
  sectionTitle: {
    fontFamily: FONT.family,
    fontSize: FONT.sizeSection,
    color: IMMERSIVE.sectionTitle,
    letterSpacing: 4,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontFamily: FONT.familyMedium,
    fontSize: FONT.sizeSectionSub,
    color: IMMERSIVE.sectionSub,
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: 1,
  },
});
