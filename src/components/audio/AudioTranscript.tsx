/**
 * Vue scrollable immersive de la transcription audio.
 *
 * Theme sombre, auto-scroll fluide vers le segment actif,
 * images inline et en-tetes de section.
 *
 * Scrolling ameliore :
 *   - Suivi cible du segment actif (pas scrollToEnd brutal)
 *   - Position cible a ~35% du haut pour confort de lecture
 *   - Changement de section : scroll en haut pour masquer le texte precedent
 *   - Delai 350ms pour laisser l'animation d'entree demarrer
 *   - Detection du scroll manuel avec pause de 5s
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import { AudioTranscriptSegment, AudioContextImage } from '../../types';
import { TranscriptBubble } from './TranscriptBubble';
import { InlineImage } from './InlineImage';
import { SPACING } from '../../utils/constants';

const BG = '#0D0D11';
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Normal segments sit at ~35% from top of screen
const SCROLL_TARGET_RATIO = 0.35;

// Section headers scroll to near-top (just below the banner overlay)
const TOP_SPACER_HEIGHT = 110;

interface AudioTranscriptProps {
  segments: AudioTranscriptSegment[];
  activeImages: AudioContextImage[];
  autoScrollEnabled: boolean;
  scrollLockFuture: boolean;
  positionMillis: number;
}

export function AudioTranscript({
  segments,
  activeImages,
  autoScrollEnabled,
  positionMillis,
}: AudioTranscriptProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  // ── Track Y positions of each segment ──────────────────────
  const segmentPositions = useRef<Record<string, number>>({});
  const prevScrollTarget = useRef<string | null>(null);

  const handleSegmentLayout = useCallback(
    (segmentId: string, event: LayoutChangeEvent) => {
      segmentPositions.current[segmentId] = event.nativeEvent.layout.y;
    },
    [],
  );

  // ── Current segment ID ─────────────────────────────────────
  const currentSegmentId = useMemo(() => {
    for (let i = segments.length - 1; i >= 0; i--) {
      const seg = segments[i];
      if (positionMillis >= seg.startTimeMillis && positionMillis < seg.endTimeMillis) {
        return seg.id;
      }
    }
    if (segments.length > 0) {
      const last = segments[segments.length - 1];
      if (positionMillis >= last.endTimeMillis) return null;
    }
    return null;
  }, [segments, positionMillis]);

  // ── Smooth scroll to a segment Y position ──────────────────
  // toTop=true for section changes: header pinned near top of screen
  // toTop=false for normal: segment at comfortable 35% reading position
  const scrollToSegment = useCallback(
    (segmentId: string, delay: number, toTop: boolean) => {
      if (userScrolled || !autoScrollEnabled) return;

      setTimeout(() => {
        const y = segmentPositions.current[segmentId];
        if (y !== undefined) {
          const target = toTop
            ? Math.max(0, y - TOP_SPACER_HEIGHT - 5)
            : Math.max(0, y - SCREEN_HEIGHT * SCROLL_TARGET_RATIO);
          scrollViewRef.current?.scrollTo({ y: target, animated: true });
        } else {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }
      }, delay);
    },
    [userScrolled, autoScrollEnabled],
  );

  // ── Auto-scroll when active segment changes ────────────────
  useEffect(() => {
    const targetId = currentSegmentId ?? segments[segments.length - 1]?.id;
    if (!targetId) return;
    if (targetId === prevScrollTarget.current) return;

    prevScrollTarget.current = targetId;

    // Check if this segment starts a new section
    const targetSeg = segments.find((s) => s.id === targetId);
    const isSectionChange = !!targetSeg?.sectionTitle;

    if (isSectionChange) {
      // Section change: scroll header to top, longer delay for banner transition
      scrollToSegment(targetId, 300, true);
    } else {
      scrollToSegment(targetId, 350, false);
    }
  }, [currentSegmentId, segments, scrollToSegment]);

  // ── Also scroll when a brand new segment is revealed ───────
  const lastSegmentCount = useRef(segments.length);
  useEffect(() => {
    if (segments.length <= lastSegmentCount.current) return;
    lastSegmentCount.current = segments.length;

    if (userScrolled || !autoScrollEnabled) return;

    const newSeg = segments[segments.length - 1];
    if (newSeg && prevScrollTarget.current !== newSeg.id) {
      const isSectionStart = !!newSeg.sectionTitle;
      scrollToSegment(newSeg.id, 400, isSectionStart);
    }
  }, [segments.length, segments, userScrolled, autoScrollEnabled, scrollToSegment]);

  // ── Detect manual scroll ───────────────────────────────────
  const handleScrollBeginDrag = useCallback(() => {
    setUserScrolled(true);

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setUserScrolled(false);
    }, 5000);
  }, []);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // ── Render items (segments + inline images) ────────────────
  const renderItems = useCallback(() => {
    const items: React.JSX.Element[] = [];

    segments.forEach((segment) => {
      let state: 'past' | 'active' = 'past';
      let progress = 1;

      if (segment.id === currentSegmentId) {
        state = 'active';
        const elapsed = positionMillis - segment.startTimeMillis;
        const duration = segment.endTimeMillis - segment.startTimeMillis;
        progress = duration > 0 ? Math.max(0, Math.min(1, elapsed / duration)) : 1;
      }

      items.push(
        <View
          key={`wrap-${segment.id}`}
          onLayout={(e) => handleSegmentLayout(segment.id, e)}
        >
          <TranscriptBubble
            segment={segment}
            state={state}
            progress={progress}
          />
        </View>,
      );

      // Inline images that trigger during this segment
      const segmentImages = activeImages.filter(
        (img) =>
          img.position === 'inline' &&
          img.triggerTimeMillis >= segment.startTimeMillis &&
          img.triggerTimeMillis < segment.endTimeMillis,
      );

      segmentImages.forEach((img) => {
        items.push(<InlineImage key={img.id} image={img} />);
      });
    });

    return items;
  }, [segments, activeImages, currentSegmentId, positionMillis, handleSegmentLayout]);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      onScrollBeginDrag={handleScrollBeginDrag}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      {/* Top spacer for SectionBanner */}
      <View style={styles.topSpacer} />

      {renderItems()}

      {/* Bottom spacer for AudioControls */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },
  topSpacer: {
    height: 110,
  },
  bottomSpacer: {
    height: 140,
  },
});
