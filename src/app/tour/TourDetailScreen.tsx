/**
 * Écran de détail d'une visite avant de commencer.
 * Affiche la description, les stats, un aperçu carte et le bouton de démarrage.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../navigation/types';
import { Tour, TourMode } from '../../types';
import { useTourStore } from '../../stores/useTourStore';
import { Button } from '../../components/ui/Button';
import { BadgeChip } from '../../components/ui/Badge';
import { formatDistance, formatDuration } from '../../utils/formatters';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../utils/constants';
import maraisTour from '../../data/tours/marais-mysteries.json';
import montmartreTour from '../../data/tours/montmartre-boheme.json';

const ALL_TOURS: Tour[] = [maraisTour as unknown as Tour, montmartreTour as unknown as Tour];

export function TourDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute<RouteProp<RootStackParamList, 'TourDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { startTour, activeTour } = useTourStore();

  const tour = ALL_TOURS.find((t) => t.id === route.params.tourId);
  if (!tour) return <Text>Tour not found</Text>;

  const [selectedMode, setSelectedMode] = useState<TourMode>('escape_game');

  const isInProgress = activeTour?.id === tour.id;
  const difficultyColor = tour.difficulty === 'easy' ? COLORS.success : tour.difficulty === 'medium' ? COLORS.warning : COLORS.error;

  // Calcul de la région englobant tous les checkpoints (aperçu de la zone)
  const lats = tour.checkpoints.map((cp) => cp.location.latitude);
  const lngs = tour.checkpoints.map((cp) => cp.location.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const zoneRegion = {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: (maxLat - minLat) * 1.5 + 0.005,
    longitudeDelta: (maxLng - minLng) * 1.5 + 0.005,
  };

  const handleStart = async () => {
    await startTour(tour, selectedMode);
    navigation.navigate('TourActive', { tourId: tour.id });
  };

  const handleResume = () => {
    navigation.navigate('TourActive', { tourId: tour.id });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🏛</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{tour.title}</Text>
          <Text style={styles.subtitle}>{tour.subtitle}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{formatDuration(tour.duration)}</Text>
              <Text style={styles.statLabel}>{t('tour.duration')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{formatDistance(tour.distance)}</Text>
              <Text style={styles.statLabel}>{t('tour.distance')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{tour.checkpoints.length}</Text>
              <Text style={styles.statLabel}>{t('tour.checkpoints')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{tour.totalPoints}</Text>
              <Text style={styles.statLabel}>{t('tour.points')}</Text>
            </View>
          </View>

          <BadgeChip label={t(`tour.${tour.difficulty}`)} color={difficultyColor} />

          <Text style={styles.description}>{tour.description}</Text>

          {/* Sélection du mode */}
          {!isInProgress && (
            <>
              <Text style={styles.modeTitle}>{t('tour.chooseMode')}</Text>
              <View style={styles.modeContainer}>
                <TouchableOpacity
                  style={[styles.modeCard, selectedMode === 'escape_game' && styles.modeCardSelected]}
                  onPress={() => setSelectedMode('escape_game')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modeIcon}>🧩</Text>
                  <Text style={styles.modeLabel}>{t('tour.escapeGameMode')}</Text>
                  <Text style={styles.modeDescription}>{t('tour.escapeGameDescription')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeCard, selectedMode === 'guided' && styles.modeCardSelected]}
                  onPress={() => setSelectedMode('guided')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modeIcon}>🎧</Text>
                  <Text style={styles.modeLabel}>{t('tour.guidedMode')}</Text>
                  <Text style={styles.modeDescription}>{t('tour.guidedDescription')}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Carte — aperçu de la zone avec point de départ */}
          <MapView
            style={styles.map}
            initialRegion={zoneRegion}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: tour.checkpoints[0].location.latitude,
                longitude: tour.checkpoints[0].location.longitude,
              }}
              title={t('tour.startPoint')}
            />
          </MapView>

          {/* Bouton */}
          <View style={styles.buttonContainer}>
            {isInProgress ? (
              <Button title={t('tour.resumeTour')} onPress={handleResume} variant="secondary" fullWidth />
            ) : (
              <Button title={t('tour.startTour')} onPress={handleStart} fullWidth />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  hero: { height: 200, backgroundColor: COLORS.primaryDark, justifyContent: 'center', alignItems: 'center' },
  heroEmoji: { fontSize: 64 },
  content: { padding: SPACING.lg },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.textPrimary },
  subtitle: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: 4, marginBottom: SPACING.md },
  statsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  stat: { alignItems: 'center' },
  statValue: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.primary },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  description: { fontSize: FONTS.sizes.md, color: COLORS.textPrimary, lineHeight: 24, marginTop: SPACING.md, marginBottom: SPACING.md },
  modeTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.textPrimary, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  modeContainer: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  modeCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center' },
  modeCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  modeIcon: { fontSize: 32, marginBottom: SPACING.xs },
  modeLabel: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.xs, textAlign: 'center' },
  modeDescription: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 18 },
  map: { height: 200, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.lg },
  buttonContainer: { marginTop: SPACING.sm },
});
