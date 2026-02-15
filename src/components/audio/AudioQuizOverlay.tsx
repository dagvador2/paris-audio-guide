/**
 * Overlay de quiz interactif qui apparaît pendant l'audio.
 * Pause l'audio, affiche la question avec timer, et reprend après réponse.
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Animated,
} from 'react-native';
import { AudioQuiz } from '../../types';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../utils/constants';

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

  const handleTimeout = () => {
    // Timeout = mauvaise réponse
    setShowExplanation(true);
    const responseTime = Date.now() - startTime;
    setTimeout(() => {
      onAnswer(false, responseTime);
    }, 3000); // 3 sec pour lire explication
  };

  const handleSelectOption = (index: number) => {
    if (selectedIndex !== null || showExplanation) return;

    setSelectedIndex(index);
    const correct = index === quiz.correctAnswerIndex;
    const responseTime = Date.now() - startTime;
    setShowExplanation(true);

    // Attendre 3 sec pour lire l'explication avant de continuer
    setTimeout(() => {
      onAnswer(correct, responseTime);
    }, 3000);
  };

  // Couleur du timer (vert → orange → rouge)
  const getTimerColor = () => {
    const ratio = timeLeft / quiz.timerSeconds;
    if (ratio > 0.6) return COLORS.success;
    if (ratio > 0.3) return '#FF9800'; // Orange
    return COLORS.error;
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}}
    >
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
              let optionStyle = styles.option;
              let optionTextStyle = styles.optionText;

              if (selectedIndex !== null) {
                if (index === quiz.correctAnswerIndex) {
                  optionStyle = [styles.option, styles.optionCorrect];
                } else if (index === selectedIndex) {
                  optionStyle = [styles.option, styles.optionWrong];
                }
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={optionStyle}
                  onPress={() => handleSelectOption(index)}
                  disabled={selectedIndex !== null}
                  activeOpacity={0.7}
                >
                  <Text style={optionTextStyle}>{option}</Text>
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

          {/* Explication */}
          {showExplanation && (
            <View style={styles.explanation}>
              <Text style={styles.explanationTitle}>
                {selectedIndex === quiz.correctAnswerIndex
                  ? '✅ Correct !'
                  : '❌ Incorrect'}
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
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
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
  },
  question: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  options: {
    gap: SPACING.sm,
  },
  option: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionCorrect: {
    backgroundColor: '#E8F5E9',
    borderColor: COLORS.success,
  },
  optionWrong: {
    backgroundColor: '#FFEBEE',
    borderColor: COLORS.error,
  },
  optionText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    flex: 1,
  },
  checkmark: {
    fontSize: 20,
    color: COLORS.success,
    fontWeight: '700',
  },
  crossmark: {
    fontSize: 20,
    color: COLORS.error,
    fontWeight: '700',
  },
  explanation: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: '#E3F2FD',
    borderRadius: BORDER_RADIUS.sm,
  },
  explanationTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  explanationText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
});
