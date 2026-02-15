/**
 * Bottom Sheet glissant pour l'écran de visite active.
 * Gère 3 positions : MINI (peek bar), MEDIUM (contenu essentiel), FULL (tout le contenu).
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Checkpoint, TourMode, UserProgress, ImmersiveAudioExperience } from '../../types';
import { BottomSheetPeekBar } from './BottomSheetPeekBar';
import { BottomSheetContent } from './BottomSheetContent';
import { ImmersiveAudioExperience as ImmersiveAudioExperienceComponent } from '../audio/ImmersiveAudioExperience';
import { COLORS } from '../../utils/constants';

interface TourBottomSheetProps {
  tour: {
    id: string;
    checkpoints: Checkpoint[];
  };
  mode: TourMode;
  progress: UserProgress;
  activeCheckpointIndex: number;
  nextCheckpoint: Checkpoint | null;
  totalCheckpoints: number;
  distanceToNext: number | null;
  gpsError: string | null;
  onAbandonTour: () => void;
  // Audio props (optional)
  currentAudioFile?: string;
  currentAudioDuration?: number;
  onAudioComplete?: () => void;
  // Immersive experience (optional)
  immersiveExperience?: ImmersiveAudioExperience;
  onImmersiveComplete?: () => void;
  onImmersiveQuizAnswered?: (quizId: string, correct: boolean, responseTimeMs: number) => void;
  // Callback to expose bottom sheet controls
  onBottomSheetReady?: (controls: { snapToIndex: (index: number) => void }) => void;
}

export function TourBottomSheet({
  tour,
  mode,
  progress,
  activeCheckpointIndex,
  nextCheckpoint,
  totalCheckpoints,
  distanceToNext,
  gpsError,
  onAbandonTour,
  currentAudioFile,
  currentAudioDuration,
  onAudioComplete,
  immersiveExperience,
  onImmersiveComplete,
  onImmersiveQuizAnswered,
  onBottomSheetReady,
}: TourBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Expose bottom sheet controls to parent
  useEffect(() => {
    if (onBottomSheetReady && bottomSheetRef.current) {
      onBottomSheetReady({
        snapToIndex: (index: number) => bottomSheetRef.current?.snapToIndex(index),
      });
    }
  }, [onBottomSheetReady]);

  // Define snap points: MINI (15%), MEDIUM (60%), FULL (90%)
  const snapPoints = useMemo(() => ['15%', '60%', '90%'], []);

  // Current checkpoint number (1-indexed)
  const currentCheckpointNumber = progress.checkpointsReached.length + 1;
  const reachedIds = progress.checkpointsReached.map(cp => cp.checkpointId);

  // Handle tap on peek bar to open to MEDIUM
  const handlePeekBarTap = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(1); // MEDIUM
  }, []);

  // Render backdrop for FULL position (optional - makes map slightly dim)
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={1}
        appearsOnIndex={2}
        opacity={0.3}
      />
    ),
    []
  );

  // Render content based on current index
  const renderContent = useCallback(
    (index: number) => {
      if (index === 0) {
        // MINI: Show peek bar
        return (
          <BottomSheetPeekBar
            currentCheckpointNumber={currentCheckpointNumber}
            totalCheckpoints={totalCheckpoints}
            distanceMeters={distanceToNext}
            nextCheckpointTitle={nextCheckpoint?.title}
            mode={mode}
            gpsError={gpsError}
            onTap={handlePeekBarTap}
          />
        );
      } else if (index === 2 && immersiveExperience) {
        // FULL: Show immersive experience if available
        return (
          <ImmersiveAudioExperienceComponent
            experience={immersiveExperience}
            autoPlay={false} // Will be triggered externally
            onComplete={onImmersiveComplete}
            onQuizAnswered={onImmersiveQuizAnswered}
          />
        );
      } else {
        // MEDIUM or FULL (classic): Show content
        const position = index === 1 ? 'medium' : 'full';
        return (
          <BottomSheetContent
            position={position}
            checkpoints={tour.checkpoints}
            reachedCheckpointIds={reachedIds}
            activeCheckpointIndex={activeCheckpointIndex}
            nextCheckpoint={nextCheckpoint}
            distanceToNext={distanceToNext}
            currentCheckpointNumber={currentCheckpointNumber}
            totalCheckpoints={totalCheckpoints}
            mode={mode}
            onAbandonTour={onAbandonTour}
            currentAudioFile={currentAudioFile}
            currentAudioDuration={currentAudioDuration}
            onAudioComplete={onAudioComplete}
          />
        );
      }
    },
    [
      currentCheckpointNumber,
      totalCheckpoints,
      distanceToNext,
      nextCheckpoint,
      mode,
      gpsError,
      tour.checkpoints,
      reachedIds,
      activeCheckpointIndex,
      onAbandonTour,
      currentAudioFile,
      currentAudioDuration,
      onAudioComplete,
      immersiveExperience,
      onImmersiveComplete,
      onImmersiveQuizAnswered,
      handlePeekBarTap,
    ]
  );

  // Track current index to render appropriate content
  const [currentIndex, setCurrentIndex] = React.useState(0);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0} // Start at MINI position
      snapPoints={snapPoints}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={false}
      onChange={setCurrentIndex}
    >
      <View style={styles.contentContainer}>
        {renderContent(currentIndex)}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: COLORS.surface,
  },
  handleIndicator: {
    backgroundColor: COLORS.border,
    width: 40,
    height: 4,
  },
  contentContainer: {
    flex: 1,
  },
});
