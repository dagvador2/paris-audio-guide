# CLAUDE.md — Paris Audio Guide

## Projet

Application mobile React Native (Expo) — guide audio gamifié géolocalisé pour des visites touristiques à Paris. Voir le fichier `paris-audio-guide-spec.md` pour la spécification complète.

---

## MCP Server : 21st.dev Magic

Ce projet utilise le serveur MCP **21st.dev Magic** pour générer des composants UI de qualité professionnelle. Claude Code doit l'utiliser systématiquement pour créer et améliorer les composants d'interface.

### Installation

```bash
# Ajouter le serveur MCP à Claude Code (scope user = disponible sur tous les projets)
claude mcp add magic --scope user \
  --env API_KEY="VOTRE_CLE_API_ICI" \
  -- npx -y @21st-dev/magic@latest
```

> 🔑 Obtenir une clé API : https://21st.dev/magic/console

### Configuration alternative (fichier `.mcp.json` à la racine du projet)

```json
{
  "mcpServers": {
    "@21st-dev/magic": {
      "command": "npx",
      "args": ["-y", "@21st-dev/magic@latest"],
      "env": {
        "API_KEY": "VOTRE_CLE_API_ICI"
      }
    }
  }
}
```

### Utilisation dans Claude Code

Quand tu travailles sur un composant UI, utilise la commande `/ui` du serveur Magic pour générer des composants de haute qualité. Exemples :

- `/ui create a modern audio player with play/pause, progress bar, and time display`
- `/ui create a gamified checkpoint card with score, badges, and unlock animation`
- `/ui create an interactive map marker with pulse animation and status states`
- `/ui create a vertical timeline component showing tour progress`
- `/ui create a riddle card with multiple choice answers and feedback animation`

**Règle importante** : toujours préférer les composants générés par 21st.dev Magic à des composants écrits manuellement. Ils sont éditables, bien structurés, et suivent les meilleures pratiques de design moderne.

---

## Directives UI / Design

### Identité visuelle

