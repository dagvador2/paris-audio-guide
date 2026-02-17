/**
 * Script pour générer l'audio de démo avec ElevenLabs (PLUS SIMPLE)
 *
 * INSTALLATION :
 * npm install elevenlabs-node
 *
 * CONFIGURATION :
 * 1. Créer un compte sur https://elevenlabs.io (gratuit, 10k caractères/mois)
 * 2. Obtenir votre API key depuis https://elevenlabs.io/speech-synthesis
 * 3. Créer un fichier .env à la racine :
 *    ELEVENLABS_API_KEY=your_api_key_here
 *
 * UTILISATION :
 * node scripts/generate-audio-elevenlabs.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Charge la clé API depuis .env ou demande-la
require('dotenv').config();
const API_KEY = process.env.ELEVENLABS_API_KEY || 'VOTRE_CLE_ICI';

// Texte complet de la démo
const demoText = `
Bienvenue sur la Place des Vosges, la plus ancienne place de Paris.
Inaugurée en 1612 par le roi Louis XIII, elle représente un chef-d'œuvre de l'architecture classique française.
Imaginez-vous en 1612... Les carrosses royaux traversent cette place pour la première fois.
Les 36 pavillons qui entourent la place sont tous identiques, créant une harmonie parfaite.
Au numéro 6, Victor Hugo a vécu pendant 16 ans. C'est aujourd'hui un musée dédié à sa vie et son œuvre.
Cette place a été le théâtre de nombreux événements historiques, des duels aux fêtes royales.
`.trim();

async function generateAudioElevenLabs() {
  console.log('🎙️  Génération de l\'audio avec ElevenLabs...');

  // Voice ID pour la voix française (Rachel - voix féminine)
  // Tu peux changer la voix sur https://elevenlabs.io/voice-library
  const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel (anglais, mais tu peux choisir une voix FR)

  const options = {
    method: 'POST',
    hostname: 'api.elevenlabs.io',
    path: `/v1/text-to-speech/${VOICE_ID}`,
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': API_KEY,
    },
  };

  const postData = JSON.stringify({
    text: demoText,
    model_id: 'eleven_multilingual_v2', // Supporte le français
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.5,
      use_speaker_boost: true,
    },
  });

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const audioBuffer = Buffer.concat(chunks);

          // Créer le dossier assets/audio si nécessaire
          const audioDir = path.join(__dirname, '..', 'assets', 'audio');
          if (!fs.existsSync(audioDir)) {
            fs.mkdirSync(audioDir, { recursive: true });
          }

          // Sauvegarder le fichier
          const outputPath = path.join(audioDir, 'demo-place-des-vosges.mp3');
          fs.writeFileSync(outputPath, audioBuffer);

          console.log(`✅ Audio généré avec succès : ${outputPath}`);
          console.log('\n📝 Modifie DemoImmersiveScreen.tsx :');
          console.log('   audioFile: \'demo-place-des-vosges\',');
          console.log('\nEt ajoute dans useAudioPlayer.ts la logique pour charger depuis assets/audio/');
          resolve(outputPath);
        } else {
          reject(new Error(`Erreur API: ${res.statusCode} - ${Buffer.concat(chunks).toString()}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Exécution
generateAudioElevenLabs()
  .catch((error) => {
    console.error('❌ Erreur :', error.message);
    console.log('\n💡 SOLUTIONS ALTERNATIVES :');
    console.log('   1. Vérifie que ta clé API ElevenLabs est correcte');
    console.log('   2. Essaie Google Cloud TTS : node scripts/generate-demo-audio.js');
    console.log('   3. Enregistre-toi avec un micro et sauvegarde dans assets/audio/demo-place-des-vosges.mp3');
    console.log('   4. Utilise ttsmaker.com (gratuit, pas besoin d\'API) et télécharge le MP3');
  });
