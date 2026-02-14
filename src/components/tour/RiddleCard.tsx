/**
 * Composant d'énigme gérant les 4 types : QCM, saisie texte, photo, observation.
 * Gère les tentatives, indices, feedback visuel et explication.
 */

import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Riddle } from '../../types';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

interface RiddleCardProps {
  riddle: Riddle;
  onSolved: (correct: boolean, attempts: number) => void;
  onSkip: () => void;
}

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

export function RiddleCard({ riddle, onSolved, onSkip }: RiddleCardProps) {
  const { t } = useTranslation();
  const [attempts, setAttempts] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  const maxAttempts = riddle.maxAttempts;

  const handleCorrect = useCallback((totalAttempts: number) => {
    setIsSolved(true);
    setLastCorrect(true);
    setShowExplanation(true);
    onSolved(true, totalAttempts);
  }, [onSolved]);

  const handleWrong = useCallback((totalAttempts: number) => {
    setLastCorrect(false);
    setShowHint(true);
    if (totalAttempts >= maxAttempts) {
      setShowExplanation(true);
      onSolved(false, totalAttempts);
    }
  }, [maxAttempts, onSolved]);

  const handleMultipleChoice = (index: number) => {
    if (isSolved || showExplanation) return;
    setSelectedAnswer(index);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (index === riddle.correctAnswerIndex) {
      handleCorrect(newAttempts);
    } else {
      handleWrong(newAttempts);
    }
  };

  const handleTextSubmit = () => {
    if (isSolved || showExplanation || !textAnswer.trim()) return;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const isCorrect = (riddle.acceptedAnswers ?? []).some(
      (a) => normalize(a) === normalize(textAnswer)
    );

    if (isCorrect) {
      handleCorrect(newAttempts);
    } else {
      handleWrong(newAttempts);
      setTextAnswer('');
    }
  };

  const handleConfirmAction = () => {
    handleCorrect(1);
  };

  const getOptionStyle = (index: number) => {
    if (selectedAnswer === null) return styles.option;
    if (index === riddle.correctAnswerIndex) return [styles.option, styles.optionCorrect];
    if (index === selectedAnswer && !lastCorrect) return [styles.option, styles.optionWrong];
    return styles.option;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>🧩 {t('checkpoint.riddleTitle')}</Text>
      <Text style={styles.question}>{riddle.question}</Text>

      {/* QCM */}
      {riddle.type === 'multiple_choice' && riddle.options && (
        <View style={styles.options}>
          {riddle.options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={getOptionStyle(i)}
              onPress={() => handleMultipleChoice(i)}
              disabled={isSolved || attempts >= maxAttempts}
              accessibilityRole="button"
              accessibilityLabel={opt}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Saisie texte */}
      {riddle.type === 'text_input' && (
        <View style={styles.textInputRow}>
          <TextInput
            style={styles.textInput}
            value={textAnswer}
            onChangeText={setTextAnswer}
            placeholder="Votre réponse..."
            placeholderTextColor={COLORS.textLight}
            editable={!isSolved && attempts < maxAttempts}
            onSubmitEditing={handleTextSubmit}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[styles.submitBtn, (!textAnswer.trim() || isSolved) && styles.submitBtnDisabled]}
            onPress={handleTextSubmit}
            disabled={!textAnswer.trim() || isSolved || attempts >= maxAttempts}
          >
            <Text style={styles.submitBtnText}>{t('checkpoint.riddleSubmit')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Photo spot */}
      {riddle.type === 'photo_spot' && (
        <View style={styles.actionBlock}>
          <Text style={styles.promptText}>{riddle.photoPrompt}</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={handleConfirmAction} disabled={isSolved}>
            <Text style={styles.actionBtnText}>{t('checkpoint.riddlePhotoTaken')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Observation */}
      {riddle.type === 'observation' && (
        <View style={styles.actionBlock}>
          <Text style={styles.promptText}>{riddle.observationPrompt}</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={handleConfirmAction} disabled={isSolved}>
            <Text style={styles.actionBtnText}>{t('checkpoint.riddleObservationFound')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Indice */}
      {showHint && riddle.hint && !showExplanation && (
        <View style={styles.hintBox}>
          <Text style={styles.hintText}>💡 {riddle.hint}</Text>
        </View>
      )}

      {/* Tentatives restantes */}
      {attempts > 0 && !showExplanation && riddle.type !== 'photo_spot' && riddle.type !== 'observation' && (
        <Text style={styles.attemptsText}>
          {maxAttempts - attempts} {t('checkpoint.riddleAttemptsLeft')}
        </Text>
      )}

      {/* Explication */}
      {showExplanation && (
        <View style={[styles.explanationBox, isSolved ? styles.explanationCorrect : styles.explanationWrong]}>
          <Text style={styles.explanationTitle}>
            {isSolved ? t('checkpoint.riddleCorrect') : t('checkpoint.riddleWrong')}
          </Text>
          <Text style={styles.explanationText}>{riddle.explanation}</Text>
        </View>
      )}

      {/* Skip */}
      {!isSolved && !showExplanation && (
        <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
          <Text style={styles.skipText}>{t('checkpoint.riddleSkip')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginVertical: SPACING.sm },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.secondary, marginBottom: SPACING.xs },
  question: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md, lineHeight: 24 },
  options: { gap: SPACING.sm },
  option: { backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.sm, padding: SPACING.sm + 2, borderWidth: 1.5, borderColor: COLORS.border },
  optionCorrect: { backgroundColor: COLORS.success + '20', borderColor: COLORS.success },
  optionWrong: { backgroundColor: COLORS.error + '20', borderColor: COLORS.error },
  optionText: { fontSize: 15, color: COLORS.textPrimary },
  textInputRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  textInput: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.sm, padding: SPACING.sm, fontSize: 15, color: COLORS.textPrimary },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.sm, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  actionBlock: { alignItems: 'center', gap: SPACING.md },
  promptText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  actionBtn: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.lg, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, minWidth: 200, alignItems: 'center' },
  actionBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  hintBox: { backgroundColor: COLORS.warning + '15', borderRadius: BORDER_RADIUS.sm, padding: SPACING.sm, marginTop: SPACING.md },
  hintText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
  attemptsText: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'right', marginTop: SPACING.sm },
  explanationBox: { borderRadius: BORDER_RADIUS.sm, padding: SPACING.md, marginTop: SPACING.md },
  explanationCorrect: { backgroundColor: COLORS.success + '15' },
  explanationWrong: { backgroundColor: COLORS.error + '15' },
  explanationTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  explanationText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
  skipBtn: { alignSelf: 'center', marginTop: SPACING.md, padding: SPACING.xs },
  skipText: { fontSize: 14, color: COLORS.textSecondary, textDecorationLine: 'underline' },
});
