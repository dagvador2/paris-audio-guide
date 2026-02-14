/**
 * Écran Carte — vue globale de Paris avec les points de départ des visites.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../navigation/types';
import { Tour } from '../../types';
import { COLORS, SPACING, FONTS, PARIS_CENTER } from '../../utils/constants';
import maraisTour from '../../data/tours/marais-mysteries.json';
import montmartreTour from '../../data/tours/montmartre-boheme.json';

const ALL_TOURS: Tour[] = [maraisTour as unknown as Tour, montmartreTour as unknown as Tour];

export function MapScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('map.title')}</Text>
      </View>
      <MapView
        style={styles.map}
        initialRegion={PARIS_CENTER}
        showsUserLocation
        showsMyLocationButton
      >
        {ALL_TOURS.filter((t) => t.available).map((tour) => (
          <Marker
            key={tour.id}
            coordinate={{
              latitude: tour.startPoint.latitude,
              longitude: tour.startPoint.longitude,
            }}
            title={tour.title}
            description={tour.subtitle}
            onCalloutPress={() => navigation.navigate('TourDetail', { tourId: tour.id })}
          />
        ))}
      </MapView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.textPrimary },
  map: { flex: 1 },
});
