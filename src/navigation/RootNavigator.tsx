/**
 * Navigateur racine de l'application.
 * Stack principal avec les onglets et les écrans de visite.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { TourDetailScreen } from '../app/tour/TourDetailScreen';
import { TourActiveScreen } from '../app/tour/TourActiveScreen';
import { TourCompleteScreen } from '../app/tour/TourCompleteScreen';
import { CheckpointScreen } from '../app/checkpoint/CheckpointScreen';
import { RootStackParamList } from './types';
import { COLORS } from '../utils/constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen
        name="TourDetail"
        component={TourDetailScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="TourActive"
        component={TourActiveScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="TourComplete"
        component={TourCompleteScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen
        name="Checkpoint"
        component={CheckpointScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
