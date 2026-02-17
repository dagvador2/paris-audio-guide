/**
 * Données complètes du Stop 1 : La Chute de Paris
 * Audio synchronisé avec transcription, images et quiz interactifs.
 *
 * L'audio (~6min15) est découpé en 5 parties :
 *   - Introduction + Épilogue
 *   - 3 sections principales (Phony War, Breakthrough, Crumbling)
 *
 * Les noms de sections ne sont PAS prononcés dans l'audio.
 * Timestamps issus de Whisper SRT avec interpolation mot-par-mot.
 */

import { ImmersiveAudioExperience } from '../../types';

// ─── Assets locaux ───────────────────────────────────────────

const AUDIO_SOURCE = require('../../../assets/audio/stop_1_fall_of_paris.m4a');

const PHOTOS = {
  paulReynaud: require('../../../assets/photos/stop_1_left_bank/paul_reynaud.jpg'),
  gamelin: require('../../../assets/photos/stop_1_left_bank/gamelin.webp'),
  westFront: require('../../../assets/photos/stop_1_left_bank/West_Front_1940Campaign.svg.png'),
  newspaper: require('../../../assets/photos/stop_1_left_bank/newspaper_22_may_1940.jpeg'),
  bombing: require('../../../assets/photos/stop_1_left_bank/bombing_paris_1940.jpeg'),
  naziFlag: require('../../../assets/photos/stop_1_left_bank/nazi_flag_arc_triomphe.jpg'),
  hitler: require('../../../assets/photos/stop_1_left_bank/hitler_paris.jpg'),
  goering: require('../../../assets/photos/stop_1_left_bank/goering.jpeg'),
} as const;

// ─── Expérience complète ─────────────────────────────────────

