/**
 * Cercle visuel de geofencing sur la carte.
 * Indique le rayon de déclenchement d'un checkpoint.
 */

import React from 'react';
import { Circle } from 'react-native-maps';
import { GeoPoint } from '../../types';
import { COLORS } from '../../utils/constants';

interface GeofenceCircleProps {
  center: GeoPoint;
  radius: number;
  fillColor?: string;
  strokeColor?: string;
}

export function GeofenceCircle({
  center,
  radius,
  fillColor = 'rgba(196, 147, 63, 0.15)',
  strokeColor = COLORS.checkpointNext,
}: GeofenceCircleProps) {
  return (
    <Circle
      center={{
        latitude: center.latitude,
        longitude: center.longitude,
      }}
      radius={radius}
      fillColor={fillColor}
      strokeColor={strokeColor}
      strokeWidth={2}
    />
  );
}
