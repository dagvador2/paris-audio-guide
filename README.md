# Paris Audio Guide 🏛

Application mobile de guide audio gamifié géolocalisé pour des visites de Paris.

## Principe

L'utilisateur choisit une visite (ex : "Les mystères du Marais"), puis est guidé dans les rues de Paris selon une trame narrative immersive. Les contenus audio, textuels et les énigmes se déclenchent **uniquement lorsqu'il atteint physiquement un point GPS précis** (geofencing).

## Stack technique

- **Framework** : React Native + Expo (TypeScript strict)
- **Navigation** : React Navigation (stack + tabs)
- **State** : Zustand + AsyncStorage
- **Géolocalisation** : expo-location (foreground)
- **Audio** : expo-av (background playback)
- **Cartes** : react-native-maps
- **i18n** : i18next (FR par défaut, EN prêt)

## Lancer le projet

```bash
# Installer les dépendances
npm install

# Lancer le serveur Expo
npx expo start

# Lancer sur iOS
npx expo run:ios

# Lancer sur Android (nécessite clé Google Maps)
npx expo run:android
```

## Configuration Google Maps (Android)

1. Créer une clé API sur [Google Cloud Console](https://console.cloud.google.com/)
2. Activer l'API Maps SDK for Android
3. Remplacer `GOOGLE_MAPS_API_KEY` dans `app.json` > android > config > googleMaps > apiKey

## Structure du projet

```
src/
├── app/                   # Écrans (tabs + tour + checkpoint)
├── components/
│   ├── ui/                # Button, Card, ProgressBar, Badge, Modal
│   ├── tour/              # AudioPlayer, RiddleCard, TourCard, etc.
│   └── map/               # TourMapView, GeofenceCircle
├── stores/                # Zustand (tour, user, audio)
├── services/              # geolocation, audio, scoring, notifications
├── hooks/                 # useGeofencing, useActiveTour, useAudioPlayer
├── data/tours/            # Fichiers JSON des visites
├── types/                 # Types TypeScript
├── utils/                 # distance (Haversine), formatters, constants
├── i18n/                  # Traductions FR/EN
└── assets/                # audio/, images/, fonts/ (à remplir)
```

## Ajouter une nouvelle visite

1. Créer un fichier `src/data/tours/ma-visite.json` en suivant le format de `marais-mysteries.json`
2. Ajouter les coordonnées GPS réelles des checkpoints
3. Définir les contenus (titre, texte narratif, audio file path, énigmes)
4. Importer le JSON dans `HomeScreen.tsx` et `MapScreen.tsx` (tableau `ALL_TOURS`)
5. Ajouter les fichiers audio dans `src/assets/audio/ma-visite/`
6. Ajouter les images dans `src/assets/images/ma-visite/`

## Types d'énigmes supportés

| Type | Description |
|------|------------|
| `multiple_choice` | QCM à 4 options avec feedback visuel |
| `text_input` | Saisie libre avec comparaison insensible aux accents |
| `photo_spot` | Invite à prendre une photo, validation manuelle |
| `observation` | Demande de trouver un détail, bouton "J'ai trouvé" |

## Assets à fournir

Les dossiers suivants sont vides et attendent vos contenus :

- `src/assets/audio/` — Fichiers audio MP3/M4A de votre voix
- `src/assets/images/` — Photos des lieux, illustrations, couvertures
- `src/assets/fonts/` — Polices custom (optionnel)

## Personnalisation

- **Couleurs** : modifier `COLORS` dans `src/utils/constants.ts`
- **Rayon geofencing** : modifier `triggerRadius` dans chaque checkpoint JSON (défaut 30m)
- **Intervalle GPS** : modifier `GPS_UPDATE_INTERVAL` dans constants.ts
