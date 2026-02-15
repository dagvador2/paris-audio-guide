/**
 * Écran de fin de visite — résumé, score, badges et partage.
 */

import React from 'react';
import { StyleSheet, Text, View, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../navigation/types';
import { useTourStore } from '../../stores/useTourStore';
import { Button } from '../../components/ui/Button';
import { formatDistance, formatDuration, formatScore } from '../../utils/formatters';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';

export function TourCompleteScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { progress, activeTour, clearActiveTour } = useTourStore();

  if (!progress || !activeTour) return null;

  const isEscapeMode = (progress.mode ?? 'escape_game') === 'escape_game';

  const handleShare = async () => {
    const message = isEscapeMode
      ? `J'ai terminé l'escape game "${activeTour.title}" sur Paris Audio Guide ! Score : ${progress.totalScore} points 🏛`
      : `J'ai terminé la visite "${activeTour.title}" sur Paris Audio Guide ! 🏛`;
    await Share.share({ message });
  };

  const handleBackToHome = () => {
    clearActiveTour();
    navigation.navigate('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.congrats}>{t('complete.congratulations')}</Text>
        <Text style={styles.tourTitle}>{activeTour.title}</Text>

        {/* Score — escape game uniquement */}
        {isEscapeMode && (
          <View style={styles.scoreCard}>
            <Text style={styles.scoreValue}>{formatScore(progress.totalScore)}</Text>
            <Text style={styles.scoreLabel}>{t('complete.totalPoints')}</Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDuration(progress.elapsedTimeMinutes)}</Text>
            <Text style={styles.statLabel}>{t('complete.timeSpent')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDistance(progress.distanceWalkedMeters)}</Text>
            <Text style={styles.statLabel}>{t('complete.distanceWalked')}</Text>
          </View>
          {isEscapeMode && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{progress.riddlesCorrect}/{progress.riddlesTotal}</Text>
              <Text style={styles.statLabel}>{t('complete.riddlesSolved')}</Text>
            </View>
          )}
        </View>

        {/* Boutons */}
        <View style={styles.buttons}>
          <Button title={t('complete.shareResult')} onPress={handleShare} variant="secondary" fullWidth />
          <View style={{ height: SPACING.sm }} />
          <Button title={t('complete.backToHome')} onPress={handleBackToHome} variant="outline" fullWidth />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, alignItems: 'center' },
  emoji: { fontSize: 64, marginTop: SPACING.xl },
  congrats: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.primary, marginTop: SPACING.md },
  tourTitle: { fontSize: FONTS.sizes.lg, color: COLORS.textSecondary, marginTop: SPACING.xs },
  scoreCard: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.xl, paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xxl, alignItems: 'center', marginTop: SPACING.lg },
  scoreValue: { fontSize: 48, fontWeight: '700', color: '#FFF' },
  scoreLabel: { fontSize: FONTS.sizes.md, color: '#FFF', opacity: 0.8 },
  statsGrid: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg },
  statItem: { flex: 1, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, alignItems: 'center' },
  statValue: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.textPrimary },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2, textAlign: 'center' },
  buttons: { width: '100%', marginTop: SPACING.xl },
});
