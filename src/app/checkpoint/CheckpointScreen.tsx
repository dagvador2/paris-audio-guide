/**
 * Écran affiché quand un checkpoint est atteint.
 * Audio, contenu narratif, images, anecdotes et énigme.
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../navigation/types';
import { useTourStore } from '../../stores/useTourStore';
import { AudioPlayer } from '../../components/tour/AudioPlayer';
import { RiddleCard } from '../../components/tour/RiddleCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { formatScore } from '../../utils/formatters';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';

export function CheckpointScreen() {
  const { t } = useTranslation();
  const route = useRoute<RouteProp<RootStackParamList, 'Checkpoint'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { activeTour, progress, solveRiddle, markAudioListened } = useTourStore();
  const tourMode = progress?.mode ?? 'escape_game';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [riddleDone, setRiddleDone] = useState(false);

  const checkpoint = activeTour?.checkpoints.find((cp) => cp.id === route.params.checkpointId);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  if (!checkpoint) return null;

  const { content, riddle } = checkpoint;

  const handleRiddleSolved = (correct: boolean, attempts: number) => {
    solveRiddle(checkpoint.id, correct, checkpoint.bonusPoints ?? 0);
    setRiddleDone(true);
  };

  const handleRiddleSkip = () => {
    solveRiddle(checkpoint.id, false, 0);
    setRiddleDone(true);
  };

  const handleAudioComplete = () => {
    markAudioListened(checkpoint.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Header */}
          <Text style={styles.arrived}>{t('checkpoint.reached')}</Text>
          <Text style={styles.title}>{checkpoint.title}</Text>
          {tourMode === 'escape_game' && (
            <Text style={styles.points}>+{checkpoint.points} {t('checkpoint.pointsEarned')}</Text>
          )}

          {/* Audio */}
          <AudioPlayer
            audioFile={content.audioFile}
            audioDuration={content.audioDuration}
            onComplete={handleAudioComplete}
            autoPlay
          />

          {/* Texte narratif */}
          <Text style={styles.narrative}>{content.narrativeText}</Text>

          {/* Anecdote historique */}
          {content.historicalFact && (
            <Card style={styles.factCard} elevated>
              <Text style={styles.factLabel}>📜 {t('checkpoint.historicalFact')}</Text>
              <Text style={styles.factText}>{content.historicalFact}</Text>
            </Card>
          )}

          {/* Fun fact */}
          {content.funFact && (
            <Card style={styles.funFactCard} elevated>
              <Text style={styles.factLabel}>💡 {t('checkpoint.funFact')}</Text>
              <Text style={styles.factText}>{content.funFact}</Text>
            </Card>
          )}

          {/* Images */}
          {content.images && content.images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
              {content.images.map((img, i) => (
                <View key={i} style={styles.imageCard}>
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imageEmoji}>🖼</Text>
                  </View>
                  <Text style={styles.imageCaption}>{img.caption}</Text>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Énigme — escape game uniquement */}
          {tourMode === 'escape_game' && riddle && !riddleDone && (
            <RiddleCard riddle={riddle} onSolved={handleRiddleSolved} onSkip={handleRiddleSkip} />
          )}

          {tourMode === 'escape_game' && riddle && riddleDone && checkpoint.bonusPoints && (
            <Text style={styles.bonusText}>+{checkpoint.bonusPoints} {t('checkpoint.bonusPoints')}</Text>
          )}

          {/* Indice vers le prochain — escape game uniquement */}
          {tourMode === 'escape_game' && checkpoint.nextCheckpointHint && (
            <Card style={styles.hintCard}>
              <Text style={styles.hintText}>🧭 {checkpoint.nextCheckpointHint}</Text>
            </Card>
          )}

          {/* Bouton continuer */}
          <View style={styles.buttonContainer}>
            <Button
              title={t('checkpoint.continueToNext')}
              onPress={() => navigation.goBack()}
              fullWidth
            />
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  arrived: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.success, textAlign: 'center', marginBottom: SPACING.xs },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center', marginBottom: SPACING.xs },
  points: { fontSize: FONTS.sizes.md, color: COLORS.secondary, fontWeight: '600', textAlign: 'center', marginBottom: SPACING.lg },
  narrative: { fontSize: FONTS.sizes.md, color: COLORS.textPrimary, lineHeight: 24, marginTop: SPACING.lg, marginBottom: SPACING.md },
  factCard: { marginBottom: SPACING.md, backgroundColor: '#FDF6E3' },
  funFactCard: { marginBottom: SPACING.md, backgroundColor: '#F0F7FF' },
  factLabel: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.secondary, marginBottom: SPACING.xs },
  factText: { fontSize: FONTS.sizes.sm, color: COLORS.textPrimary, lineHeight: 22 },
  imagesScroll: { marginVertical: SPACING.md },
  imageCard: { width: 200, marginRight: SPACING.sm },
  imagePlaceholder: { height: 130, backgroundColor: COLORS.border, borderRadius: BORDER_RADIUS.sm, justifyContent: 'center', alignItems: 'center' },
  imageEmoji: { fontSize: 36 },
  imageCaption: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },
  bonusText: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.success, textAlign: 'center', marginVertical: SPACING.sm },
  hintCard: { marginTop: SPACING.md, marginBottom: SPACING.lg, backgroundColor: '#F5F0EB' },
  hintText: { fontSize: FONTS.sizes.sm, color: COLORS.accent, lineHeight: 22, fontStyle: 'italic' },
  buttonContainer: { marginTop: SPACING.lg },
});
