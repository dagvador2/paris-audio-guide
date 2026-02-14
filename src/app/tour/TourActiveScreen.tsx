/**
 * Écran principal pendant une visite active.
 * Carte en haut, progression et infos du prochain checkpoint en bas.
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../navigation/types';
import { useActiveTour } from '../../hooks/useActiveTour';
import { TourMapView } from '../../components/map/TourMapView';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { DirectionIndicator } from '../../components/tour/DirectionIndicator';
import { TourTimeline } from '../../components/tour/TourTimeline';
import { Button } from '../../components/ui/Button';
import { COLORS, SPACING, FONTS } from '../../utils/constants';

export function TourActiveScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    tour, progress, activeCheckpointIndex, nextCheckpoint, totalCheckpoints,
    isLastCheckpoint, isNavigating, userLocation, distanceToNext, gpsError,
    abandonTour, completeTour,
  } = useActiveTour();

  const prevReachedCount = useRef(0);

  // Navigate to Checkpoint screen when new checkpoint reached
  useEffect(() => {
    if (!progress) return;
    const currentCount = progress.checkpointsReached.length;
    if (currentCount > prevReachedCount.current && currentCount > 0) {
      const lastReached = progress.checkpointsReached[currentCount - 1];
      navigation.navigate('Checkpoint', {
        tourId: tour?.id ?? '',
        checkpointId: lastReached.checkpointId,
      });
    }
    prevReachedCount.current = currentCount;
  }, [progress?.checkpointsReached.length]);

  // Navigate to complete screen when all checkpoints reached
  useEffect(() => {
    if (isLastCheckpoint && progress && progress.checkpointsReached.length === totalCheckpoints) {
      completeTour();
      navigation.navigate('TourComplete', { tourId: tour?.id ?? '' });
    }
  }, [isLastCheckpoint, progress?.checkpointsReached.length]);

  if (!tour || !progress) return null;

  const reachedIds = progress.checkpointsReached.map((cp) => cp.checkpointId);
  const progressValue = totalCheckpoints > 0 ? reachedIds.length / totalCheckpoints : 0;

  const handleAbandon = () => {
    Alert.alert(t('tour.abandonTour'), t('tour.abandonConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        style: 'destructive',
        onPress: () => {
          abandonTour();
          navigation.navigate('MainTabs');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Carte */}
      <View style={styles.mapContainer}>
        <TourMapView
          checkpoints={tour.checkpoints}
          reachedCheckpointIds={reachedIds}
          activeCheckpointIndex={activeCheckpointIndex}
          userLocation={userLocation}
        />
      </View>

      {/* Panel info */}
      <ScrollView style={styles.panel} showsVerticalScrollIndicator={false}>
        <ProgressBar progress={progressValue} showLabel />
        <Text style={styles.progressText}>
          {t('tour.checkpoint')} {reachedIds.length} {t('tour.of')} {totalCheckpoints}
        </Text>

        {nextCheckpoint && (
          <View style={styles.nextInfo}>
            <Text style={styles.nextTitle}>{nextCheckpoint.title}</Text>
            <DirectionIndicator distanceMeters={distanceToNext} />
          </View>
        )}

        {gpsError && <Text style={styles.errorText}>{gpsError}</Text>}

        <TourTimeline
          checkpoints={tour.checkpoints}
          reachedCheckpointIds={reachedIds}
          activeIndex={activeCheckpointIndex}
        />

        <View style={styles.abandonContainer}>
          <Button title={t('tour.abandonTour')} onPress={handleAbandon} variant="outline" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  mapContainer: { flex: 1, minHeight: 280 },
  panel: { flex: 1, padding: SPACING.lg },
  progressText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: SPACING.xs, marginBottom: SPACING.md },
  nextInfo: { alignItems: 'center', marginBottom: SPACING.md },
  nextTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  errorText: { color: COLORS.error, fontSize: FONTS.sizes.sm, textAlign: 'center', marginVertical: SPACING.sm },
  abandonContainer: { marginTop: SPACING.lg, marginBottom: SPACING.xxl },
});
