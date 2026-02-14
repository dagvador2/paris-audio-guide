/**
 * Écran Profil — statistiques, badges et historique des visites.
 */

import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../../stores/useUserStore';
import { formatDistance, formatScore, formatDate } from '../../utils/formatters';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';

export function ProfileScreen() {
  const { t } = useTranslation();
  const { completedTours, badges, totalDistance, totalScore } = useUserStore();
  const stats = useUserStore((s) => s.getStats());

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('profile.title')}</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalToursCompleted}</Text>
            <Text style={styles.statLabel}>{t('profile.toursCompleted')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatDistance(totalDistance)}</Text>
            <Text style={styles.statLabel}>{t('profile.totalDistance')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatScore(totalScore)}</Text>
            <Text style={styles.statLabel}>{t('profile.totalScore')}</Text>
          </View>
        </View>

        {/* Badges */}
        <Text style={styles.sectionTitle}>{t('profile.badges')}</Text>
        {badges.length === 0 ? (
          <Text style={styles.emptyText}>{t('profile.noBadges')}</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesRow}>
            {badges.map((badge) => (
              <View key={badge.id} style={styles.badgeCard}>
                <Text style={styles.badgeIcon}>🏆</Text>
                <Text style={styles.badgeTitle} numberOfLines={2}>{badge.title}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Historique */}
        <Text style={styles.sectionTitle}>{t('profile.history')}</Text>
        {completedTours.length === 0 ? (
          <Text style={styles.emptyText}>{t('profile.noHistory')}</Text>
        ) : (
          completedTours.map((tour, i) => (
            <View key={i} style={styles.historyItem}>
              <Text style={styles.historyTour}>{tour.tourId}</Text>
              <Text style={styles.historyMeta}>
                {formatScore(tour.totalScore)} pts • {tour.completedAt ? formatDate(tour.completedAt) : tour.status}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: SPACING.lg },
  title: { fontSize: FONTS.sizes.title, fontWeight: '700', color: COLORS.textPrimary, marginTop: SPACING.md, marginBottom: SPACING.lg },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  statValue: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.primary },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2, textAlign: 'center' },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  emptyText: { fontSize: FONTS.sizes.sm, color: COLORS.textLight, marginBottom: SPACING.lg },
  badgesRow: { gap: SPACING.sm, marginBottom: SPACING.lg },
  badgeCard: { width: 90, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md, padding: SPACING.sm, alignItems: 'center' },
  badgeIcon: { fontSize: 32, marginBottom: 4 },
  badgeTitle: { fontSize: 11, textAlign: 'center', color: COLORS.textPrimary },
  historyItem: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.sm, padding: SPACING.md, marginBottom: SPACING.sm },
  historyTour: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.textPrimary },
  historyMeta: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
});
