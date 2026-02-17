# Spécification technique — Application "Paris Audio Guide" (Guide audio gamifié de Paris)

## Contexte du projet

Je suis guide touristique professionnel à Paris. Je souhaite créer une application mobile qui permet aux utilisateurs de réaliser mes visites guidées de manière autonome, sous forme de **guide audio gamifié géolocalisé**.

**Principe fondamental** : l'utilisateur choisit une visite (ex : "Les mystères du Marais", "Montmartre bohème"), puis est guidé dans les rues de Paris selon une **trame narrative immersive**. Les contenus audio, textuels et les énigmes se déclenchent **uniquement lorsque l'utilisateur atteint physiquement un point GPS précis** (geofencing).

**Mon rôle ensuite** : je fournirai moi-même tous les assets (fichiers audio de ma voix, images, textes historiques, contenus des énigmes). Tu dois me fournir le **squelette technique complet** prêt à recevoir ces contenus.

---

## Stack technique demandée

- **Framework** : React Native avec Expo (dernière version stable)
- **Langage** : TypeScript
- **Navigation** : React Navigation (stack + tabs)
- **State management** : Zustand
- **Géolocalisation** : expo-location (foreground + background)
- **Audio** : expo-av
- **Stockage local** : AsyncStorage pour la progression utilisateur
- **Cartes** : react-native-maps
- **Animations** : react-native-reanimated
- **Style** : NativeWind (TailwindCSS pour React Native) — si trop complexe à setup, utiliser StyleSheet classique
- **Données des visites** : fichiers JSON locaux (pas de backend pour le MVP)
- **Internationalisation** : i18next + react-i18next (français par défaut, structure prête pour l'anglais)

---

## Architecture de l'application

### Structure des dossiers attendue

```
src/
├── app/                        # Écrans principaux
│   ├── (tabs)/                 # Navigation par onglets
│   │   ├── HomeScreen.tsx      # Liste des visites disponibles
│   │   ├── MapScreen.tsx       # Carte globale de Paris avec les visites
│   │   └── ProfileScreen.tsx   # Profil, progression, badges
│   ├── tour/
│   │   ├── TourDetailScreen.tsx    # Détail d'une visite avant de commencer
│   │   ├── TourActiveScreen.tsx    # Écran principal pendant la visite (carte + progression)
│   │   └── TourCompleteScreen.tsx  # Écran de fin de visite (résumé, score, partage)
│   └── checkpoint/
│       └── CheckpointScreen.tsx    # Écran qui s'affiche quand un point est atteint (audio + contenu + énigme)
├── components/
│   ├── ui/                     # Composants UI réutilisables
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Badge.tsx
│   │   └── Modal.tsx
│   ├── tour/
│   │   ├── TourCard.tsx            # Carte de visite (pour la liste)
│   │   ├── CheckpointMarker.tsx    # Marqueur sur la carte
│   │   ├── AudioPlayer.tsx         # Lecteur audio avec contrôles (play, pause, barre de progression)
│   │   ├── RiddleCard.tsx          # Composant d'affichage d'une énigme
│   │   ├── DirectionIndicator.tsx  # Flèche/boussole vers le prochain point
│   │   └── TourTimeline.tsx        # Timeline verticale de la progression dans la visite
│   └── map/
│       ├── TourMapView.tsx         # Carte de la visite en cours
│       └── GeofenceCircle.tsx      # Cercle visuel autour d'un checkpoint
├── stores/
│   ├── useTourStore.ts         # État de la visite en cours (progression, checkpoints atteints)
│   ├── useUserStore.ts         # Profil utilisateur, badges, historique
│   └── useAudioStore.ts       # État du lecteur audio
├── services/
│   ├── geolocation.ts          # Service de géolocalisation + geofencing
│   ├── audio.ts                # Service de lecture audio
│   ├── notifications.ts        # Notifications locales (quand un checkpoint est atteint)
│   └── scoring.ts              # Calcul du score et des badges
├── data/
│   ├── tours/                  # Un fichier JSON par visite
│   │   ├── marais-mysteries.json
│   │   └── montmartre-boheme.json
│   └── badges.json             # Définition des badges et conditions d'obtention
├── hooks/
│   ├── useGeofencing.ts        # Hook pour détecter l'entrée dans une zone GPS
│   ├── useActiveTour.ts        # Hook pour la logique de visite active
│   └── useAudioPlayer.ts      # Hook pour contrôler l'audio
├── types/
│   └── index.ts                # Tous les types TypeScript
├── utils/
│   ├── distance.ts             # Calcul de distance entre coordonnées GPS (formule de Haversine)
│   ├── formatters.ts           # Formatage de durées, distances, etc.
│   └── constants.ts            # Constantes de l'application
├── i18n/
│   ├── index.ts                # Configuration i18next
│   ├── fr.json                 # Traductions françaises
│   └── en.json                 # Traductions anglaises (structure vide à remplir)
└── assets/
    ├── audio/                  # Mes fichiers audio (vide — je les ajouterai)
    ├── images/                 # Images des visites et checkpoints (vide — je les ajouterai)
    └── fonts/                  # Polices custom si besoin
```

---

## Modèle de données (types TypeScript)

```typescript
// === VISITE (TOUR) ===
interface Tour {
  id: string;
  title: string;                    // "Les mystères du Marais"
  subtitle: string;                 // "Un voyage dans le temps au cœur de Paris"
  description: string;              // Description longue
  coverImage: string;               // Chemin vers l'image de couverture
  duration: number;                 // Durée estimée en minutes
  distance: number;                 // Distance totale en mètres
  difficulty: 'easy' | 'medium' | 'hard';
  theme: string;                    // "Histoire", "Art", "Gastronomie"...
  arrondissements: number[];        // [3, 4] pour le Marais
  startPoint: GeoPoint;            // Point de départ
  checkpoints: Checkpoint[];       // Liste ordonnée des points de passage
  totalPoints: number;             // Score maximum possible
  tags: string[];                  // Pour le filtrage
  available: boolean;              // Visite publiée ou non
}

// === CHECKPOINT (POINT DE PASSAGE) ===
interface Checkpoint {
  id: string;
  tourId: string;
  order: number;                    // Position dans la visite (1, 2, 3...)
  title: string;                    // "La Place des Vosges"
  location: GeoPoint;
  triggerRadius: number;            // Rayon en mètres pour déclencher le contenu (ex: 30m)
  content: CheckpointContent;
  riddle?: Riddle;                  // Optionnel : énigme à résoudre
  points: number;                   // Points gagnés en atteignant ce checkpoint
  bonusPoints?: number;             // Points bonus si l'énigme est résolue
  hint?: string;                    // Indice optionnel pour trouver le lieu
  nextCheckpointHint?: string;      // Indice narratif vers le prochain point
}

// === CONTENU D'UN CHECKPOINT ===
interface CheckpointContent {
  audioFile: string;                // Chemin vers le fichier audio
  audioDuration: number;            // Durée de l'audio en secondes
  title: string;                    // Titre affiché
  narrativeText: string;            // Texte narratif (résumé ou transcription)
  historicalFact?: string;          // Anecdote historique courte
  images?: ContentImage[];          // Images associées (photos, illustrations)
  funFact?: string;                 // "Le saviez-vous ?"
}

interface ContentImage {
  uri: string;
  caption: string;
  credit?: string;                  // Crédit photo
}

// === ÉNIGME ===
interface Riddle {
  id: string;
  type: 'multiple_choice' | 'text_input' | 'photo_spot' | 'observation';
  question: string;                 // "Combien de fenêtres compte la façade ?"
  hint?: string;                    // "Regardez bien le 2ème étage..."
  
  // Pour multiple_choice
  options?: string[];               // ["9", "12", "16", "20"]
  correctAnswerIndex?: number;      // 2 (= "16")
  
  // Pour text_input
  acceptedAnswers?: string[];       // ["16", "seize", "Seize"]
  
  // Pour photo_spot (l'utilisateur doit prendre une photo d'un élément)
  photoPrompt?: string;             // "Prenez en photo la sculpture au-dessus de la porte"
  
  // Pour observation (l'utilisateur doit trouver un détail)
  observationPrompt?: string;       // "Trouvez le blason caché sur la façade"
  
  explanation: string;              // Explication après réponse
  explanationAudio?: string;        // Audio d'explication optionnel
  maxAttempts: number;              // Nombre d'essais (ex: 3)
  timeLimitSeconds?: number;        // Limite de temps optionnelle
}

// === GÉOLOCALISATION ===
interface GeoPoint {
  latitude: number;
  longitude: number;
  address?: string;                 // "Place des Vosges, 75004 Paris"
  name?: string;                    // Nom du lieu
}

// === PROGRESSION UTILISATEUR ===
interface UserProgress {
  oderId: string;
  startedAt: string;                // ISO date
  completedAt?: string;
  checkpointsReached: CheckpointProgress[];
  totalScore: number;
  riddlesCorrect: number;
  riddlesTotal: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  elapsedTimeMinutes: number;
  distanceWalkedMeters: number;
}

interface CheckpointProgress {
  checkpointId: string;
  reachedAt: string;                // ISO date
  audioListened: boolean;
  riddleSolved?: boolean;
  riddleAttempts?: number;
  pointsEarned: number;
}

// === BADGES / GAMIFICATION ===
interface Badge {
  id: string;
  title: string;                    // "Explorateur du Marais"
  description: string;              // "Terminer la visite du Marais"
  icon: string;                     // Chemin vers l'icône
  condition: BadgeCondition;
  unlockedAt?: string;              // ISO date
}

interface BadgeCondition {
  type: 'tour_completed' | 'tours_count' | 'riddles_streak' | 'distance_total' | 'perfect_score' | 'speed_run';
  tourId?: string;                  // Pour les badges liés à une visite spécifique
  value?: number;                   // Seuil (ex: 5 visites, 10km...)
}
```

---

## Fonctionnalités clés à implémenter

### 1. Système de géofencing (CŒUR DE L'APP)

C'est la fonctionnalité la plus importante. Le service `geolocation.ts` et le hook `useGeofencing.ts` doivent :

- Suivre la position GPS de l'utilisateur en continu (foreground)
- Comparer en permanence la position avec le prochain checkpoint attendu
- Utiliser la **formule de Haversine** pour calculer la distance
- **Déclencher un événement** quand l'utilisateur entre dans le rayon (`triggerRadius`) d'un checkpoint
- Gérer les cas limites : GPS imprécis (ajouter un buffer), perte de signal, permissions refusées
- Afficher la distance restante vers le prochain checkpoint
- Pouvoir fonctionner en arrière-plan (optionnel pour le MVP, mais prévoir l'architecture)
- **Ne jamais déclencher deux fois le même checkpoint**

### 2. Lecteur audio

Le composant `AudioPlayer.tsx` et le service `audio.ts` doivent :

- Lire des fichiers audio locaux (MP3 ou M4A)
- Afficher : bouton play/pause, barre de progression, temps écoulé / durée totale
- Supporter la lecture en arrière-plan (l'utilisateur peut verrouiller son téléphone)
- Auto-play quand un checkpoint est atteint (configurable)
- Pouvoir mettre en pause et reprendre
- Gérer les interruptions (appel téléphonique, notification)

### 3. Carte interactive

L'écran `TourActiveScreen.tsx` avec `TourMapView.tsx` doit afficher :

- La position de l'utilisateur en temps réel
- Le tracé du parcours (polyline entre les checkpoints)
- Les checkpoints sous forme de marqueurs distincts :
  - Grisé/verrouillé = pas encore atteint
  - En surbrillance/pulsant = prochain objectif
  - Vert/coché = atteint
- Les cercles de geofencing (rayon de déclenchement) autour du prochain checkpoint
- Un bouton pour recentrer la carte sur l'utilisateur
- Le style de carte doit être sobre et élégant (pas le style Google Maps par défaut)

### 4. Système d'énigmes

Le composant `RiddleCard.tsx` doit gérer :

- **QCM** : 4 boutons de réponse, feedback visuel (vert/rouge), animation
- **Saisie texte** : champ de réponse avec validation souple (accents, majuscules, etc.)
- **Photo spot** : déclenchement de l'appareil photo (juste la capture, pas d'IA de vérification — validation manuelle "J'ai trouvé !")
- **Observation** : description de ce qu'il faut trouver + bouton "J'ai trouvé !"
- Nombre d'essais limité avec compteur
- Affichage de l'explication après la réponse (avec audio optionnel)
- Attribution des points bonus

### 5. Système de progression et gamification

Le store `useTourStore.ts` et le service `scoring.ts` doivent :

- Suivre la progression checkpoint par checkpoint
- Calculer le score en temps réel (points de base + bonus énigmes)
- Persister la progression dans AsyncStorage (reprendre une visite interrompue)
- Gérer les badges (déblocage automatique quand les conditions sont remplies)
- Afficher un résumé de fin de visite : score, temps, distance, énigmes résolues
- Historique des visites terminées dans le profil

### 6. Navigation et UX

- **Onglet Accueil** : liste des visites en cartes attractives, filtrage par thème/durée/difficulté
- **Onglet Carte** : carte de Paris avec les points de départ de toutes les visites
- **Onglet Profil** : statistiques (visites, distance totale, score cumulé), badges, historique
- **Détail d'une visite** : description, carte du parcours, durée/distance, bouton "Commencer"
- **Visite active** : carte en haut, infos du prochain checkpoint en bas, barre de progression
- **Checkpoint atteint** : transition animée, lecture audio, contenu textuel, puis énigme si applicable, puis indice vers le prochain point

---

## Fichier JSON d'exemple pour une visite

Crée un fichier d'exemple complet `data/tours/marais-mysteries.json` avec :

- 5 checkpoints réalistes dans le Marais (utilise de vraies coordonnées GPS)
- Des contenus placeholder réalistes (textes en français)
- Au moins 2 énigmes de types différents
- Des points et bonus cohérents

Voici des lieux à utiliser pour l'exemple :
1. Place des Vosges (départ)
2. Maison de Victor Hugo
3. Hôtel de Sully
4. Rue des Rosiers
5. Musée Carnavalet

---

## Configuration et fichiers racine

Génère aussi :

- `app.json` / `app.config.ts` : configuration Expo avec permissions GPS, audio background
- `tsconfig.json` : configuration TypeScript
- `package.json` : avec toutes les dépendances nécessaires
- Un fichier `README.md` expliquant comment lancer le projet, la structure, et comment ajouter une nouvelle visite
- `.env.example` : pour la clé API Google Maps (react-native-maps)

---

## Contraintes et bonnes pratiques

1. **Tout le code doit être en TypeScript strict** (`strict: true`)
2. **Pas de backend** : tout est local pour le MVP (JSON + AsyncStorage)
3. **Les textes de l'interface** doivent passer par i18n (jamais de texte en dur dans les composants)
4. **Chaque composant** doit avoir des props bien typées et des valeurs par défaut
5. **Le code doit être commenté** : chaque fichier commence par un commentaire décrivant son rôle
6. **Architecture modulaire** : il doit être facile d'ajouter une nouvelle visite en créant simplement un fichier JSON
7. **Les assets audio et images sont des placeholders** : utilise des chemins comme `assets/audio/marais/checkpoint-1.mp3` mais ne crée pas les fichiers — je les ajouterai
8. **Responsive** : l'app doit fonctionner sur iPhone et Android
9. **Performance** : la géolocalisation ne doit pas drainer la batterie excessivement — utilise des intervalles raisonnables
10. **Accessibilité** : ajoute les labels d'accessibilité de base (accessibilityLabel, accessibilityRole)

---

## Ce que je veux en sortie

Un projet Expo complet et fonctionnel avec :

- Tous les fichiers de la structure ci-dessus, avec du code TypeScript réel (pas de TODO/placeholder dans la logique)
- La navigation complète entre tous les écrans
- Le système de geofencing fonctionnel
- Le lecteur audio fonctionnel
- Le système d'énigmes fonctionnel
- Le scoring et les badges fonctionnels
- La persistance de la progression
- Le fichier JSON d'exemple de la visite du Marais
- Un README clair

**Je me charge ensuite de** : remplacer les textes placeholder, enregistrer et ajouter mes fichiers audio, ajouter mes images, créer les JSON des autres visites, personnaliser le design (couleurs, polices, logo).

---

## Résumé des priorités

| Priorité | Fonctionnalité |
|----------|---------------|
| 🔴 Critique | Géofencing + déclenchement des checkpoints |
| 🔴 Critique | Lecteur audio |
| 🔴 Critique | Navigation entre les écrans |
| 🟠 Importante | Système d'énigmes (4 types) |
| 🟠 Importante | Scoring + badges |
| 🟡 Souhaitable | Carte interactive avec marqueurs |
| 🟡 Souhaitable | Animations et transitions |
| 🟢 Bonus | Mode hors-ligne complet |
| 🟢 Bonus | Partage social du score |
