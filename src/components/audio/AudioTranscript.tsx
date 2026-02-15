/**
 * Transcription audio défilante avec auto-scroll et blocage du futur.
 * Affiche les segments révélés progressivement avec les images inline.
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { AudioTranscriptSegment, AudioContextImage } from '../../types';
import { TranscriptBubble } from './TranscriptBubble';
import { InlineImage } from './InlineImage';
import { COLORS, SPACING } from '../../utils/constants';

interface AudioTranscriptProps {
  segments: AudioTranscriptSegment[];
  activeImages: AudioContextImage[];
  autoScrollEnabled: boolean;
  scrollLockFuture: boolean;
}

export function AudioTranscript({
  segments,
  activeImages,
  autoScrollEnabled,
  scrollLockFuture,
}: AudioTranscriptProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const lastSegmentCountRef = useRef(segments.length);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-scroll vers le bas quand nouveau segment apparaît
  useEffect(() => {
    if (segments.length > lastSegmentCountRef.current) {
      lastSegmentCountRef.current = segments.length;

      // Auto-scroll seulement si user n'a pas scrollé manuellement
      if (!userScrolled && autoScrollEnabled) {
        // Petit délai pour laisser le composant se render
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    }
  }, [segments.length, userScrolled, autoScrollEnabled]);

  // Détecter scroll manuel
  const handleScrollBeginDrag = () => {
    setUserScrolled(true);

    // Réactiver auto-scroll après 5 secondes d'inactivité
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setUserScrolled(false);
    }, 5000);
  };

  // Bloquer scroll vers le futur (optionnel)
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Note: Le blocage strict du scroll est difficile à implémenter sans affecter l'UX
    // Pour l'instant, on laisse le scroll libre mais on pourrait ajouter un indicateur visuel
  };

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Organiser segments et images par ordre chronologique
  const renderItems = () => {
    const items: JSX.Element[] = [];

    segments.forEach((segment, index) => {
      // Ajouter le segment
      items.push(
        <TranscriptBubble
          key={segment.id}
          segment={segment}
          index={index}
        />
      );

      // Ajouter les images inline qui se déclenchent pendant ce segment
      const segmentImages = activeImages.filter(
        (img) =>
          img.position === 'inline' &&
          img.triggerTimeMillis >= segment.startTimeMillis &&
          img.triggerTimeMillis < segment.endTimeMillis
      );

      segmentImages.forEach((img) => {
        items.push(<InlineImage key={img.id} image={img} />);
      });
    });

    return items;
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      onScrollBeginDrag={handleScrollBeginDrag}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={true}
    >
      {renderItems()}
      {/* Espace en bas pour le bouton play/pause */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  bottomSpacer: {
    height: 100, // Espace pour AudioControls
  },
});
