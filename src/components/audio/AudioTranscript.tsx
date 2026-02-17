/**
 * Vue scrollable immersive de la transcription audio.
 *
 * Thème sombre, auto-scroll vers le segment actif,
 * images inline et en-têtes de section.
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { AudioTranscriptSegment, AudioContextImage } from '../../types';
import { TranscriptBubble } from './TranscriptBubble';
import { InlineImage } from './InlineImage';
import { SPACING } from '../../utils/constants';

const BG = '#0D0D11';

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
  const lastSegmentCountRef = useRef(segments.length);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  // ── Auto-scroll when a new segment appears ─────────────────
  useEffect(() => {
    if (segments.length > lastSegmentCountRef.current) {
      lastSegmentCountRef.current = segments.length;

      if (!userScrolled && autoScrollEnabled) {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 120);
      }
    }
  }, [segments.length, userScrolled, autoScrollEnabled]);

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

  // ── Current segment ID ─────────────────────────────────────
  const currentSegmentId = useMemo(() => {
    for (let i = segments.length - 1; i >= 0; i--) {
      const seg = segments[i];
      if (positionMillis >= seg.startTimeMillis && positionMillis < seg.endTimeMillis) {
        return seg.id;
      }
    }
    // If position is past the last segment's end, mark last as current
    if (segments.length > 0) {
      const last = segments[segments.length - 1];
      if (positionMillis >= last.endTimeMillis) return null; // all past
    }
    return null;
  }, [segments, positionMillis]);

  // ── Render items (segments + inline images) ────────────────
  const renderItems = useCallback(() => {
    const items: React.JSX.Element[] = [];

    segments.forEach((segment) => {
      // Determine state
      let state: 'past' | 'active' = 'past';
      let progress = 1;

      if (segment.id === currentSegmentId) {
        state = 'active';
        const elapsed = positionMillis - segment.startTimeMillis;
        const duration = segment.endTimeMillis - segment.startTimeMillis;
        progress = duration > 0 ? Math.max(0, Math.min(1, elapsed / duration)) : 1;
      }

      items.push(
        <TranscriptBubble
          key={segment.id}
          segment={segment}
          state={state}
          progress={progress}
        />
      );

      // Inline images that trigger during this segment
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
  }, [segments, activeImages, currentSegmentId, positionMillis]);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      onScrollBeginDrag={handleScrollBeginDrag}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      {/* Top spacer for breathing room */}
      <View style={styles.topSpacer} />

      {renderItems()}

      {/* Bottom spacer for controls */}
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
    height: 60,
  },
  bottomSpacer: {
    height: 140,
  },
});
