# Guide : Générer l'Audio de Démo

Tu as 3 options, du plus simple au plus avancé.

---

## ✅ OPTION 1 : TTSMaker.com (RECOMMANDÉ - GRATUIT, AUCUN CODE)

**La plus simple**, pas besoin d'API ni de configuration.

### Étapes :

1. Va sur **https://ttsmaker.com**

2. Copie-colle ce texte dans le champ :
   ```
   Bienvenue sur la Place des Vosges, la plus ancienne place de Paris.
   Inaugurée en 1612 par le roi Louis XIII, elle représente un chef-d'œuvre de l'architecture classique française.
   Imaginez-vous en 1612... Les carrosses royaux traversent cette place pour la première fois.
   Les 36 pavillons qui entourent la place sont tous identiques, créant une harmonie parfaite.
   Au numéro 6, Victor Hugo a vécu pendant 16 ans. C'est aujourd'hui un musée dédié à sa vie et son œuvre.
   Cette place a été le théâtre de nombreux événements historiques, des duels aux fêtes royales.
   ```

3. Sélectionne :
   - **Langue** : Français
   - **Voix** : Choisis une voix féminine (Denise) ou masculine (Henri)
   - **Vitesse** : 0.95 (légèrement ralentie)

4. Clique sur **"Convert to Speech"**

5. Télécharge le fichier MP3

6. Renomme-le en **`demo-place-des-vosges.mp3`**

7. Place-le dans **`assets/audio/demo-place-des-vosges.mp3`**
   ```bash
   mkdir -p assets/audio
   mv ~/Downloads/demo-place-des-vosges.mp3 assets/audio/
   ```

8. Modifie **`src/app/demo/DemoImmersiveScreen.tsx`** :
   ```typescript
   audioFile: require('../../../assets/audio/demo-place-des-vosges.mp3'),
   ```

9. Rebuild l'app Android :
   ```bash
   eas build --profile development --platform android
   ```

---

## OPTION 2 : ElevenLabs (MEILLEURE QUALITÉ)

Utilise le script créé :

```bash
# 1. Installe les dépendances
npm install dotenv

# 2. Crée un compte sur https://elevenlabs.io (gratuit : 10k caractères/mois)

# 3. Obtiens ta clé API

# 4. Crée un fichier .env à la racine du projet
echo "ELEVENLABS_API_KEY=ta_cle_ici" > .env

# 5. Exécute le script
node scripts/generate-audio-elevenlabs.js
```

---

## OPTION 3 : Google Cloud TTS (PRODUCTION)

Pour une qualité maximale :

```bash
# 1. Installe les dépendances
npm install @google-cloud/text-to-speech

# 2. Configure Google Cloud (guide : https://cloud.google.com/text-to-speech/docs/quickstart-client-libraries)

# 3. Exécute le script
node scripts/generate-demo-audio.js
```

---

## 🎤 OPTION 4 : Enregistre-toi toi-même !

Pour une touche vraiment personnelle :

1. Utilise **QuickTime Player** (Mac) ou **Audacity** (Windows/Mac/Linux)
2. Enregistre-toi en lisant le texte
3. Exporte en MP3
4. Place le fichier dans `assets/audio/demo-place-des-vosges.mp3`

---

## 📝 Après avoir généré l'audio

Une fois le fichier MP3 créé et placé dans `assets/audio/` :

1. **Modifie le chemin dans DemoImmersiveScreen.tsx** :
   ```typescript
   // Remplace l'URL temporaire par :
   audioFile: require('../../../assets/audio/demo-place-des-vosges.mp3'),
   ```

2. **OU** utilise une URI si le fichier est dans les assets Expo :
   ```typescript
   audioFile: 'demo-place-des-vosges',
   ```
   Et modifie `useAudioPlayer.ts` pour charger depuis `assets/audio/`.

3. **Rebuild l'app** (car les assets sont compilés dans le build) :
   ```bash
   eas build --profile development --platform android
   ```

4. **Ou pour tester plus vite**, utilise une URL temporaire :
   - Upload ton MP3 sur https://file.io ou https://tmpfiles.org
   - Utilise l'URL directement dans `audioFile`
   - Rebuild n'est PAS nécessaire dans ce cas

---

## ⚡ Solution Rapide pour Tester MAINTENANT

J'ai déjà mis une URL audio temporaire dans le code. Tu peux tester l'interface immédiatement :

```bash
# Télécharge et installe le nouveau build
# L'URL temporaire dans le code devrait fonctionner
```

**Note** : L'audio est de la musique, pas de la narration, mais cela te permet de tester toute l'interface (bulles, quiz, images) avant de générer le vrai audio.

---

## Besoin d'aide ?

- Pour TTSMaker : https://ttsmaker.com
- Pour ElevenLabs : https://elevenlabs.io
- Pour Google Cloud TTS : https://cloud.google.com/text-to-speech

**Recommandation** : Commence par TTSMaker (Option 1) pour tester rapidement !
