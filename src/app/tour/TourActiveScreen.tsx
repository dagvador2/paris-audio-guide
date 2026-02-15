/**
 * Écran principal pendant une visite active.
 * Carte plein écran avec bottom sheet glissant (map + contenu).
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../navigation/types';
import { useActiveTour } from '../../hooks/useActiveTour';
import { useTourStore } from '../../stores/useTourStore';
import { TourMapView } from '../../components/map/TourMapView';
import { TourBottomSheet } from '../../components/tour/TourBottomSheet';
import { COLORS } from '../../utils/constants';

export function TourActiveScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tourStore = useTourStore();
  const {
    tour, mode, progress, activeCheckpointIndex, nextCheckpoint, totalCheckpoints,
    isLastCheckpoint, isNavigating, userLocation, distanceToNext, gpsError,
    abandonTour, completeTour,
  } = useActiveTour();

  const prevReachedCount = useRef(0);
  const bottomSheetControlsRef = useRef<{ snapToIndex: (index: number) => void } | null>(null);
  const [currentCheckpoint, setCurrentCheckpoint] = useState<any>(null);

  // Update current checkpoint when new checkpoint is reached
  useEffect(() => {
    if (!progress || !tour) return;
    const currentCount = progress.checkpointsReached.length;

    if (currentCount > prevReachedCount.current && currentCount > 0) {
      const lastReached = progress.checkpointsReached[currentCount - 1];
      const checkpoint = tour.checkpoints.find(cp => cp.id === lastReached.checkpointId);

      if (checkpoint) {
        setCurrentCheckpoint(checkpoint);

        // Open bottom sheet to FULL if checkpoint has immersive experience
        if (checkpoint.content.immersiveExperience) {
          bottomSheetControlsRef.current?.snapToIndex(2); // FULL position
        } else {
          // Navigate to Checkpoint screen for classic experience
          navigation.navigate('Checkpoint', {
            tourId: tour.id,
            checkpointId: checkpoint.id,
          });
        }
      }
    }
    prevReachedCount.current = currentCount;
  }, [progress?.checkpointsReached.length, tour, navigation]);

  // Navigate to complete screen when all checkpoints reached
  useEffect(() => {
    if (isLastCheckpoint && progress && progress.checkpointsReached.length === totalCheckpoints) {
      completeTour();
      navigation.navigate('TourComplete', { tourId: tour?.id ?? '' });
    }
  }, [isLastCheckpoint, progress?.checkpointsReached.length]);

  if (!tour || !progress) return null;

  const reachedIds = progress.checkpointsReached.map((cp) => cp.checkpointId);

  const handleImmersiveComplete = () => {
    if (currentCheckpoint) {
      tourStore.markAudioListened(currentCheckpoint.id);
    }
  };

  const handleImmersiveQuizAnswered = (quizId: string, correct: boolean, responseTimeMs: number) => {
    // Store quiz results (can be enhanced later)
    console.log('Quiz answered:', { quizId, correct, responseTimeMs });
  };

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
      {/* Carte plein écran */}
      <TourMapView
        checkpoints={tour.checkpoints}
        reachedCheckpointIds={reachedIds}
        activeCheckpointIndex={activeCheckpointIndex}
        userLocation={userLocation}
        mode={mode ?? 'escape_game'}
        bottomSheetPeekHeight={100} // Height of peek bar
      />

      {/* Bottom Sheet glissant */}
      <TourBottomSheet
        tour={tour}
        mode={mode ?? 'escape_game'}
        progress={progress}
        activeCheckpointIndex={activeCheckpointIndex}
        nextCheckpoint={nextCheckpoint}
        totalCheckpoints={totalCheckpoints}
        distanceToNext={distanceToNext}
        gpsError={gpsError}
        onAbandonTour={handleAbandon}
        immersiveExperience={currentCheckpoint?.content.immersiveExperience}
        onImmersiveComplete={handleImmersiveComplete}
        onImmersiveQuizAnswered={handleImmersiveQuizAnswered}
        onBottomSheetReady={(controls) => {
          bottomSheetControlsRef.current = controls;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
});