- **Palette principale** : tons chauds parisiens — beige pierre (#F5F0EB), bleu ardoise (#2C3E50), or accent (#C9A84C), rouge discret (#8B3A3A)
- **Palette secondaire** : vert succès (#2ECC71), orange avertissement (#E67E22), gris texte (#4A4A4A)
- **Typographie** : utiliser des polices élégantes et lisibles. Préférer une serif pour les titres (esprit parisien classique) et une sans-serif pour le corps de texte
- **Coins arrondis** : `borderRadius: 12` par défaut sur les cartes, `borderRadius: 8` sur les boutons
- **Ombres** : subtiles, style iOS — `shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8`
- **Espacement** : système de 4px (4, 8, 12, 16, 20, 24, 32, 40, 48)

### Principes de design

1. **Élégance parisienne** : l'UI doit évoquer Paris — sobre, raffinée, jamais criarde. Pas de couleurs néon, pas de gradients agressifs
2. **Lisibilité en extérieur** : les utilisateurs seront dans la rue, souvent en plein soleil. Contraste élevé, textes suffisamment grands (minimum 16px corps de texte), boutons larges (minimum 48px de hauteur)
3. **Navigation une main** : l'utilisateur marche et tient son téléphone d'une main. Les actions principales doivent être accessibles avec le pouce (zone basse de l'écran)
4. **Feedback immédiat** : chaque interaction (checkpoint atteint, bonne réponse, badge débloqué) doit avoir un retour visuel et/ou haptique
5. **Mode carte dominant** : pendant la visite active, la carte occupe au moins 60% de l'écran

### Composants — Directives spécifiques

#### AudioPlayer
- Design inspiré des lecteurs de podcasts modernes (Spotify, Apple Podcasts)
- Barre de progression glissable avec le doigt
- Bouton play/pause proéminent (56px minimum)
- Affichage du temps écoulé / temps total
- Fond légèrement translucide si superposé à la carte
- Utiliser `/ui` de 21st.dev pour la base, puis adapter au thème parisien

#### TourCard (liste des visites)
- Format carte verticale avec image de couverture en haut (ratio 16:9)
- Overlay gradient sombre en bas de l'image pour la lisibilité du titre
- Badges de difficulté, durée, distance en bas
- Animation subtile au tap (scale 0.98)
- Utiliser `/ui` pour générer une card moderne puis personnaliser

#### CheckpointScreen (quand un point est atteint)
- Transition d'entrée spectaculaire (slide up + fade)
- En-tête avec le nom du lieu en grand
- Lecteur audio intégré
- Texte narratif scrollable
- Si énigme : apparition après l'audio (ou après un bouton "Continuer")
- Bouton "Vers le prochain point" toujours visible en bas

#### RiddleCard
- Style quiz élégant — pas gamifié façon enfant
- Options QCM en cartes empilées verticalement
- Feedback : vert + animation confetti légère si correct, rouge + shake si incorrect
- Compteur d'essais restants
- Timer optionnel avec barre de progression circulaire

#### Carte (MapView)
- Style de carte personnalisé (pas le Google Maps par défaut) — préférer un style sobre/clair
- Marqueurs custom : icônes arrondies avec numéro du checkpoint
- Le prochain checkpoint pulse (animation scale loop)
- Les checkpoints atteints ont un check vert
- Trajet en pointillés élégants entre les points
- Position utilisateur avec cercle bleu + halo

#### Badges
- Design de badges circulaires, style médailles/insignes vintage
- Animation de déblocage : apparition avec scale + rotation + particules dorées
- Collection affichée en grille dans le profil

### Animations (react-native-reanimated)

- **Checkpoint atteint** : vibration haptique + flash lumineux sur l'écran + slide-up du contenu
- **Bonne réponse** : confettis légers + score qui incrémente avec animation de compteur
- **Badge débloqué** : modal avec animation de médaille qui tombe + particules
- **Transitions d'écran** : shared element transitions quand possible
- **Marqueur carte** : pulse continu sur le prochain objectif (scale 1.0 → 1.3 → 1.0, loop)

---

## Conventions de code

### TypeScript

- `strict: true` obligatoire
- Tous les composants sont des functional components avec des props typées via `interface`
- Nommer les interfaces `Props` suffixées du nom du composant : `AudioPlayerProps`, `TourCardProps`
- Utiliser des `const` et des arrow functions
- Pas de `any` — jamais

### Fichiers et nommage

- Composants : PascalCase (`AudioPlayer.tsx`)
- Hooks : camelCase préfixé `use` (`useGeofencing.ts`)
- Stores Zustand : camelCase préfixé `use` (`useTourStore.ts`)
- Services : camelCase (`geolocation.ts`)
- Types : PascalCase dans `types/index.ts`
- Données JSON : kebab-case (`marais-mysteries.json`)

### Commentaires

- Chaque fichier commence par un bloc commentaire JSDoc décrivant son rôle
- Les fonctions complexes ont un commentaire d'une ligne au-dessus
- Les constantes magiques sont nommées et commentées

### Internationalisation

- **Aucun texte en dur dans les composants** — tout passe par i18next
- Clés i18n structurées : `home.title`, `tour.start`, `riddle.attempts_remaining`
- Français = langue par défaut, fichier anglais avec structure identique mais valeurs vides

### Structure des imports

```typescript
// 1. React et React Native
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. Bibliothèques externes
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

// 3. Composants internes
import { AudioPlayer } from '@/components/tour/AudioPlayer';

// 4. Stores, hooks, services
import { useTourStore } from '@/stores/useTourStore';
import { useGeofencing } from '@/hooks/useGeofencing';

// 5. Types
import { Checkpoint } from '@/types';

// 6. Constants et utils
import { GEOFENCE_DEFAULT_RADIUS } from '@/utils/constants';
```

---

## Workflow de développement

### Créer un nouveau composant UI

1. **D'abord**, utiliser le MCP 21st.dev Magic via `/ui` pour générer une base de composant de qualité
2. **Ensuite**, adapter le composant au thème parisien (couleurs, typo, espacement)
3. **Puis**, ajouter les props TypeScript et l'internationalisation
4. **Enfin**, ajouter les animations si nécessaire

### Créer un nouvel écran

1. Définir l'interface des props et les données nécessaires
2. Connecter le store Zustand approprié
3. Composer avec les composants UI existants (générés par 21st.dev)
4. Ajouter les clés i18n
5. Tester la navigation

### Ajouter une nouvelle visite

1. Créer un fichier JSON dans `data/tours/` en suivant le format de `marais-mysteries.json`
2. Ajouter les assets audio dans `assets/audio/[nom-visite]/`
3. Ajouter les images dans `assets/images/[nom-visite]/`
4. La visite apparaîtra automatiquement dans la liste (le HomeScreen lit tous les JSON du dossier)

---

## Rappels critiques

- ⚠️ **Le geofencing est le cœur de l'app** — il doit être fiable et économe en batterie
- ⚠️ **L'audio doit fonctionner écran verrouillé** — configurer expo-av pour le background audio
- ⚠️ **Tester avec de vraies coordonnées GPS parisiennes** — le fichier d'exemple utilise le Marais
- ⚠️ **Utiliser 21st.dev Magic pour CHAQUE composant UI** — c'est la priorité pour la qualité visuelle
- ⚠️ **Pas de backend** — tout est local (JSON + AsyncStorage) pour le MVP
- ⚠️ **Accessibilité** : `accessibilityLabel` et `accessibilityRole` sur tous les éléments interactifs
