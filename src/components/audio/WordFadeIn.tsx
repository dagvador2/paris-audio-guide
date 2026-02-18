/**
 * Animation mot par mot — pattern WordFadeIn adapté pour React Native.
 *
 * Utilise View + flexWrap avec un Animated.View par mot pour que chaque
 * mot soit un vrai native view animable (opacity + translateY).
 * Les Animated.Text inline dans Text ne fonctionnent pas bien car
 * React Native les rend comme NSAttributedString ranges, pas des views séparées.
 *
 * Inspiré du composant Magic UI / framer-motion WordFadeIn.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native';

// Espace inter-mots approx. pour Oswald ~26-28px (condensé → ~25% du fontSize)
const WORD_GAP = 7;

interface WordFadeInProps {
  words: string;
  style?: StyleProp<TextStyle>;
  /** Délai entre chaque mot en ms (défaut: 40ms) */
  wordDelay?: number;
  /** Durée du fade par mot en ms (défaut: 260ms) */
  wordDuration?: number;
  /** Délai initial avant le premier mot en ms (défaut: 80ms) */
  initialDelay?: number;
  /**
   * Si true, les mots apparaissent immédiatement visibles sans animation.
   * Utiliser quand le segment vient de terminer sa phase karaoke (active→past) —
   * l'utilisateur a déjà vu le texte, pas besoin de ré-animer.
   */
  skipAnimation?: boolean;
}

export function WordFadeIn({
  words,
  style,
  wordDelay = 40,
  wordDuration = 260,
  initialDelay = 80,
  skipAnimation = false,
}: WordFadeInProps) {
  const wordList = words.split(' ');

  // Chaque mot a son propre opacity + translateY (vrais Animated.Value natifs)
  const anims = useRef(
    wordList.map(() => ({
      opacity: new Animated.Value(skipAnimation ? 1 : 0),
      translateY: new Animated.Value(skipAnimation ? 0 : 8),
    })),
  ).current;

  useEffect(() => {
    if (skipAnimation) return;

    const animations = anims.flatMap((anim, i) => [
      Animated.timing(anim.opacity, {
        toValue: 1,
        duration: wordDuration,
        delay: initialDelay + i * wordDelay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(anim.translateY, {
        toValue: 0,
        duration: wordDuration,
        delay: initialDelay + i * wordDelay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    Animated.parallel(animations).start();
    // Intentionnel : animer une seule fois au montage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      {wordList.map((word, i) => (
        <Animated.View
          key={`${word}-${i}`}
          style={{
            opacity: anims[i].opacity,
            transform: [{ translateY: anims[i].translateY }],
          }}
        >
          <Text style={style}>{word}</Text>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: WORD_GAP,
    flex: 1,
  },
});
