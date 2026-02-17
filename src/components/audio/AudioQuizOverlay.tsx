/**
 * Overlay de quiz interactif (thème sombre immersif).
 * Pause l'audio, affiche la question avec timer, et reprend après réponse.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { AudioQuiz } from '../../types';
import { SPACING, BORDER_RADIUS, FONTS } from '../../utils/constants';

const QUIZ = {
  overlay: 'rgba(0,0,0,0.80)',
  surface: '#1A1A22',
  surfaceBorder: 'rgba(255,255,255,0.08)',
  accent: '#C4933F',
  text: '#FFFFFF',
  textDim: 'rgba(255,255,255,0.65)',
  optionBg: 'rgba(255,255,255,0.06)',
  optionBorder: 'rgba(255,255,255,0.12)',
  correctBg: 'rgba(45,139,70,0.20)',
  correctBorder: '#2D8B46',
  wrongBg: 'rgba(211,47,47,0.20)',
  wrongBorder: '#D32F2F',
  explanationBg: 'rgba(196,147,63,0.12)',
};

interface AudioQuizOverlayProps {
  quiz: AudioQuiz;
  onAnswer: (correct: boolean, responseTimeMs: number) => void;
}

export function AudioQuizOverlay({ quiz, onAnswer }: AudioQuizOverlayProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(quiz.timerSeconds);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime] = useState(Date.now());

  // Timer countdown
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

  const handleTimeout = useCallback(() => {
    setShowExplanation(true);
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

    setTimeout(() => {
      onAnswer(correct, responseTime);
    }, 3000);
  }, [selectedIndex, showExplanation, quiz.correctAnswerIndex, startTime, onAnswer]);

  // Timer color
  const getTimerColor = () => {
    const ratio = timeLeft / quiz.timerSeconds;
    if (ratio > 0.6) return '#2D8B46';
    if (ratio > 0.3) return QUIZ.accent;
    return '#D32F2F';
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Timer */}
          <View style={styles.timerContainer}>
            <Text style={[styles.timerText, { color: getTimerColor() }]}>
              {timeLeft}s
            </Text>
            <View style={styles.timerBar}>
              <View
                style={[
                  styles.timerFill,
                  {
                    width: `${(timeLeft / quiz.timerSeconds) * 100}%`,
                    backgroundColor: getTimerColor(),
                  },
                ]}
              />
            </View>
          </View>

          {/* Question */}
          <Text style={styles.question}>{quiz.question}</Text>

          {/* Options */}
          <View style={styles.options}>
            {quiz.options.map((option, index) => {
              let bgColor = QUIZ.optionBg;
              let borderColor = QUIZ.optionBorder;
              let textColor = QUIZ.text;

              if (selectedIndex !== null) {
                if (index === quiz.correctAnswerIndex) {
                  bgColor = QUIZ.correctBg;
                  borderColor = QUIZ.correctBorder;
                } else if (index === selectedIndex) {
                  bgColor = QUIZ.wrongBg;
                  borderColor = QUIZ.wrongBorder;
                }
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.option,
                    { backgroundColor: bgColor, borderColor },
                  ]}
                  onPress={() => handleSelectOption(index)}
                  disabled={selectedIndex !== null}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, { color: textColor }]}>
                    {option}
                  </Text>
                  {selectedIndex !== null && index === quiz.correctAnswerIndex && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                  {selectedIndex === index && index !== quiz.correctAnswerIndex && (
                    <Text style={styles.crossmark}>✗</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Explanation */}
          {showExplanation && (
            <View style={styles.explanation}>
              <Text style={styles.explanationTitle}>
                {selectedIndex === quiz.correctAnswerIndex
                  ? 'Correct!'
                  : selectedIndex !== null
                    ? 'Not quite!'
                    : 'Time\'s up!'}
              </Text>
              <Text style={styles.explanationText}>{quiz.explanation}</Text>
            </View>
          )}
        </View>
      </View>
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
  },
  timerContainer: {
    marginBottom: SPACING.lg,
  },
  timerText: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  timerBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    borderRadius: 2,
  },
  question: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: QUIZ.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    lineHeight: 26,
  },
  options: {
    gap: SPACING.sm,
  },
  option: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: FONTS.sizes.md,
    flex: 1,
  },
  checkmark: {
    fontSize: 20,
    color: QUIZ.correctBorder,
    fontWeight: '700',
  },
  crossmark: {
    fontSize: 20,
    color: QUIZ.wrongBorder,
    fontWeight: '700',
  },
  explanation: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: QUIZ.explanationBg,
    borderRadius: BORDER_RADIUS.sm,
  },
  explanationTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: QUIZ.accent,
    marginBottom: SPACING.xs,
  },
  explanationText: {
    fontSize: FONTS.sizes.sm,
    color: QUIZ.textDim,
    lineHeight: 20,
  },
});
