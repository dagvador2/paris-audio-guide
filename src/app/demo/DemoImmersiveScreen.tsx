/**
 * Écran de démo pour tester l'expérience audio immersive.
 * Utilise les vrais assets du Stop 1 : La Chute de Paris.
 */

import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ImmersiveAudioExperience } from '../../components/audio/ImmersiveAudioExperience';
import { stop1Experience } from '../../data/tours/stop1-fall-of-paris';

export function DemoImmersiveScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleComplete = () => {
    console.log('Experience complete!');
  };

  const handleQuizAnswered = (quizId: string, correct: boolean, responseTimeMs: number) => {
    console.log('Quiz answered:', { quizId, correct, responseTimeMs });
  };

  return (
    <View style={styles.container}>
      <ImmersiveAudioExperience
        experience={stop1Experience}
        autoPlay={false}
        onComplete={handleComplete}
        onQuizAnswered={handleQuizAnswered}
      />

      {/* Close button */}
      <TouchableOpacity
        style={[styles.closeButton, { top: insets.top + 8 }]}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D11',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  closeIcon: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.70)',
    fontWeight: '600',
  },
});
