/**
 * Script pour générer l'audio de démo avec Google Cloud Text-to-Speech
 *
 * INSTALLATION :
 * npm install @google-cloud/text-to-speech
 *
 * CONFIGURATION :
 * 1. Créer un projet sur https://console.cloud.google.com/
 * 2. Activer l'API Cloud Text-to-Speech
 * 3. Créer une clé de service et télécharger le JSON
 * 4. Définir la variable d'environnement :
 *    export GOOGLE_APPLICATION_CREDENTIALS="chemin/vers/votre/cle.json"
 *
 * UTILISATION :
 * node scripts/generate-demo-audio.js
 */

const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const path = require('path');
const util = require('util');

// Texte de la démo (correspond aux segments de DemoImmersiveScreen)
const demoScript = `
Bienvenue sur la Place des Vosges, la plus ancienne place de Paris.
<break time="1s"/>
Inaugurée en 1612 par le roi Louis XIII, elle représente un chef-d'œuvre de l'architecture classique française.
<break time="1s"/>
Imaginez-vous en 1612... Les carrosses royaux traversent cette place pour la première fois.
<break time="1s"/>
Les 36 pavillons qui entourent la place sont tous identiques, créant une harmonie parfaite.
<break time="1s"/>
Au numéro 6, Victor Hugo a vécu pendant 16 ans. C'est aujourd'hui un musée dédié à sa vie et son œuvre.
<break time="1s"/>
Cette place a été le théâtre de nombreux événements historiques, des duels aux fêtes royales.
`;

async function generateAudio() {
  try {
    // Créer le client TTS
    const client = new textToSpeech.TextToSpeechClient();

    // Configuration de la requête
    const request = {
      input: { ssml: `<speak>${demoScript}</speak>` },
      voice: {
        languageCode: 'fr-FR',
        name: 'fr-FR-Neural2-A', // Voix féminine neurale (haute qualité)
        ssmlGender: 'FEMALE',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.95, // Légèrement ralenti pour une meilleure compréhension
        pitch: 0,
      },
    };

    console.log('🎙️  Génération de l\'audio avec Google Cloud TTS...');

    // Effectuer la requête
    const [response] = await client.synthesizeSpeech(request);

    // Créer le dossier assets/audio si nécessaire
    const audioDir = path.join(__dirname, '..', 'assets', 'audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    // Sauvegarder le fichier audio
    const outputPath = path.join(audioDir, 'demo-place-des-vosges.mp3');
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(outputPath, response.audioContent, 'binary');

    console.log(`✅ Audio généré avec succès : ${outputPath}`);
    console.log('📝 Modifie DemoImmersiveScreen.tsx pour utiliser :');
    console.log('   audioFile: require(\'../../../assets/audio/demo-place-des-vosges.mp3\'),');

  } catch (error) {
    console.error('❌ Erreur lors de la génération de l\'audio :', error);
    console.log('\n💡 ASTUCE : Si tu n\'as pas configuré Google Cloud :');
    console.log('   1. Alternative gratuite : Utilise https://elevenlabs.io (10k caractères/mois gratuits)');
    console.log('   2. Alternative simple : Enregistre-toi avec un micro et sauvegarde le fichier dans assets/audio/');
  }
}

generateAudio();
