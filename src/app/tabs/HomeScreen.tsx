/**
 * Écran d'accueil — liste des visites disponibles avec filtres.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../navigation/types';
import { Tour } from '../../types';
import { TourCard } from '../../components/tour/TourCard';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../utils/constants';
import maraisTour from '../../data/tours/marais-mysteries.json';
import montmartreTour from '../../data/tours/montmartre-boheme.json';

const ALL_TOURS: Tour[] = [maraisTour as unknown as Tour, montmartreTour as unknown as Tour];

const FILTERS = ['all', 'Histoire', 'Art', 'Gastronomie'] as const;

export function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredTours = useMemo(() => {
    if (activeFilter === 'all') return ALL_TOURS;
    return ALL_TOURS.filter((tour) => tour.theme === activeFilter);
  }, [activeFilter]);

  const handlePress = useCallback((tourId: string) => {
    navigation.navigate('TourDetail', { tourId });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('home.title')}</Text>
        <Text style={styles.subtitle}>{t('home.subtitle')}</Text>

        {/* Bouton de démo */}
        <TouchableOpacity
          style={styles.demoButton}
          onPress={() => navigation.navigate('DemoImmersive')}
        >
          <Text style={styles.demoButtonText}>🎧 TESTER L'EXPÉRIENCE AUDIO</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, activeFilter === f && styles.chipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>
              {f === 'all' ? t('home.filterAll') : f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredTours}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TourCard tour={item} onPress={() => handlePress(item.id)} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
        ListEmptyComponent={<Text style={styles.empty}>{t('home.noTours')}</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  title: { fontSize: FONTS.sizes.title, fontWeight: '700', color: COLORS.textPrimary },
  subtitle: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: 2 },
  filters: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, gap: SPACING.sm },
  chip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.round, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  chipTextActive: { color: '#FFF' },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  empty: { textAlign: 'center', marginTop: SPACING.xxl, fontSize: FONTS.sizes.md, color: COLORS.textLight },
  demoButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  demoButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: '#FFF',
  },
});
