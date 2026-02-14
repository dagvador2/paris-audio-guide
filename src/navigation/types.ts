/**
 * Types de navigation pour React Navigation.
 * Définit les paramètres de chaque écran.
 */

export type RootStackParamList = {
  MainTabs: undefined;
  TourDetail: { tourId: string };
  TourActive: { tourId: string };
  TourComplete: { tourId: string };
  Checkpoint: { tourId: string; checkpointId: string };
};

export type TabParamList = {
  Home: undefined;
  Map: undefined;
  Profile: undefined;
};