export const stop1Experience: ImmersiveAudioExperience = {
  audioFile: AUDIO_SOURCE as any,
  audioDurationMillis: 375340,
  autoScrollEnabled: true,
  scrollLockFuture: true,

  // ─── Transcription (56 segments — Whisper-synced) ─────────

  transcript: [
    // ══════════════════════════════════════════════════════════
    //  INTRODUCTION  (0 – 33 540 ms)
    // ══════════════════════════════════════════════════════════
    {
      id: 'intro-1',
      startTimeMillis: 0,
      endTimeMillis: 6240,
      text: 'All right, so here we are at our second stop, right in front of this building.',
      speakerStyle: 'narrator',
    },
    {
      id: 'intro-2',
      startTimeMillis: 6240,
      endTimeMillis: 13400,
      text: 'Any idea what institution has been housed here since the Third Republic, and still is today?',
      speakerStyle: 'narrator',
    },
    // ← Quiz Q1 triggers at 13 400
    {
      id: 'intro-3',
      startTimeMillis: 13400,
      endTimeMillis: 14520,
      text: 'Exactly — the Senate.',
      speakerStyle: 'narrator',
    },
    {
      id: 'intro-4',
      startTimeMillis: 14520,
      endTimeMillis: 20200,
      text: 'And this building played a key role in the story we\'re about to tell: the fall of Paris.',
      speakerStyle: 'narrator',
    },
    {
      id: 'intro-5',
      startTimeMillis: 20200,
      endTimeMillis: 30320,
      text: 'On the twenty-first of May, nineteen forty, the French Prime Minister came right here and made a dramatic speech in which he finally admitted that France was losing the war.',
      speakerStyle: 'narrator',
    },
    {
      id: 'intro-6',
      startTimeMillis: 30320,
      endTimeMillis: 33540,
      text: 'But to understand that moment, let\'s rewind a little.',
      speakerStyle: 'narrator',
    },

    // ══════════════════════════════════════════════════════════
    //  PART 1 — THE PHONY WAR  (33 540 – 99 790 ms)
    // ══════════════════════════════════════════════════════════
    {
      id: 'p1-1',
      startTimeMillis: 33540,
      endTimeMillis: 41000,
      text: 'When war was declared in September nineteen thirty-nine, the German army spent the first two months focused on Poland.',
      speakerStyle: 'narrator',
      sectionTitle: 'The Phony War',
      sectionSubtitle: 'September 1939 – May 1940',
    },
    {
      id: 'p1-2',
      startTimeMillis: 41000,
      endTimeMillis: 45730,
      text: 'After that, their next target was France — but bad weather kept delaying the attack.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p1-3',
      startTimeMillis: 45730,
      endTimeMillis: 55100,
      text: 'For seven months, the French and German armies simply sat facing each other at the border, about fifty kilometres apart, with almost no fighting.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p1-4',
      startTimeMillis: 55100,
      endTimeMillis: 59480,
      text: 'This strange period had a name. Any idea what it was called?',
      speakerStyle: 'narrator',
    },
    // ← Quiz Q2 triggers at 59 480
    {
      id: 'p1-5',
      startTimeMillis: 59480,
      endTimeMillis: 68500,
      text: 'In English, it was called the Phony War. In French, la Drôle de Guerre. And in German — my favourite — the Sitzkrieg: the sitting-down war.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p1-6',
      startTimeMillis: 68500,
      endTimeMillis: 78020,
      text: 'In Paris, life had almost returned to normal. By December nineteen thirty-nine, you could barely tell there was a war on.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p1-7',
      startTimeMillis: 78020,
      endTimeMillis: 86720,
      text: 'But the new Prime Minister, Paul Reynaud, who took office in March nineteen forty, knew the real fight was coming.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p1-8',
      startTimeMillis: 86720,
      endTimeMillis: 99790,
      text: 'He started introducing food restrictions — bakeries and butcher shops open on alternating days, no more specialty breads, no more butter in restaurants — small measures to prepare the city for what lay ahead.',
      speakerStyle: 'narrator',
    },

    // ══════════════════════════════════════════════════════════
    //  PART 2 — THE BREAKTHROUGH  (99 790 – 225 240 ms)
    // ══════════════════════════════════════════════════════════
    {
      id: 'p2-1',
      startTimeMillis: 99790,
      endTimeMillis: 104720,
      text: 'And then, on the tenth of May, nineteen forty, the waiting was over.',
      speakerStyle: 'narrator',
      sectionTitle: 'The Breakthrough',
      sectionSubtitle: 'May 10 – 16, 1940',
    },
    {
      id: 'p2-2',
      startTimeMillis: 104720,
      endTimeMillis: 108870,
      text: 'The German attack on France began — and the stopwatch started ticking.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p2-3',
      startTimeMillis: 108870,
      endTimeMillis: 114850,
      text: 'Thirty-five days. That\'s all it would take between the start of the offensive and the fall of Paris.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p2-4',
      startTimeMillis: 114850,
      endTimeMillis: 119180,
      text: 'But to understand how it happened so fast, you need to understand the geography.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p2-5',
      startTimeMillis: 119180,
      endTimeMillis: 122380,
      text: 'Any idea where the German attack came from?',
      speakerStyle: 'narrator',
    },
    // ← Quiz Q3 triggers at 122 380
    {
      id: 'p2-6',
      startTimeMillis: 122380,
      endTimeMillis: 125180,
      text: 'The German attack came from two directions.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p2-7',
      startTimeMillis: 125180,
      endTimeMillis: 130310,
      text: 'From the north, through Belgium and the Netherlands — which is exactly what the French had expected.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p2-8',
      startTimeMillis: 130310,
      endTimeMillis: 137940,
      text: 'The head of the French military, General Gamelin, sent over a million soldiers northward to meet them.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p2-9',
      startTimeMillis: 137940,
      endTimeMillis: 144880,
      text: 'But what Gamelin had not foreseen was a second, devastating attack further south, through the dense Ardennes forest.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p2-10',
      startTimeMillis: 144880,
      endTimeMillis: 149940,
      text: 'For Gamelin, a forest, a river, and the tail of the Maginot Line were impassable.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p2-11',
      startTimeMillis: 149940,
      endTimeMillis: 158770,
      text: 'But the Germans had a completely new way of fighting — fast-moving mechanised divisions, excellent air-ground coordination, and overwhelming air power.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p2-12',
      startTimeMillis: 158770,
      endTimeMillis: 167340,
      text: 'They cut through all three obstacles in just three days. And beyond those obstacles? There were no defences left between the border and Paris.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p2-13',
      startTimeMillis: 167340,
      endTimeMillis: 175390,
      text: 'By the fifteenth of May — just five days into the attack — German troops were spotted only one hundred and fifty kilometres from Paris.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p2-14',
      startTimeMillis: 175390,
      endTimeMillis: 179590,
      text: 'And here\'s the shocking part: the Prime Minister didn\'t even know.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p2-15',
      startTimeMillis: 179590,
      endTimeMillis: 188840,
      text: 'He was woken up at six in the morning by his Minister of Defence, who told him on the phone: "The road to Paris is open. The war is lost."',
      speakerStyle: 'character',
    },
    {
      id: 'p2-16',
      startTimeMillis: 188840,
      endTimeMillis: 192770,
      text: 'On the sixteenth of May, Reynaud called an emergency war committee.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p2-17',
      startTimeMillis: 192770,
      endTimeMillis: 203360,
      text: 'Critical decisions were taken: burn all sensitive documents, don\'t evacuate the population — there\'s no transport ready for two million people — and the government stays until the last minute.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p2-18',
      startTimeMillis: 203360,
      endTimeMillis: 210180,
      text: 'Bonfires were lit across Paris, including at the British Embassy. That day was called the Day of the Great Fear.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p2-19',
      startTimeMillis: 210180,
      endTimeMillis: 215700,
      text: 'But that evening, news came that the Germans were not heading for Paris — not yet.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p2-20',
      startTimeMillis: 215700,
      endTimeMillis: 225240,
      text: 'They were diverting northwest, towards Dunkirk, to trap the Allied soldiers stuck in the north. Paris had a reprieve. But not for long.',
      speakerStyle: 'narrator',
    },

    // ══════════════════════════════════════════════════════════
    //  PART 3 — THE CRUMBLING  (225 240 – 317 830 ms)
    // ══════════════════════════════════════════════════════════
    {
      id: 'p3-1',
      startTimeMillis: 225240,
      endTimeMillis: 234830,
      text: 'Five days later, on the twenty-first of May, the Prime Minister came right here, to the Senate building in front of you, and gave the speech that finally told the truth.',
      speakerStyle: 'narrator',
      sectionTitle: 'The Crumbling',
      sectionSubtitle: 'May 16 – June 14, 1940',
    },
    {
      id: 'p3-2',
      startTimeMillis: 234830,
      endTimeMillis: 239770,
      text: 'He told the senators — and through the press, the entire nation — that France was being overrun.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p3-3',
      startTimeMillis: 239770,
      endTimeMillis: 246240,
      text: 'The bridges on the Meuse hadn\'t even been destroyed in time. Major cities north of Paris were already occupied.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p3-4',
      startTimeMillis: 246240,
      endTimeMillis: 247980,
      text: 'But it was too late.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p3-5',
      startTimeMillis: 247980,
      endTimeMillis: 254410,
      text: 'Over the next three weeks, blow after blow shattered what was left of the French army.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p3-6',
      startTimeMillis: 254410,
      endTimeMillis: 260660,
      text: 'Dunkirk — over three hundred thousand soldiers evacuated, but half a million more were taken prisoner.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p3-7',
      startTimeMillis: 260660,
      endTimeMillis: 263440,
      text: 'Belgium surrendered after just eighteen days.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p3-8',
      startTimeMillis: 263440,
      endTimeMillis: 273770,
      text: 'On the third of June, German planes bombed a Citroën factory in Paris, killing two hundred and fifty people — and showing every Parisian that the enemy was now overhead.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p3-9',
      startTimeMillis: 273770,
      endTimeMillis: 282420,
      text: 'The exodus began. Can you guess what percentage of Parisians were still in the city the day the Germans arrived?',
      speakerStyle: 'narrator',
    },
    // ← Quiz Q4 triggers at 282 420
    {
      id: 'p3-10',
      startTimeMillis: 282420,
      endTimeMillis: 286680,
      text: 'Just twenty-five percent — seven hundred thousand people out of two point eight million.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p3-11',
      startTimeMillis: 286680,
      endTimeMillis: 294680,
      text: 'On the tenth of June, Italy declared war on France. That same night, every member of the government had left Paris.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p3-12',
      startTimeMillis: 294680,
      endTimeMillis: 303630,
      text: 'On the twelfth, the city was declared open — no more fighting allowed. And on the fourteenth of June, the first German soldiers walked into Paris.',
      speakerStyle: 'narrator',
    },
    {
      id: 'p3-13',
      startTimeMillis: 303630,
      endTimeMillis: 317830,
      text: 'By midday, they were patrolling most neighbourhoods. The Nazi flag was hanging from the Arc de Triomphe, the Eiffel Tower, the Élysée Palace. The occupation of Paris had begun — and it would last over four years.',
      speakerStyle: 'narrator',
    },

    // ══════════════════════════════════════════════════════════
    //  EPILOGUE & TRANSITION  (317 830 – 375 340 ms)
    // ══════════════════════════════════════════════════════════
    {
      id: 'ep-1',
      startTimeMillis: 317830,
      endTimeMillis: 321850,
      text: 'Eight days after losing Paris, France lost the war entirely.',
      speakerStyle: 'narrator',
      sectionTitle: 'Epilogue',
    },
    {
      id: 'ep-2',
      startTimeMillis: 321850,
      endTimeMillis: 325360,
      text: 'The armistice was signed on the twenty-second of June.',
      speakerStyle: 'narrator',
    },
    {
      id: 'ep-3',
      startTimeMillis: 325360,
      endTimeMillis: 338510,
      text: 'And the very next morning, Hitler made his famous — and only — visit to Paris. He flew in at six, drove through an empty city for two hours, took this iconic photograph in front of the Eiffel Tower, and left.',
      speakerStyle: 'narrator',
    },
    {
      id: 'ep-4',
      startTimeMillis: 338510,
      endTimeMillis: 339870,
      text: 'He never came back.',
      speakerStyle: 'narrator',
    },
    {
      id: 'ep-5',
      startTimeMillis: 339870,
      endTimeMillis: 343340,
      text: 'But some of his generals certainly enjoyed occupied Paris.',
      speakerStyle: 'narrator',
    },
    {
      id: 'ep-6',
      startTimeMillis: 343340,
      endTimeMillis: 348130,
      text: 'The number two of the Reich came here often. Any idea who?',
      speakerStyle: 'narrator',
    },
    // ← Quiz Q5 triggers at 348 130
    {
      id: 'ep-7',
      startTimeMillis: 348130,
      endTimeMillis: 356870,
      text: 'Hermann Göring, head of the Luftwaffe — the German Air Force. And this very building, the Senate, became the Luftwaffe\'s headquarters in Paris.',
      speakerStyle: 'narrator',
    },
    {
      id: 'ep-8',
      startTimeMillis: 356870,
      endTimeMillis: 364680,
      text: 'Now, we\'re going to walk along the right side of this building — which was a restricted military zone during the occupation.',
      speakerStyle: 'narrator',
    },
    {
      id: 'ep-9',
      startTimeMillis: 364680,
      endTimeMillis: 375340,
      text: 'Because from the moment the Germans took Paris, any act against them would be considered an act of resistance. And that\'s exactly what we\'ll talk about at our next stop.',
      speakerStyle: 'narrator',
    },
  ],

  // ─── Images contextuelles (8 images) ──────────────────────

  contextImages: [
    {
      id: 'img-reynaud',
      triggerTimeMillis: 78020,
      uri: PHOTOS.paulReynaud as any,
      caption: 'Paul Reynaud, Prime Minister of France',
      position: 'inline',
    },
    {
      id: 'img-gamelin',
      triggerTimeMillis: 130310,
      uri: PHOTOS.gamelin as any,
      caption: 'General Maurice Gamelin, head of the French military',
      position: 'inline',
    },
    {
      id: 'img-westfront',
      triggerTimeMillis: 158770,
      uri: PHOTOS.westFront as any,
      caption: 'Map of the German offensive through France, May 1940',
      position: 'inline',
    },
    {
      id: 'img-newspaper',
      triggerTimeMillis: 239770,
      uri: PHOTOS.newspaper as any,
      caption: 'Newspaper front page, May 22, 1940',
      position: 'inline',
    },
    {
      id: 'img-bombing',
      triggerTimeMillis: 263440,
      uri: PHOTOS.bombing as any,
      caption: 'German bombing of Paris, June 3, 1940',
      position: 'inline',
    },
    {
      id: 'img-naziflag',
      triggerTimeMillis: 306000,
      uri: PHOTOS.naziFlag as any,
      caption: 'The Nazi flag on the Arc de Triomphe, June 14, 1940',
      position: 'inline',
    },
    {
      id: 'img-hitler',
      triggerTimeMillis: 330000,
      uri: PHOTOS.hitler as any,
      caption: 'Hitler\'s only visit to Paris, June 23, 1940',
      position: 'inline',
    },
    {
      id: 'img-goering',
      triggerTimeMillis: 348130,
      uri: PHOTOS.goering as any,
      caption: 'Hermann Göring, head of the Luftwaffe',
      position: 'inline',
    },
  ],

  // ─── Quiz interactifs (5 quiz) ────────────────────────────

  quizzes: [
    {
      id: 'quiz-1',
      triggerTimeMillis: 13400,
      question: 'What institution has been housed in this building since the Third Republic?',
      options: ['The National Assembly', 'The Senate', 'The Élysée Palace', 'The Conseil d\'État'],
      correctAnswerIndex: 1,
      explanation: 'The French Senate has been housed in the Luxembourg Palace since the beginning of the Third Republic in 1879.',
      timerSeconds: 15,
      pauseAudio: true,
      resumeAfterAnswer: true,
    },
    {
      id: 'quiz-2',
      triggerTimeMillis: 59480,
      question: 'What was this strange period of inactivity called?',
      options: ['The Silent War', 'The Phony War', 'The Waiting Game', 'The Cold Front'],
      correctAnswerIndex: 1,
      explanation: 'Known as the Phony War in English, la Drôle de Guerre in French, and the Sitzkrieg (sitting-down war) in German.',
      timerSeconds: 15,
      pauseAudio: true,
      resumeAfterAnswer: true,
    },
    {
      id: 'quiz-3',
      triggerTimeMillis: 122380,
      question: 'Where did the decisive German attack come from?',
      options: ['Through Normandy', 'Through the Ardennes forest', 'Through Switzerland', 'Directly from the Rhine'],
      correctAnswerIndex: 1,
      explanation: 'While the expected attack came through Belgium, the devastating blow came through the dense Ardennes forest — thought to be impassable.',
      timerSeconds: 15,
      pauseAudio: true,
      resumeAfterAnswer: true,
    },
    {
      id: 'quiz-4',
      triggerTimeMillis: 282420,
      question: 'What percentage of Parisians were still in the city when the Germans arrived?',
      options: ['75%', '50%', '25%', '10%'],
      correctAnswerIndex: 2,
      explanation: 'Only 25% — about 700,000 people out of 2.8 million — remained in Paris when the German troops entered the city on June 14, 1940.',
      timerSeconds: 15,
      pauseAudio: true,
      resumeAfterAnswer: true,
    },
    {
      id: 'quiz-5',
      triggerTimeMillis: 348130,
      question: 'Who was the "number two" of the Reich that often visited occupied Paris?',
      options: ['Joseph Goebbels', 'Hermann Göring', 'Heinrich Himmler', 'Albert Speer'],
      correctAnswerIndex: 1,
      explanation: 'Hermann Göring, head of the Luftwaffe (German Air Force), was a frequent visitor. The Senate building itself became the Luftwaffe\'s Paris headquarters.',
      timerSeconds: 15,
      pauseAudio: true,
      resumeAfterAnswer: true,
    },
  ],
};
