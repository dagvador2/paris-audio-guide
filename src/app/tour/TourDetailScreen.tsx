/**
 * Écran de détail d'une visite avant de commencer.
 * Affiche la description, les stats, un aperçu carte et le bouton de démarrage.
 */

import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../navigation/types';
import { Tour } from '../../types';
import { useTourStore } from '../../stores/useTourStore';
import { Button } from '../../components/ui/Button';
import { BadgeChip } from '../../components/ui/Badge';
import { formatDistance, formatDuration } from '../../utils/formatters';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, MAP_ZOOM_TOUR } from '../../utils/constants';
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

  const isInProgress = activeTour?.id === tour.id;
  const difficultyColor = tour.difficulty === 'easy' ? COLORS.success : tour.difficulty === 'medium' ? COLORS.warning : COLORS.error;

  const routeCoords = tour.checkpoints.map((cp) => ({
    latitude: cp.location.latitude,
    longitude: cp.location.longitude,
  }));

  const handleStart = async () => {
    await startTour(tour);
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

          {/* Carte */}
          {routeCoords.length > 0 && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: routeCoords[0].latitude,
                longitude: routeCoords[0].longitude,
                ...MAP_ZOOM_TOUR,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Polyline coordinates={routeCoords} strokeColor={COLORS.mapRoute} strokeWidth={3} />
              {routeCoords.map((coord, i) => (
                <Marker key={i} coordinate={coord} />
              ))}
            </MapView>
          )}

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
  map: { height: 200, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.lg },
  buttonContainer: { marginTop: SPACING.sm },
});
