/**
 * Point d'entrée de l'application Paris Audio Guide.
 * Configure la navigation, l'internationalisation et les providers.
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useUserStore } from './src/stores/useUserStore';
import { useTourStore } from './src/stores/useTourStore';
import { COLORS } from './src/utils/constants';
import './src/i18n';

export default function App() {
  const loadUserData = useUserStore((s) => s.loadUserData);
  const loadSavedTour = useTourStore((s) => s.loadSavedTour);

  useEffect(() => {
    loadUserData();
    loadSavedTour();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
