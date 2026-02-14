/**
 * Carte de visite pour la liste d'accueil.
 * Affiche l'image de couverture, le titre, les métadonnées et les tags.
 */

import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Tour } from '../../types';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../utils/constants';
import { formatDistance, formatDuration } from '../../utils/formatters';
import { BadgeChip } from '../ui/Badge';

interface TourCardProps {
  tour: Tour;
  onPress: () => void;
}

export function TourCard({ tour, onPress }: TourCardProps) {
  const { t } = useTranslation();

  const difficultyColor =
    tour.difficulty === 'easy' ? COLORS.success :
    tour.difficulty === 'medium' ? COLORS.warning : COLORS.error;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={tour.title}>
      {/* Image de couverture */}
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageEmoji}>🏛</Text>
        </View>
        {!tour.available && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Bientôt</Text>
          </View>
        )}
      </View>

      {/* Contenu */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{tour.title}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>{tour.subtitle}</Text>

        {/* Métadonnées */}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>⏱ {formatDuration(tour.duration)}</Text>
          <Text style={styles.metaText}>📍 {formatDistance(tour.distance)}</Text>
          <Text style={styles.metaText}>📌 {tour.checkpoints.length} {t('tour.checkpoints').toLowerCase()}</Text>
        </View>

        {/* Tags */}
        <View style={styles.tagsRow}>
          <BadgeChip label={t(`tour.${tour.difficulty}`)} color={difficultyColor} size="sm" />
          <BadgeChip label={tour.theme} color={COLORS.primaryLight} size="sm" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageEmoji: { fontSize: 48 },
  unavailableBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  unavailableText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  content: { padding: SPACING.md },
  title: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  subtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  metaRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.sm },
  metaText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  tagsRow: { flexDirection: 'row', gap: SPACING.xs },
});
