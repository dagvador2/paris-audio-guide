/**
 * Overlay de quiz interactif (thème sombre immersif).
 *
 * Améliorations UI :
 *   - Entrée animée du modal (scale + fade, style Magic UI scaleUp)
 *   - Options avec entrée staggerée (slideUp successif)
 *   - Timer circulaire animé avec pulse quand le temps est bas
 *   - Lettres d'option (A, B, C, D) pour une meilleure lisibilité
 *   - Feedback bonne/mauvaise réponse animé (shake ou bounce)
 *   - Explication slide-in avec icône
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { AudioQuiz } from '../../types';
import { SPACING, BORDER_RADIUS, FONTS } from '../../utils/constants';

const QUIZ = {
  overlay: 'rgba(0,0,0,0.85)',
  surface: '#1A1A22',
  surfaceLight: '#22222E',
  surfaceBorder: 'rgba(255,255,255,0.06)',
  accent: '#C4933F',
  accentGlow: 'rgba(196,147,63,0.25)',
  text: '#FFFFFF',
  textDim: 'rgba(255,255,255,0.60)',
  textMuted: 'rgba(255,255,255,0.35)',
  optionBg: 'rgba(255,255,255,0.04)',
  optionBorder: 'rgba(255,255,255,0.10)',
  optionHover: 'rgba(255,255,255,0.08)',
  correctBg: 'rgba(45,139,70,0.18)',
  correctBorder: '#2D8B46',
  correctGlow: 'rgba(45,139,70,0.30)',
  wrongBg: 'rgba(211,47,47,0.18)',
  wrongBorder: '#D32F2F',
  wrongGlow: 'rgba(211,47,47,0.25)',
  explanationBg: 'rgba(196,147,63,0.08)',
  explanationBorder: 'rgba(196,147,63,0.20)',
  timerGreen: '#2D8B46',
  timerAmber: '#C4933F',
  timerRed: '#D32F2F',
};

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

interface AudioQuizOverlayProps {
  quiz: AudioQuiz;
  onAnswer: (correct: boolean, responseTimeMs: number) => void;
}

export function AudioQuizOverlay({ quiz, onAnswer }: AudioQuizOverlayProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(quiz.timerSeconds);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime] = useState(Date.now());

  // ── Modal entrance animation ──
  const modalScale = useRef(new Animated.Value(0.85)).current;
  const modalFade = useRef(new Animated.Value(0)).current;

  // ── Option stagger animations ──
  const optionAnims = useRef(
    quiz.options.map(() => ({
      fade: new Animated.Value(0),
      slide: new Animated.Value(30),
    }))
  ).current;

  // ── Timer pulse ──
  const timerPulse = useRef(new Animated.Value(1)).current;

  // ── Explanation slide-in ──
  const explanationSlide = useRef(new Animated.Value(20)).current;
  const explanationFade = useRef(new Animated.Value(0)).current;

  // ── Feedback shake animation ──
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ── Entry animations ──
  useEffect(() => {
    // Modal entrance
    Animated.parallel([
      Animated.spring(modalScale, {
        toValue: 1,
        tension: 65,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(modalFade, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered option reveal
    const staggerDelay = 120;
    optionAnims.forEach((anim, index) => {
      Animated.parallel([
        Animated.timing(anim.fade, {
          toValue: 1,
          duration: 400,
          delay: 300 + index * staggerDelay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(anim.slide, {
          toValue: 0,
          tension: 50,
          friction: 10,
          delay: 300 + index * staggerDelay,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [modalScale, modalFade, optionAnims]);

  // ── Timer countdown ──
  useEffect(() => {
    if (showExplanation) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showExplanation]);

  // ── Timer pulse when low ──
  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0 && !showExplanation) {
      Animated.sequence([
        Animated.timing(timerPulse, {
          toValue: 1.15,
          duration: 150,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(timerPulse, {
          toValue: 1,
          duration: 150,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [timeLeft, showExplanation, timerPulse]);

  const handleTimeout = useCallback(() => {
    setShowExplanation(true);
    animateExplanation();
    const responseTime = Date.now() - startTime;
    setTimeout(() => {
      onAnswer(false, responseTime);
    }, 3000);
  }, [startTime, onAnswer]);

  const handleSelectOption = useCallback((index: number) => {
    if (selectedIndex !== null || showExplanation) return;

    setSelectedIndex(index);
    const correct = index === quiz.correctAnswerIndex;
    const responseTime = Date.now() - startTime;
    setShowExplanation(true);

    if (!correct) {
      // Shake animation for wrong answer
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }

    animateExplanation();

    setTimeout(() => {
      onAnswer(correct, responseTime);
    }, 3000);
  }, [selectedIndex, showExplanation, quiz.correctAnswerIndex, startTime, onAnswer, shakeAnim]);

  const animateExplanation = useCallback(() => {
    Animated.parallel([
      Animated.timing(explanationFade, {
        toValue: 1,
        duration: 400,
        delay: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(explanationSlide, {
        toValue: 0,
        tension: 50,
        friction: 12,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [explanationFade, explanationSlide]);

  // Timer color
  const getTimerColor = () => {
    const ratio = timeLeft / quiz.timerSeconds;
    if (ratio > 0.6) return QUIZ.timerGreen;
    if (ratio > 0.3) return QUIZ.timerAmber;
    return QUIZ.timerRed;
  };

  const timerProgress = timeLeft / quiz.timerSeconds;
  const timerColor = getTimerColor();

  // Result state
  const isCorrect = selectedIndex === quiz.correctAnswerIndex;
  const resultTitle = selectedIndex !== null
    ? (isCorrect ? 'Correct!' : 'Not quite...')
    : "Time's up!";
  const resultIcon = selectedIndex !== null
    ? (isCorrect ? '✓' : '✗')
    : '⏱';

  return (
    <Modal visible transparent animationType="none" onRequestClose={() => {}}>
      <Animated.View style={[styles.overlay, { opacity: modalFade }]}>
        <Animated.View
          style={[
            styles.modal,
            {
              opacity: modalFade,
              transform: [
                { scale: modalScale },
                { translateX: shakeAnim },
              ],
            },
          ]}
        >
          {/* ── Timer Section ── */}
          <View style={styles.timerSection}>
            <Animated.View
              style={[
                styles.timerCircle,
                {
                  borderColor: timerColor,
                  transform: [{ scale: timerPulse }],
                  shadowColor: timerColor,
                  shadowOpacity: timeLeft <= 5 ? 0.5 : 0.2,
                },
              ]}
            >
              <Text style={[styles.timerNumber, { color: timerColor }]}>
                {timeLeft}
              </Text>
            </Animated.View>

            {/* Progress bar below timer */}
            <View style={styles.timerBar}>
              <View
                style={[
                  styles.timerFill,
                  {
                    width: `${timerProgress * 100}%`,
                    backgroundColor: timerColor,
                  },
                ]}
              />
            </View>
          </View>

          {/* ── Question ── */}
          <Text style={styles.question}>{quiz.question}</Text>

          {/* ── Options ── */}
          <View style={styles.options}>
            {quiz.options.map((option, index) => {
              let bgColor = QUIZ.optionBg;
              let borderColor = QUIZ.optionBorder;
              let letterBg = QUIZ.surfaceLight;
              let letterColor = QUIZ.textDim;

              if (selectedIndex !== null) {
                if (index === quiz.correctAnswerIndex) {
                  bgColor = QUIZ.correctBg;
                  borderColor = QUIZ.correctBorder;
                  letterBg = QUIZ.correctBorder;
                  letterColor = QUIZ.text;
                } else if (index === selectedIndex) {
                  bgColor = QUIZ.wrongBg;
                  borderColor = QUIZ.wrongBorder;
                  letterBg = QUIZ.wrongBorder;
                  letterColor = QUIZ.text;
                }
              }

              return (
                <Animated.View
                  key={index}
                  style={{
                    opacity: optionAnims[index].fade,
                    transform: [{ translateY: optionAnims[index].slide }],
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.option,
                      { backgroundColor: bgColor, borderColor },
                    ]}
                    onPress={() => handleSelectOption(index)}
                    disabled={selectedIndex !== null}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Option ${OPTION_LETTERS[index]}: ${option}`}
                  >
                    {/* Letter badge */}
                    <View style={[styles.optionLetter, { backgroundColor: letterBg }]}>
                      <Text style={[styles.optionLetterText, { color: letterColor }]}>
                        {OPTION_LETTERS[index]}
                      </Text>
                    </View>

                    <Text style={styles.optionText}>{option}</Text>

                    {/* Result indicator */}
                    {selectedIndex !== null && index === quiz.correctAnswerIndex && (
                      <View style={[styles.resultBadge, { backgroundColor: QUIZ.correctBorder }]}>
                        <Text style={styles.resultBadgeText}>✓</Text>
                      </View>
                    )}
                    {selectedIndex === index && index !== quiz.correctAnswerIndex && (
                      <View style={[styles.resultBadge, { backgroundColor: QUIZ.wrongBorder }]}>
                        <Text style={styles.resultBadgeText}>✗</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          {/* ── Explanation ── */}
          {showExplanation && (
            <Animated.View
              style={[
                styles.explanation,
                {
                  opacity: explanationFade,
                  transform: [{ translateY: explanationSlide }],
                },
              ]}
            >
              <View style={styles.explanationHeader}>
                <View
                  style={[
                    styles.explanationIcon,
                    {
                      backgroundColor: isCorrect
                        ? QUIZ.correctBg
                        : (selectedIndex !== null ? QUIZ.wrongBg : QUIZ.accentGlow),
                    },
                  ]}
                >
                  <Text style={styles.explanationIconText}>{resultIcon}</Text>
                </View>
                <Text
                  style={[
                    styles.explanationTitle,
                    {
                      color: isCorrect
                        ? QUIZ.correctBorder
                        : (selectedIndex !== null ? QUIZ.wrongBorder : QUIZ.accent),
                    },
                  ]}
                >
                  {resultTitle}
                </Text>
              </View>
              <Text style={styles.explanationText}>{quiz.explanation}</Text>
            </Animated.View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: QUIZ.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modal: {
    backgroundColor: QUIZ.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: QUIZ.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 24,
  },

  // ── Timer ──
  timerSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 4,
  },
  timerNumber: {
    fontSize: 24,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  timerBar: {
    height: 3,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    borderRadius: 2,
  },

  // ── Question ──
  question: {
    fontSize: 20,
    fontWeight: '700',
    color: QUIZ.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: 0.2,
  },

  // ── Options ──
  options: {
    gap: SPACING.sm,
  },
  option: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: '700',
  },
  optionText: {
    fontSize: FONTS.sizes.md,
    color: QUIZ.text,
    flex: 1,
    lineHeight: 22,
  },
  resultBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultBadgeText: {
    fontSize: 16,
    color: QUIZ.text,
    fontWeight: '800',
  },

  // ── Explanation ──
  explanation: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: QUIZ.explanationBg,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: QUIZ.explanationBorder,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  explanationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  explanationIconText: {
    fontSize: 16,
    fontWeight: '700',
  },
  explanationTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
  explanationText: {
    fontSize: FONTS.sizes.sm,
    color: QUIZ.textDim,
    lineHeight: 20,
    paddingLeft: 44, // aligned with text after icon
  },
});
