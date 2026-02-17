/**
 * Point d'entrée de l'application Paris Audio Guide.
 * Configure la navigation, l'internationalisation et les providers.
 */

import React, { useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { useFonts } from '@expo-google-fonts/oswald/useFonts';
import { Oswald_400Regular } from '@expo-google-fonts/oswald/400Regular';
import { Oswald_500Medium } from '@expo-google-fonts/oswald/500Medium';
import { Oswald_600SemiBold } from '@expo-google-fonts/oswald/600SemiBold';
import { Oswald_700Bold } from '@expo-google-fonts/oswald/700Bold';
import * as SplashScreen from 'expo-splash-screen';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useUserStore } from './src/stores/useUserStore';
import { useTourStore } from './src/stores/useTourStore';
import { COLORS } from './src/utils/constants';
import './src/i18n';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const loadUserData = useUserStore((s) => s.loadUserData);
  const loadSavedTour = useTourStore((s) => s.loadSavedTour);

  const [fontsLoaded] = useFonts({
    Oswald_400Regular,
    Oswald_500Medium,
    Oswald_600SemiBold,
    Oswald_700Bold,
  });

  useEffect(() => {
    loadUserData();
    loadSavedTour();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root} onLayout={onLayoutRootView}>
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
