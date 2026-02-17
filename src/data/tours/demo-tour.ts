/**
 * Visite de démo pour tester sans GPS
 * Tous les checkpoints sont accessibles directement
 */

// NB: structure simplifiée pour la démo, ne suit pas le type Tour complet
export const demoTour = {
  id: 'demo-paris-marais',
  title: 'Démo : Le Marais Historique',
  description: 'Une visite de démonstration pour tester l\'expérience audio immersive',
  difficulty: 'easy',
  estimatedDuration: 15, // 15 minutes pour la démo
  distance: 0, // Pas de distance car pas de GPS
  startLocation: {
    latitude: 48.8566,
    longitude: 2.3522,
    address: 'Place des Vosges, Paris',
  },
  heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
  checkpoints: [
    {
      id: 'demo-checkpoint-1',
      title: 'Place des Vosges',
      description: 'La plus ancienne place de Paris, joyau de l\'architecture française',
      location: {
        latitude: 48.8555,
        longitude: 2.3657,
        address: '1 Place des Vosges, 75004 Paris',
      },
      order: 1,
      radius: 50,
      content: {
        story: 'Inaugurée en 1612 par Louis XIII, la Place des Vosges est un chef-d\'œuvre d\'harmonie architecturale.',
        audioFile: require('../../../assets/audio/demo-place-vosges.mp3'),
        images: [
          {
            uri: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
            caption: 'Place des Vosges',
            credit: 'Photo par Unsplash',
          },
        ],
        funFact: 'Victor Hugo a vécu au numéro 6 de cette place de 1832 à 1848 !',
        immersiveExperience: {
          audioFile: require('../../../assets/audio/demo-place-vosges.mp3'),
          audioDurationMillis: 90000, // 1min30
          autoScrollEnabled: true,
          scrollLockFuture: true,
          transcript: [
            {
              id: 'seg-1',
              startTimeMillis: 0,
              endTimeMillis: 8000,
              text: 'Bienvenue sur la Place des Vosges, la plus ancienne place de Paris.',
              speakerStyle: 'narrator',
            },
            {
              id: 'seg-2',
              startTimeMillis: 8000,
              endTimeMillis: 18000,
              text: 'Inaugurée en 1612 par le roi Louis XIII, elle représente un chef-d\'œuvre de l\'architecture classique française.',
              speakerStyle: 'narrator',
            },
            {
              id: 'seg-3',
              startTimeMillis: 18000,
              endTimeMillis: 28000,
              text: 'Imaginez-vous en 1612... Les carrosses royaux traversent cette place pour la première fois.',
              speakerStyle: 'thought',
            },
            {
              id: 'seg-4',
              startTimeMillis: 28000,
              endTimeMillis: 38000,
              text: 'Les 36 pavillons qui entourent la place sont tous identiques, créant une harmonie parfaite.',
              speakerStyle: 'narrator',
            },
            {
              id: 'seg-5',
              startTimeMillis: 38000,
              endTimeMillis: 50000,
              text: 'Au numéro 6, Victor Hugo a vécu pendant 16 ans. C\'est aujourd\'hui un musée dédié à sa vie et son œuvre.',
              speakerStyle: 'narrator',
            },
            {
              id: 'seg-6',
              startTimeMillis: 50000,
              endTimeMillis: 90000,
              text: 'Cette place a été le théâtre de nombreux événements historiques, des duels aux fêtes royales.',
              speakerStyle: 'narrator',
            },
          ],
          contextImages: [
            {
              id: 'img-1',
              triggerTimeMillis: 28000,
              uri: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
              caption: 'La symétrie parfaite des pavillons',
              position: 'inline',
            },
          ],
          quizzes: [
            {
              id: 'quiz-1',
              triggerTimeMillis: 60000,
              question: 'En quelle année la Place des Vosges a-t-elle été inaugurée ?',
              options: ['1598', '1612', '1650', '1700'],
              correctAnswerIndex: 1,
              explanation: 'La Place des Vosges a été inaugurée en 1612 par Louis XIII lors du mariage d\'Anne d\'Autriche.',
              timerSeconds: 15,
              pauseAudio: true,
              resumeAfterAnswer: true,
            },
          ],
        },
      },
    },
    {
      id: 'demo-checkpoint-2',
      title: 'Hôtel de Sully',
      description: 'Un hôtel particulier du 17ème siècle',
      location: {
        latitude: 48.8553,
        longitude: 2.3635,
        address: '62 Rue Saint-Antoine, 75004 Paris',
      },
      order: 2,
      radius: 50,
      content: {
        story: 'Construit au début du 17ème siècle, cet hôtel particulier est un exemple remarquable de l\'architecture baroque parisienne.',
        audioFile: require('../../../assets/audio/demo-hotel-sully.mp3'),
        images: [
          {
            uri: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
            caption: 'Hôtel de Sully',
            credit: 'Photo par Unsplash',
          },
        ],
        funFact: 'L\'hôtel possède un magnifique jardin secret caché à l\'arrière du bâtiment.',
      },
    },
    {
      id: 'demo-checkpoint-3',
      title: 'Rue des Rosiers',
      description: 'Le cœur historique du quartier juif',
      location: {
        latitude: 48.8575,
        longitude: 2.3596,
        address: 'Rue des Rosiers, 75004 Paris',
      },
      order: 3,
      radius: 50,
      content: {
        story: 'Cette rue emblématique est le centre historique de la communauté juive parisienne depuis le Moyen Âge.',
        audioFile: require('../../../assets/audio/demo-rue-rosiers.mp3'),
        images: [
          {
            uri: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd',
            caption: 'Rue des Rosiers',
            credit: 'Photo par Unsplash',
          },
        ],
        funFact: 'Le fameux falafel de la rue des Rosiers attire des visiteurs du monde entier !',
      },
    },
  ],
  rewards: {
    xp: 100,
    badge: {
      id: 'demo-explorer',
      name: 'Explorateur Démo',
      icon: '🎯',
      description: 'A terminé la visite de démonstration',
    },
  },
  tags: ['demo', 'marais', 'architecture', 'histoire'],
};
