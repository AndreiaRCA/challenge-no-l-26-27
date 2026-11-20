import React, { useState, useEffect } from 'react';

type RoleId = '5D' | '3L' | '34';
type GroupId = 'Avants' | 'Trois-quarts';
type AvatarId = 'rugby' | 'santa' | 'reindeer' | 'elf' | 'unicorn';

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  roleId: RoleId;
  poste: string;
  group: GroupId;
  avatarId: AvatarId;
  points: number;
  trainingMinutes: number;
  completedIds: string[];
  streakCount: number;
  streakBonusAwarded?: boolean;
}

interface SessionItem {
  id: string;
  badgeDate: string;
  pointsLabel: string;
  points: number;
  deadlineText: string;
  title: string;
  subtitle: string;
  consigneLabel: string;
  consigneByRole: Record<RoleId, string>;
  consigneRightHint: string;
  blocks: { heading: string; lines: string[] }[];
  defaultSeconds: number;
  mapLabel: string;
  mapSubLabel: string;
  mapPos: { x: number; y: number };
  kind: 'session' | 'gift' | 'extra';
  category: 'course' | 'fullbody' | 'noel' | 'extra';
  alwaysUnlocked?: boolean;
}

interface Submission {
  id: string;
  playerId: string;
  playerName: string;
  avatarId: AvatarId;
  poste: string;
  sessionTitle: string;
  points: number;
  status: 'pending' | 'approved' | 'rejected';
  photoUrl?: string;
  createdAt?: string;
}

interface SessionWallPost {
  id: string;
  playerId: string;
  playerName: string;
  avatarId: AvatarId;
  poste: string;
  caption: string;
  photoUrl: string;
  hearts: number;
  likedByMe?: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'rca_xv_noel_1900_v26';
const DEFAULT_LOGO_URL = encodeURI('/logo noel.png');
const DEFAULT_FIELD_URL = encodeURI('/terrain noel.jpeg');

const AVATARS: { id: AvatarId; label: string; emoji: string }[] = [
  { id: 'rugby', label: 'Ballon RCA', emoji: '🏉' },
  { id: 'santa', label: 'Père Noël', emoji: '🎅' },
  { id: 'reindeer', label: 'Renne', emoji: '🦌' },
  { id: 'elf', label: 'Lutin', emoji: '🧝' },
  { id: 'unicorn', label: 'Licorne', emoji: '🦄' },
];

const ROLES: { id: RoleId; label: string; short: string; group: GroupId }[] = [
  { id: '5D', label: '5 de Devant', short: '5 de Devant', group: 'Avants' },
  { id: '3L', label: '3ème Ligne', short: '3ème Ligne', group: 'Avants' },
  {
    id: '34',
    label: 'Trois-Quarts',
    short: 'Trois-Quarts',
    group: 'Trois-quarts',
  },
];

const INITIAL_SESSIONS: SessionItem[] = [
  {
    id: 's1-fb',
    badgeDate: '21 Décembre • Indicatif',
    pointsLabel: '+100 PTS',
    points: 100,
    deadlineText: 'À titre indicatif • Avance libre dès validation',
    title: 'Séance 1 : Musculation Full Body',
    subtitle: 'Renforcement global • Sans matériel (0’ à 40’)',
    consigneLabel: 'CONSIGNE POSTE',
    consigneByRole: {
      '5D': 'Focus gainage lourd & stabilité appuis (5D)',
      '3L': 'Rythme soutenu & explosivité (3ème Ligne)',
      '34': 'Vitesse d’exécution & dynamisme (Trois-Quarts)',
    },
    consigneRightHint: 'Circuit 40 min',
    blocks: [
      {
        heading: 'BLOC 0’ – 20’ (PAR TRANCHES DE 5’)',
        lines: [
          '→ 0’-5’ : 10 oiseau bouteilles d’eau + single leg deadlift',
          '→ 5’-10’ : 20" burpees + 6/côté pompes ouverture',
          '→ 10’-15’ : 5 sauts sur chaise + 30" planche',
          '→ 15’-20’ : 5 pompes sautées + 10 développé militaire bouteilles d’eau',
        ],
      },
      {
        heading: 'BLOC 20’ – 40’ & FINISHER',
        lines: [
          '→ 20’-25’ : 15->0 tractions australiennes + squats sautés',
          '→ 25’-30’ : 2 dips (x2 à chaque nouveau tour) + fentes marchées',
          '→ 35’-40’ : 30" sit up + 30" russian twist',
        ],
      },
    ],
    defaultSeconds: 40 * 60,
    mapLabel: 'Musculation n°1 (21/12)',
    mapSubLabel: 'Sans matériel • 40 min',
    mapPos: { x: 18, y: 90 },
    kind: 'session',
    category: 'fullbody',
    alwaysUnlocked: true,
  },
  {
    id: 's2-course1',
    badgeDate: '22 Décembre • Indicatif',
    pointsLabel: '+100 PTS',
    points: 100,
    deadlineText: 'À titre indicatif • Avance libre dès validation',
    title: 'Séance 2 : Course n°1',
    subtitle: 'Endurance & Course continue',
    consigneLabel: 'DISTANCE À FAIRE',
    consigneByRole: {
      '5D': '6 KM (Course n°1)',
      '3L': '6,5 KM (Course n°1)',
      '34': '7 KM for time (Course n°1)',
    },
    consigneRightHint: 'Course n°1',
    blocks: [
      {
        heading: 'COURSE N°1',
        lines: ['Avants : 6 km | 3ème Ligne : 6,5 km | ¾ : 7 km for time'],
      },
    ],
    defaultSeconds: 45 * 60,
    mapLabel: 'Course n°1 (22/12)',
    mapSubLabel: '6,5 KM • Course continue',
    mapPos: { x: 82, y: 90 },
    kind: 'session',
    category: 'course',
    alwaysUnlocked: true,
  },
  {
    id: 's3-fb-mat1',
    badgeDate: '23 Décembre • Indicatif',
    pointsLabel: '+100 PTS',
    points: 100,
    deadlineText: 'À titre indicatif • Avance libre dès validation',
    title: 'Séance 3 : Musculation Full Body (N°2)',
    subtitle: 'Abdos 6’ • E2MOM 24’ • EMOM 10’',
    consigneLabel: 'CONSIGNE POSTE',
    consigneByRole: {
      '5D': 'Stabilité & poussée (5D)',
      '3L': 'Volume & répétitions propres (3ème Ligne)',
      '34': 'Explosivité & appuis (Trois-Quarts)',
    },
    consigneRightHint: '23 Décembre',
    blocks: [
      {
        heading: 'CIRCUIT ABDOS 6’ & E2MOM 24’',
        lines: [
          '→ 6’ : 30" gainage militaire, 30" parachutiste, 30" obliques (x2)',
          '→ E2MOM 24’ : 6/J pistol squat + 6/J relevée bassin 1 jambe',
          '→ 10 burpees + 6/J fentes latérales • 45" dips chaise + 8/côté bird dog (R: 2’)',
        ],
      },
      {
        heading: 'EMOM 10’',
        lines: [
          'Step up : 4/4/2 ; 6/4/2/2 ; 4/4/2',
          'Pompes : 2/4/6 ; 2/4/6/8 ; 6/6/max',
        ],
      },
    ],
    defaultSeconds: 45 * 60,
    mapLabel: 'Musculation n°2 (23/12)',
    mapSubLabel: '23 Décembre',
    mapPos: { x: 23, y: 74 },
    kind: 'session',
    category: 'fullbody',
  },
  {
    id: 'extra-muscu',
    badgeDate: 'Bonus • Trêve Hivernale',
    pointsLabel: '+20 PTS',
    points: 20,
    deadlineText: 'Disponible à tout moment',
    title: 'Séance EXTRA Musculation Full Body',
    subtitle: 'E2MOM 24’ + For Time Haut',
    consigneLabel: 'CONSIGNE POSTE',
    consigneByRole: {
      '5D': 'Charge contrôlée & gainage (5D)',
      '3L': 'Intensité constante (3ème Ligne)',
      '34': 'Vitesse & propreté technique (Trois-Quarts)',
    },
    consigneRightHint: 'Bonus +20 PTS',
    blocks: [
      {
        heading: '24’ E2MOM',
        lines: [
          '1. 15 pompes + 15 pompes australiennes table',
          '2. 45" crunchs + 45" planche',
          '3. 15 dips chaise + 15 pompes piquées',
        ],
      },
      {
        heading: 'FOR TIME HAUT',
        lines: [
          '50 pompes diamants • 40 burpees',
          '30 pompes ouverture • 30 biceps curl bouteille d’eau (1L)',
        ],
      },
    ],
    defaultSeconds: 30 * 60,
    mapLabel: 'Séance EXTRA Mu...',
    mapSubLabel: 'Bonus Full Body',
    mapPos: { x: 77, y: 74 },
    kind: 'extra',
    category: 'extra',
  },
  {
    id: 'c1-noel',
    badgeDate: '25 Décembre • Cadeau Noël',
    pointsLabel: '+120 PTS',
    points: 120,
    deadlineText: 'À titre indicatif',
    title: 'Cadeau de Noël',
    subtitle: 'Défi spécial Noël',
    consigneLabel: 'CONSIGNE POSTE',
    consigneByRole: {
      '5D': 'J’espère que vous profitez bien avec votre famille. Prenez-vous en photo et insérez dedans.',
      '3L': 'J’espère que vous profitez bien avec votre famille. Prenez-vous en photo et insérez dedans.',
      '34': 'J’espère que vous profitez bien avec votre famille. Prenez-vous en photo et insérez dedans.',
    },
    consigneRightHint: 'Cadeau Noël',
    blocks: [
      {
        heading: 'CADEAU DE NOËL',
        lines: [
          'J’espère que vous profitez bien avec votre famille. Prenez-vous en photo et insérez dedans.',
        ],
      },
    ],
    defaultSeconds: 0,
    mapLabel: 'Cadeau de Noël',
    mapSubLabel: '25 Décembre',
    mapPos: { x: 28, y: 58 },
    kind: 'gift',
    category: 'noel',
  },
  {
    id: 's4-inter-long',
    badgeDate: '27 Décembre • Indicatif',
    pointsLabel: '+110 PTS',
    points: 110,
    deadlineText: 'À titre indicatif • Avance libre dès validation',
    title: 'Séance 4 : Course n°2 (30"/30")',
    subtitle: '3 x 6’ - 30"/30" • Récup 3’ • 100% VMA',
    consigneLabel: 'DISTANCE À FAIRE',
    consigneByRole: {
      '5D': '62m navette (Course n°2 • 30"/30")',
      '3L': '62,5m navette (Course n°2 • 30"/30")',
      '34': '64,5m navette (Course n°2 • 30"/30")',
    },
    consigneRightHint: '27 Décembre',
    blocks: [
      {
        heading: 'COURSE N°2 • INTERMITTENT 30"/30"',
        lines: [
          "→ 5' échauffement gammes",
          '→ 3 x 6\' - 30"/30" ; récup 3\' 100% VMA (avec changements de direction)',
          'Distances : 5D → 62m | 3ème Ligne → 62,5m | ¾ → 64,5m',
        ],
      },
    ],
    defaultSeconds: 35 * 60,
    mapLabel: 'Course n°2 (27/12)',
    mapSubLabel: '62.5m navette • 30"/30"',
    mapPos: { x: 72, y: 58 },
    kind: 'session',
    category: 'course',
  },
  {
    id: 'extra-course2',
    badgeDate: 'Bonus • Trêve Hivernale',
    pointsLabel: '+20 PTS',
    points: 20,
    deadlineText: 'Disponible à tout moment',
    title: 'Séance EXTRA Course',
    subtitle: 'Intermittent ou sortie course bonus',
    consigneLabel: 'DISTANCE À FAIRE',
    consigneByRole: {
      '5D': '62m navette ou 6 km course (5D)',
      '3L': '62,5m navette ou 6,5 km course (3ème Ligne)',
      '34': '64,5m navette ou 7 km course (Trois-Quarts)',
    },
    consigneRightHint: 'Bonus +20 PTS',
    blocks: [
      {
        heading: 'OPTION EXTRA COURSE',
        lines: [
          "→ 5' échauffement gammes",
          '→ 3x 4\' - 20" course - 20" footing (2\' récup)',
          '→ 2x 3\'-10"/10" ; 1\'30 récup',
        ],
      },
    ],
    defaultSeconds: 30 * 60,
    mapLabel: 'Séance EXTRA Co...',
    mapSubLabel: 'Bonus Course',
    mapPos: { x: 34, y: 42 },
    kind: 'extra',
    category: 'extra',
  },
  {
    id: 's5-fb-mat2',
    badgeDate: '29 Décembre • Indicatif',
    pointsLabel: '+110 PTS',
    points: 110,
    deadlineText: 'À titre indicatif • Avance libre dès validation',
    title: 'Séance 5 : Musculation Full Body (N°3)',
    subtitle: 'W.UP • E2MOM 24’ • For Time • EMOM 10’',
    consigneLabel: 'CONSIGNE POSTE',
    consigneByRole: {
      '5D': 'Puissance & gainage (5D)',
      '3L': 'Volume & intensité (3ème Ligne)',
      '34': 'Dynamisme & appuis (Trois-Quarts)',
    },
    consigneRightHint: '29 Décembre',
    blocks: [
      {
        heading: 'W.UP (3 TOURS) & E2MOM 24’',
        lines: [
          '→ W.UP : 2x marche de l’ours carré 5m, goblet squat (10/20/30), tractions australiennes (10/15/20), step up',
          '→ E2MOM 24’ : 3 fentes avt/arrière + 10 développé militaire barre • 40" dead bug • bike • farmer walk 40" • 40" max burpees',
        ],
      },
      {
        heading: 'FOR TIME & FINISHER EMOM 10’ (10->1)',
        lines: [
          '→ 1 combo = 2 tirage buste penché + 1 arraché haltères : 7 + 42 cal row / 5 + 30 kcal / 3 + 18 kcal',
          '→ EMOM 10’ (10->1) : pull up + box jump',
        ],
      },
    ],
    defaultSeconds: 50 * 60,
    mapLabel: 'Musculation n°3 (29/12)',
    mapSubLabel: '29 Décembre',
    mapPos: { x: 66, y: 42 },
    kind: 'session',
    category: 'fullbody',
  },
  {
    id: 'c2-nouvel-an',
    badgeDate: '31 Décembre • Nouvel An',
    pointsLabel: '+120 PTS',
    points: 120,
    deadlineText: 'À titre indicatif',
    title: 'Cadeau Nouvel An',
    subtitle: 'Défi spécial Nouvel An',
    consigneLabel: 'CONSIGNE POSTE',
    consigneByRole: {
      '5D': 'Prenez-vous en photo pour le Nouvel An et insérez dedans.',
      '3L': 'Prenez-vous en photo pour le Nouvel An et insérez dedans.',
      '34': 'Prenez-vous en photo pour le Nouvel An et insérez dedans.',
    },
    consigneRightHint: 'Cadeau Nouvel An',
    blocks: [
      {
        heading: 'CADEAU NOUVEL AN',
        lines: ['Prenez-vous en photo pour le Nouvel An et insérez dedans.'],
      },
    ],
    defaultSeconds: 0,
    mapLabel: 'Cadeau Nouvel An',
    mapSubLabel: '31 Décembre',
    mapPos: { x: 40, y: 27 },
    kind: 'gift',
    category: 'noel',
  },
  {
    id: 's6-reprise',
    badgeDate: '02 Janvier • Indicatif',
    pointsLabel: '+100 PTS',
    points: 100,
    deadlineText: 'À titre indicatif • Avance libre dès validation',
    title: 'Séance 6 : Course n°3 & Sprints',
    subtitle: '15"/15" à 90% VMA + Sprints 100%',
    consigneLabel: 'DISTANCE À FAIRE',
    consigneByRole: {
      '5D': '62,5m navette | Sprints 20m (5D)',
      '3L': '62,5m navette | Sprints 30m (3ème Ligne)',
      '34': '64,5m navette | Sprints 30m (Trois-Quarts)',
    },
    consigneRightHint: '02 Janvier',
    blocks: [
      {
        heading: 'COURSE N°3 • INTERMITTENT COURT (15"/15")',
        lines: [
          "→ 5' échauffement gammes",
          '→ 2x 3\' - 15"/15" 2 - 90 % VMA ; 3 min récup',
          'Distances : 5D → 62m | 3ème Ligne → 62,5m | ¾ → 64,5m',
        ],
      },
      {
        heading: 'SPRINTS FINALE',
        lines: [
          '→ Sprints 20 m avants / 30m les autres',
          "→ 3 × 3 répétitions 100% ; 1'15 entre chaque sprint",
        ],
      },
    ],
    defaultSeconds: 40 * 60,
    mapLabel: 'Course n°3 (02/01)',
    mapSubLabel: '02 Janvier • Sprints',
    mapPos: { x: 60, y: 14 },
    kind: 'session',
    category: 'course',
  },
];

const INITIAL_PLAYERS: Player[] = [
  {
    id: 'p1',
    firstName: 'Maxime',
    lastName: 'L.',
    name: 'Maxime L.',
    roleId: '3L',
    poste: '3ème Ligne',
    group: 'Avants',
    avatarId: 'rugby',
    points: 0,
    trainingMinutes: 0,
    completedIds: [],
    streakCount: 0,
    streakBonusAwarded: false,
  },
  {
    id: 'p2',
    firstName: 'Lucas',
    lastName: 'D.',
    name: 'Lucas D.',
    roleId: '34',
    poste: 'Trois-Quarts',
    group: 'Trois-quarts',
    avatarId: 'santa',
    points: 200,
    trainingMinutes: 85,
    completedIds: ['s1-fb', 's2-course1'],
    streakCount: 2,
    streakBonusAwarded: false,
  },
  {
    id: 'p3',
    firstName: 'Antoine',
    lastName: 'B.',
    name: 'Antoine B.',
    roleId: '5D',
    poste: '5 de Devant',
    group: 'Avants',
    avatarId: 'reindeer',
    points: 350,
    trainingMinutes: 120,
    completedIds: ['s1-fb', 's2-course1', 'c1-noel'],
    streakCount: 3,
    streakBonusAwarded: true,
  },
  {
    id: 'p4',
    firstName: 'Théo',
    lastName: 'M.',
    name: 'Théo M.',
    roleId: '34',
    poste: 'Trois-Quarts',
    group: 'Trois-quarts',
    avatarId: 'elf',
    points: 200,
    trainingMinutes: 85,
    completedIds: ['s1-fb', 's2-course1'],
    streakCount: 2,
    streakBonusAwarded: false,
  },
  {
    id: 'p5',
    firstName: 'Paul',
    lastName: 'R.',
    name: 'Paul R.',
    roleId: '3L',
    poste: '3ème Ligne',
    group: 'Avants',
    avatarId: 'unicorn',
    points: 100,
    trainingMinutes: 40,
    completedIds: ['s1-fb'],
    streakCount: 1,
    streakBonusAwarded: false,
  },
];

const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'init-1',
    playerId: 'p1',
    playerName: 'Maxime L.',
    avatarId: 'rugby',
    poste: '3ème Ligne',
    sessionTitle: 'Séance 1 : Musculation Full Body',
    points: 100,
    status: 'pending',
    photoUrl: DEFAULT_FIELD_URL,
    createdAt: 'Aujourd’hui',
  },
  {
    id: 'init-2',
    playerId: 'p2',
    playerName: 'Lucas D.',
    avatarId: 'santa',
    poste: 'Trois-Quarts',
    sessionTitle: 'Séance 2 : Course n°1',
    points: 100,
    status: 'pending',
    photoUrl: DEFAULT_LOGO_URL,
    createdAt: 'Hier',
  },
];

const INITIAL_WALL_POSTS: SessionWallPost[] = [
  {
    id: 'post-1',
    playerId: 'p1',
    playerName: 'Maxime L.',
    avatarId: 'rugby',
    poste: '3ème Ligne',
    caption:
      'Course n°1 validée sur le terrain enneigé, bonnes sensations sur la fin.',
    photoUrl: DEFAULT_FIELD_URL,
    hearts: 6,
    createdAt: 'Hier • Trêve RCA',
  },
  {
    id: 'post-2',
    playerId: 'p2',
    playerName: 'Lucas D.',
    avatarId: 'santa',
    poste: 'Trois-Quarts',
    caption:
      'Défi Noël terminé avec le blason du club, en route pour la séance suivante.',
    photoUrl: DEFAULT_LOGO_URL,
    hearts: 5,
    createdAt: 'Aujourd’hui • Trêve RCA',
  },
  {
    id: 'post-3',
    playerId: 'p3',
    playerName: 'Antoine B.',
    avatarId: 'reindeer',
    poste: '5 de Devant',
    caption: 'Circuit full body bouclé dans le salon, les jambes piquent bien.',
    photoUrl: DEFAULT_FIELD_URL,
    hearts: 4,
    createdAt: 'Aujourd’hui • Trêve RCA',
  },
  {
    id: 'post-4',
    playerId: 'p4',
    playerName: 'Théo M.',
    avatarId: 'elf',
    poste: 'Trois-Quarts',
    caption: 'Séance extra course terminée avant la pluie, chrono tenu.',
    photoUrl: DEFAULT_LOGO_URL,
    hearts: 3,
    createdAt: 'Cette semaine • Trêve RCA',
  },
];

interface PlayerBadge {
  id: string;
  label: string;
  emoji: string;
  meaning: string;
}

function getPlayerBadges(player: Player): PlayerBadge[] {
  const badges: PlayerBadge[] = [];
  const completedSet = new Set(player.completedIds);

  const hasExtra =
    completedSet.has('extra-muscu') ||
    completedSet.has('extra-course2') ||
    (player.points % 20 === 0 && player.completedIds.length >= 4);
  if (hasExtra) {
    badges.push({
      id: 'extra',
      label: 'Chasseur d’Extra',
      emoji: '🎯',
      meaning: 'Débloqué en validant une séance Extra bonus.',
    });
  }

  const hasNoel =
    completedSet.has('c1-noel') || completedSet.has('c2-nouvel-an');
  if (hasNoel) {
    badges.push({
      id: 'noel',
      label: 'Esprit de Noël',
      emoji: '🎄',
      meaning:
        'Débloqué en participant au défi cadeau de Noël ou du Nouvel An.',
    });
  }

  const hasCourse =
    completedSet.has('s2-course1') ||
    completedSet.has('s4-inter-long') ||
    completedSet.has('s6-reprise');
  if (hasCourse) {
    badges.push({
      id: 'f1',
      label: 'Formule 1',
      emoji: '🏎️',
      meaning: 'Débloqué en validant une séance course / intermittent.',
    });
  }

  const hasFullBody =
    completedSet.has('s1-fb') ||
    completedSet.has('s3-fb-mat1') ||
    completedSet.has('s5-fb-mat2');
  if (hasFullBody) {
    badges.push({
      id: 'bucheron',
      label: 'Bûcheron',
      emoji: '🪓',
      meaning: 'Débloqué en validant une séance musculation full body.',
    });
  }

  if (player.completedIds.length >= 3) {
    badges.push({
      id: 'regulier',
      label: 'Régulier',
      emoji: '⏱️',
      meaning: 'Débloqué en validant au moins 3 étapes du parcours.',
    });
  }

  if (player.streakCount >= 3 || player.streakBonusAwarded) {
    badges.push({
      id: 'serie3',
      label: 'Série x3',
      emoji: '🔥',
      meaning: 'Débloqué avec 3 validations d’affilée (+30 PTS bonus).',
    });
  }

  return badges;
}

const formatChrono = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

function PodiumMarches({
  list,
  emptyText,
  onSelectBadge,
}: {
  list: Player[];
  emptyText: string;
  onSelectBadge: (badge: PlayerBadge, playerName: string) => void;
}) {
  if (list.length === 0) {
    return (
      <p className="text-xs text-slate-500 py-4 text-center">{emptyText}</p>
    );
  }

  const first = list[0];
  const second = list[1];
  const third = list[2];

  const getEmoji = (id: AvatarId) =>
    AVATARS.find((a) => a.id === id)?.emoji || '🏉';

  const renderBadgeChips = (p: Player) => {
    const badges = getPlayerBadges(p);
    if (badges.length === 0) return null;
    return (
      <div className="flex flex-wrap items-center justify-center gap-1 my-1">
        {badges.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onSelectBadge(b, p.name)}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-900/95 hover:bg-slate-800 border border-amber-400/45 text-[9px] font-bold text-amber-200 leading-none transition cursor-pointer"
          >
            <span>{b.emoji}</span>
            <span className="hidden sm:inline">{b.label}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-3 gap-2.5 items-end pt-3">
      <div className="flex flex-col items-center">
        {second ? (
          <>
            <span className="text-2xl mb-1">{getEmoji(second.avatarId)}</span>
            <p className="text-xs font-extrabold text-white truncate max-w-full">
              {second.name}
            </p>
            {renderBadgeChips(second)}
            <p className="text-[11px] font-bold text-slate-300 mb-1.5">
              {second.points} PTS
            </p>
          </>
        ) : (
          <div className="h-14" />
        )}
        <div className="w-full h-20 rounded-t-2xl bg-gradient-to-b from-slate-500/45 to-slate-800/85 border border-slate-400/40 flex flex-col items-center justify-center">
          <span className="text-lg">🥈</span>
          <span className="text-[11px] font-black text-slate-200">2e</span>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <span className="text-base mb-0.5">👑</span>
        <span className="text-3xl mb-1">{getEmoji(first.avatarId)}</span>
        <p className="text-xs sm:text-sm font-black text-white truncate max-w-full">
          {first.name}
        </p>
        {renderBadgeChips(first)}
        <p className="text-xs font-black text-amber-400 mb-1.5">
          {first.points} PTS
        </p>
        <div className="w-full h-28 rounded-t-2xl bg-gradient-to-b from-amber-400/50 to-amber-600/25 border border-amber-400/75 flex flex-col items-center justify-center shadow-lg shadow-amber-950/40">
          <span className="text-2xl">🥇</span>
          <span className="text-xs font-black text-amber-300">1er</span>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {third ? (
          <>
            <span className="text-2xl mb-1">{getEmoji(third.avatarId)}</span>
            <p className="text-xs font-extrabold text-white truncate max-w-full">
              {third.name}
            </p>
            {renderBadgeChips(third)}
            <p className="text-[11px] font-bold text-orange-200/90 mb-1.5">
              {third.points} PTS
            </p>
          </>
        ) : (
          <div className="h-14" />
        )}
        <div className="w-full h-16 rounded-t-2xl bg-gradient-to-b from-orange-600/45 to-orange-950/75 border border-orange-500/40 flex flex-col items-center justify-center">
          <span className="text-lg">🥉</span>
          <span className="text-[11px] font-black text-orange-200">3e</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'podiums' | 'coach'>(
    'map'
  );
  const [selectedRole, setSelectedRole] = useState<RoleId>('3L');
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>('rugby');
  const [sessions, setSessions] = useState<SessionItem[]>(INITIAL_SESSIONS);
  const [editingSessionId, setEditingSessionId] = useState<string>(
    INITIAL_SESSIONS[0].id
  );
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [activePlayerId, setActivePlayerId] = useState<string>(
    INITIAL_PLAYERS[0].id
  );
  const [submissions, setSubmissions] =
    useState<Submission[]>(INITIAL_SUBMISSIONS);
  const [wallPosts, setWallPosts] =
    useState<SessionWallPost[]>(INITIAL_WALL_POSTS);
  const [wallPage, setWallPage] = useState<number>(0);
  const [postDescription, setPostDescription] = useState<string>('');
  const [postPhotoUrl, setPostPhotoUrl] = useState<string | null>(null);
  const [openSessionId, setOpenSessionId] = useState<string | null>(null);
  const [proofPhotoUrl, setProofPhotoUrl] = useState<string | null>(null);
  const [extraModalOpen, setExtraModalOpen] = useState<boolean>(false);
  const [extraPhotoUrl, setExtraPhotoUrl] = useState<string | null>(null);
  const [joinModalOpen, setJoinModalOpen] = useState<boolean>(false);
  const [joinFirstName, setJoinFirstName] = useState<string>('');
  const [joinLastName, setJoinLastName] = useState<string>('');
  const [joinRoleId, setJoinRoleId] = useState<RoleId>('3L');
  const [joinAvatarId, setJoinAvatarId] = useState<AvatarId>('rugby');
  const [secondsLeft, setSecondsLeft] = useState<number>(45 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [chronoMode, setChronoMode] = useState<'seance' | 'course'>('seance');
  const [coachUnlocked, setCoachUnlocked] = useState<boolean>(false);
  const [coachCode, setCoachCode] = useState<string>('');
  const [toast, setToast] = useState<string | null>(null);
  const [badgeInfo, setBadgeInfo] = useState<{
    emoji: string;
    label: string;
    meaning: string;
    playerName: string;
  } | null>(null);
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.sessions) && parsed.sessions.length > 0)
          setSessions(parsed.sessions);
        if (Array.isArray(parsed.players) && parsed.players.length > 0) {
          setPlayers(parsed.players);
          const foundActive =
            parsed.players.find(
              (p: Player) => p.id === parsed.activePlayerId
            ) || parsed.players[0];
          setActivePlayerId(foundActive.id);
          setSelectedRole(foundActive.roleId || '3L');
          setSelectedAvatar(foundActive.avatarId || 'rugby');
        }
        if (Array.isArray(parsed.submissions))
          setSubmissions(parsed.submissions);
        if (Array.isArray(parsed.wallPosts) && parsed.wallPosts.length > 0)
          setWallPosts(parsed.wallPosts);
      }
    } catch {
      // Ignore
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          sessions,
          players,
          activePlayerId,
          submissions,
          wallPosts,
        })
      );
    } catch {
      // Ignore
    }
  }, [hydrated, sessions, players, activePlayerId, submissions, wallPosts]);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const currentPlayer =
    players.find((p) => p.id === activePlayerId) || players[0];
  const currentAvatar =
    AVATARS.find((a) => a.id === currentPlayer.avatarId) || AVATARS[0];
  const currentRoleObj =
    ROLES.find((r) => r.id === currentPlayer.roleId) || ROLES[1];
  const openSession = sessions.find((s) => s.id === openSessionId) || null;
  const editingSession =
    sessions.find((s) => s.id === editingSessionId) || sessions[0];

  const isSessionUnlocked = (index: number) => {
    const s = sessions[index];
    if (s?.alwaysUnlocked) return true;
    if (currentPlayer.completedIds.length > 0) return true;
    return index === 0;
  };

  const santaSessionIndex = (() => {
    const firstUncompletedIndex = sessions.findIndex(
      (s) => !currentPlayer.completedIds.includes(s.id)
    );
    if (firstUncompletedIndex === -1) return sessions.length - 1;
    return firstUncompletedIndex;
  })();
  const santaPos = sessions[santaSessionIndex]?.mapPos || sessions[0].mapPos;

  const openSessionModal = (s: SessionItem, index: number) => {
    if (!isSessionUnlocked(index)) {
      setToast('Valide d’abord une séance pour débloquer la suite !');
      return;
    }
    setOpenSessionId(s.id);
    setProofPhotoUrl(null);
    setSecondsLeft(s.defaultSeconds);
    setTimerRunning(false);
    setChronoMode(s.category === 'course' ? 'course' : 'seance');
  };

  const handleRoleSelect = (roleId: RoleId) => {
    setSelectedRole(roleId);
    const r = ROLES.find((item) => item.id === roleId)!;
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === currentPlayer.id
          ? { ...p, roleId, poste: r.short, group: r.group }
          : p
      )
    );
  };

  const handleOpenJoinModal = () => {
    setJoinFirstName('');
    setJoinLastName('');
    setJoinRoleId(currentPlayer.roleId);
    setJoinAvatarId(currentPlayer.avatarId);
    setJoinModalOpen(true);
  };

  const handleJoinSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const first = joinFirstName.trim();
    const last = joinLastName.trim();
    if (!first || !last) {
      setToast('Merci de renseigner ton prénom et ton nom.');
      return;
    }

    const roleObj = ROLES.find((r) => r.id === joinRoleId) || ROLES[1];
    const displayName = `${first} ${last}`;
    const normalizedKey = displayName.toLowerCase();

    const existingPlayer = players.find(
      (p) => p.name.trim().toLowerCase() === normalizedKey
    );

    if (existingPlayer) {
      setActivePlayerId(existingPlayer.id);
      setSelectedRole(existingPlayer.roleId);
      setSelectedAvatar(existingPlayer.avatarId);
      setJoinModalOpen(false);
      setToast(
        `Bon retour ${existingPlayer.name} ! Ta progression est chargée.`
      );
      return;
    }

    const newPlayer: Player = {
      id: `p-${Date.now()}`,
      firstName: first,
      lastName: last,
      name: displayName,
      roleId: roleObj.id,
      poste: roleObj.short,
      group: roleObj.group,
      avatarId: joinAvatarId,
      points: 0,
      trainingMinutes: 0,
      completedIds: [],
      streakCount: 0,
      streakBonusAwarded: false,
    };

    setPlayers((prev) => [...prev, newPlayer]);
    setActivePlayerId(newPlayer.id);
    setSelectedRole(roleObj.id);
    setSelectedAvatar(joinAvatarId);
    setJoinModalOpen(false);
    setToast(
      `Bienvenue ${displayName} (${roleObj.label}) ! Profil enregistré.`
    );
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setProofPhotoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleExtraPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setExtraPhotoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleWallPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setPostPhotoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateWallPost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!postDescription.trim() && !postPhotoUrl) {
      setToast('Ajoute une photo ou une description de séance !');
      return;
    }
    const newPost: SessionWallPost = {
      id: `post-${Date.now()}`,
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      avatarId: currentPlayer.avatarId,
      poste: currentPlayer.poste,
      caption: postDescription.trim() || 'Séance validée.',
      photoUrl: postPhotoUrl || DEFAULT_FIELD_URL,
      hearts: 1,
      likedByMe: true,
      createdAt: 'À l’instant • Trêve RCA',
    };
    setWallPosts((prev) => [newPost, ...prev]);
    setWallPage(0);
    setPostDescription('');
    setPostPhotoUrl(null);
    setToast(
      `Publication de ${currentPlayer.name} ajoutée au Mur des Séances !`
    );
  };

  const handleToggleHeart = (postId: string) => {
    setWallPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const alreadyLiked = Boolean(post.likedByMe);
        return {
          ...post,
          likedByMe: !alreadyLiked,
          hearts: alreadyLiked ? Math.max(0, post.hearts - 1) : post.hearts + 1,
        };
      })
    );
  };

  const handleValidateSession = (s: SessionItem) => {
    const alreadyDone = currentPlayer.completedIds.includes(s.id);
    let unlockedStreakBonus = false;

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== currentPlayer.id) return p;
        const nextStreak = alreadyDone ? p.streakCount : p.streakCount + 1;
        const shouldAwardStreak = nextStreak >= 3 && !p.streakBonusAwarded;
        if (shouldAwardStreak) unlockedStreakBonus = true;

        const baseGain = alreadyDone ? 0 : s.points;
        const streakGain = shouldAwardStreak ? 30 : 0;

        return {
          ...p,
          points: p.points + baseGain + streakGain,
          trainingMinutes: alreadyDone
            ? p.trainingMinutes
            : p.trainingMinutes + Math.round(s.defaultSeconds / 60),
          completedIds: alreadyDone
            ? p.completedIds
            : [...p.completedIds, s.id],
          streakCount: nextStreak,
          streakBonusAwarded: p.streakBonusAwarded || shouldAwardStreak,
        };
      })
    );

    setSubmissions((prev) => [
      {
        id: `sub-${Date.now()}`,
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        avatarId: currentPlayer.avatarId,
        poste: currentPlayer.poste,
        sessionTitle: s.title,
        points: s.points,
        status: 'pending',
        photoUrl: proofPhotoUrl || undefined,
        createdAt: 'À l’instant',
      },
      ...prev,
    ]);

    setToast(
      unlockedStreakBonus
        ? `🔥 3 d'affilée : badge + 30 PTS bonus • +${s.points} PTS (${currentPlayer.name}) !`
        : `${s.title} validée pour ${currentPlayer.name} (+${s.points} PTS) !`
    );
  };

  const handleOpenExtraModal = () => {
    setExtraPhotoUrl(null);
    setExtraModalOpen(true);
  };

  const handleSubmitExtra = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!extraPhotoUrl) {
      setToast(
        'Merci de joindre une photo de ta séance extra avant de valider.'
      );
      return;
    }

    let unlockedStreakBonus = false;
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== currentPlayer.id) return p;
        const nextStreak = p.streakCount + 1;
        const shouldAwardStreak = nextStreak >= 3 && !p.streakBonusAwarded;
        if (shouldAwardStreak) unlockedStreakBonus = true;
        return {
          ...p,
          points: p.points + 20 + (shouldAwardStreak ? 30 : 0),
          trainingMinutes: p.trainingMinutes + 30,
          streakCount: nextStreak,
          streakBonusAwarded: p.streakBonusAwarded || shouldAwardStreak,
        };
      })
    );

    setSubmissions((prev) => [
      {
        id: `extra-${Date.now()}`,
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        avatarId: currentPlayer.avatarId,
        poste: currentPlayer.poste,
        sessionTitle: 'Séance Extra (+20 PTS)',
        points: 20,
        status: 'pending',
        photoUrl: extraPhotoUrl,
        createdAt: 'À l’instant',
      },
      ...prev,
    ]);

    setExtraModalOpen(false);
    setExtraPhotoUrl(null);
    setToast(
      unlockedStreakBonus
        ? `🔥 3 d’affilée : badge + 30 PTS bonus • Séance Extra (+20 PTS) pour ${currentPlayer.name} !`
        : `Séance Extra envoyée par ${currentPlayer.name} dans l’Espace Prépa (+20 PTS) !`
    );
  };

  const handleCoachSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (coachCode.trim() === '1900') {
      setCoachUnlocked(true);
      setToast('Espace Prépa déverrouillé.');
    } else {
      setToast('Code incorrect (indice : 1900).');
    }
  };

  const handleUpdateSubmissionStatus = (
    id: string,
    nextStatus: 'approved' | 'rejected'
  ) => {
    setSubmissions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item
      )
    );
    setToast(
      nextStatus === 'approved'
        ? 'Photo et séance validées par le staff !'
        : 'Soumission marquée comme refusée.'
    );
  };

  const handleUpdateSessionField = (
    sessionId: string,
    updater: (prev: SessionItem) => SessionItem
  ) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? updater(s) : s))
    );
  };

  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);
  const top3Global = sortedPlayers.slice(0, 3);
  const avantsPoints = players
    .filter((p) => p.group === 'Avants')
    .reduce((sum, p) => sum + p.points, 0);
  const troisQuartsPoints = players
    .filter((p) => p.group === 'Trois-quarts')
    .reduce((sum, p) => sum + p.points, 0);
  const totalClashPoints = avantsPoints + troisQuartsPoints;
  const avantsPct =
    totalClashPoints > 0
      ? Math.round((avantsPoints / totalClashPoints) * 100)
      : 50;
  const troisQuartsPct = totalClashPoints > 0 ? 100 - avantsPct : 50;

  const totalWallPages = Math.max(1, Math.ceil(wallPosts.length / 3));
  const safeWallPage = Math.min(wallPage, totalWallPages - 1);
  const visibleWallPosts = wallPosts.slice(
    safeWallPage * 3,
    safeWallPage * 3 + 3
  );
  const topHeartsPostId = [...wallPosts].sort((a, b) => b.hearts - a.hearts)[0]
    ?.id;

  const trailPoints = sessions
    .map((s) => `${s.mapPos.x},${s.mapPos.y}`)
    .join(' ');

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-y-auto overflow-x-hidden bg-[#070b14] text-slate-100 flex flex-col lg:flex-row">
      {/* BARRE LATÉRALE GAUCHE */}
      <aside className="w-full lg:w-60 shrink-0 bg-[#0b1120] border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between p-4">
        <div className="space-y-5">
          <div className="flex flex-col items-center text-center gap-2">
            <img
              src={DEFAULT_LOGO_URL}
              alt="Logo du club"
              className="w-16 h-16 rounded-2xl object-contain bg-slate-900/80 border border-sky-400/50 p-1"
            />
            <h1 className="font-extrabold text-base text-white">
              Le XV de Noël
            </h1>
          </div>

          <nav className="grid grid-cols-3 lg:grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition text-left ${
                activeTab === 'map'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <span>🎄</span>
              <span className="truncate">Challenge Noël</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('podiums')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition text-left ${
                activeTab === 'podiums'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <span>🏆</span>
              <span className="truncate">Podiums</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('coach')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition text-left ${
                activeTab === 'coach'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <span>🛡️</span>
              <span className="truncate">Espace Prépa (Validation)</span>
            </button>
          </nav>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-rose-500/20 border border-rose-400/50 flex items-center justify-center text-lg">
              {currentAvatar.emoji}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-white truncate">
                {currentPlayer.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {currentPlayer.poste} • Série {currentPlayer.streakCount}/3
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenJoinModal}
            className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs transition"
          >
            🔗 Rejoindre par Lien
          </button>
        </div>
      </aside>

      {/* ZONE PRINCIPALE PLEIN ÉCRAN */}
      <div className="flex-1 flex flex-col min-w-0 w-full bg-[#070b14]">
        <header className="bg-[#0b1120]/95 border-b border-slate-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img
              src={DEFAULT_LOGO_URL}
              alt="Logo Rugby Club Amiénois"
              className="w-6 h-6 rounded-md object-contain bg-slate-900/80 border border-sky-400/40 p-0.5"
            />
            <span className="text-sm font-black tracking-wide text-white">
              Rugby Club Amiénois 🎅
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenExtraModal}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white transition"
            >
              + Séance Extra <span className="text-amber-400">+20 PTS</span>
            </button>
            <div className="px-3 py-1.5 rounded-full bg-slate-800/90 border border-amber-400/30 text-xs font-black text-amber-400">
              🪙 {currentPlayer.points} PTS
            </div>
          </div>
        </header>

        {toast && (
          <div className="mx-4 mt-2.5 flex items-center justify-between bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-2 rounded-xl text-xs font-semibold">
            <span>✅ {toast}</span>
            <button type="button" onClick={() => setToast(null)}>
              ✖
            </button>
          </div>
        )}

        {badgeInfo && (
          <div className="mx-4 mt-2.5 flex items-center justify-between gap-3 bg-slate-900 border border-amber-400/60 text-amber-100 px-4 py-2.5 rounded-xl text-xs">
            <span>
              <strong className="text-amber-300">
                {badgeInfo.emoji} {badgeInfo.label}
              </strong>{' '}
              ({badgeInfo.playerName}) : {badgeInfo.meaning}
            </span>
            <button
              type="button"
              onClick={() => setBadgeInfo(null)}
              className="text-slate-400 hover:text-white font-bold shrink-0"
            >
              ✖
            </button>
          </div>
        )}

        <main className="flex-1 px-4 py-3 w-full flex flex-col space-y-3">
          {activeTab === 'map' && (
            <>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <span>🎄</span>
                  <span>Challenge Noël</span>
                </h2>
                <p className="text-xs text-slate-300">
                  • Départ d&apos;une séance → séance validée → déblocage de la
                  séance d&apos;après • 3 séances d&apos;affilée = un badge et
                  des points bonus.
                </p>
              </div>

              <div className="relative flex-1 min-h-[720px] w-full rounded-2xl border border-slate-700/80 bg-gradient-to-b from-slate-800 via-emerald-950 to-slate-900 overflow-hidden shadow-2xl">
                <img
                  src={DEFAULT_FIELD_URL}
                  alt="Terrain enneigé"
                  className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none"
                />
                <div className="absolute inset-0 bg-slate-950/25 pointer-events-none" />

                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
                >
                  <polyline
                    points={trailPoints}
                    fill="none"
                    stroke="#fde047"
                    strokeWidth="0.85"
                    strokeDasharray="1.6 1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <div
                  style={{ left: '60%', top: '5%' }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-[6] text-2xl pointer-events-none drop-shadow"
                  aria-hidden="true"
                >
                  ⭐
                </div>

                <div
                  style={{
                    left: `${santaPos.x}%`,
                    top: `${santaPos.y}%`,
                    transform: 'translate(-150%, -50%)',
                  }}
                  className="absolute z-20 pointer-events-none transition-all duration-700 ease-out flex items-center"
                >
                  <span className="px-2 py-1 rounded-xl bg-rose-600 text-white text-xs font-black shadow-lg whitespace-nowrap">
                    🎅🛷
                  </span>
                </div>

                {sessions.map((s, idx) => {
                  const unlocked = isSessionUnlocked(idx);
                  const isValidated = currentPlayer.completedIds.includes(s.id);
                  const isExtra = s.kind === 'extra';
                  const isGift = s.kind === 'gift';

                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => openSessionModal(s, idx)}
                      style={{ left: `${s.mapPos.x}%`, top: `${s.mapPos.y}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group ${
                        !unlocked ? 'opacity-65' : ''
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base border-2 shadow-xl transition transform ${
                          unlocked
                            ? 'group-hover:scale-110'
                            : 'cursor-not-allowed'
                        } ${
                          !unlocked
                            ? 'bg-slate-900/95 border-slate-600 text-slate-400'
                            : isValidated
                            ? 'bg-emerald-500 border-emerald-200 text-slate-950'
                            : isGift
                            ? 'bg-amber-400 border-white text-slate-950'
                            : isExtra
                            ? 'bg-purple-600 border-amber-300 text-white'
                            : 'bg-slate-900/95 border-amber-400/80 text-amber-300'
                        }`}
                      >
                        {!unlocked
                          ? '🔒'
                          : isGift
                          ? '🎁'
                          : isExtra
                          ? '🔥'
                          : '🏉'}
                      </div>

                      {!unlocked && (
                        <span className="mt-0.5 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-600 text-slate-300 text-[9px] font-black uppercase tracking-wider shadow">
                          BLOQUÉ
                        </span>
                      )}
                      {unlocked && isValidated && (
                        <span className="mt-0.5 px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow">
                          VALIDÉ
                        </span>
                      )}
                      {unlocked && isExtra && !isValidated && (
                        <span className="mt-0.5 px-1.5 py-0.5 rounded bg-purple-600 text-white text-[9px] font-black uppercase tracking-wider shadow">
                          EXTRA
                        </span>
                      )}

                      <span className="mt-0.5 px-2 py-0.5 rounded bg-slate-950/90 border border-white/10 text-[10px] font-bold text-white whitespace-nowrap max-w-[135px] truncate shadow">
                        {s.mapLabel}
                      </span>
                      <span className="text-[9px] font-semibold text-amber-200 bg-slate-950/80 px-1.5 rounded mt-0.5 max-w-[135px] truncate">
                        {s.mapSubLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === 'podiums' && (
            <div className="space-y-6 w-full">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <span>🎄</span>
                  <span>Challenge Noël • Podiums</span>
                </h2>
                <p className="text-xs text-slate-300">
                  • Départ d&apos;une séance → séance validée → déblocage de la
                  séance d&apos;après • 3 séances d&apos;affilée = un badge et
                  des points bonus.
                </p>
              </div>

              <section className="bg-[#0b1120] border border-amber-400/45 rounded-2xl p-5 space-y-2 shadow-lg">
                <p className="text-xs font-black uppercase tracking-wider text-amber-400">
                  1. Classement Global • Podium
                </p>
                <PodiumMarches
                  list={top3Global}
                  emptyText="Aucun joueur classé."
                  onSelectBadge={(b, playerName) =>
                    setBadgeInfo({ ...b, playerName })
                  }
                />
              </section>

              <section className="bg-[#0b1120] border border-slate-800 rounded-2xl p-5 space-y-3">
                <p className="text-xs font-black uppercase tracking-wider text-sky-400">
                  2. Clash Avants / Trois-Quarts
                </p>

                <div className="flex items-center justify-between text-xs sm:text-sm font-black">
                  <span className="text-amber-300">
                    🦏 Avants •{' '}
                    <span className="text-white">{avantsPoints} PTS</span>
                  </span>
                  <span className="text-sky-300">
                    Trois-Quarts 🐆 •{' '}
                    <span className="text-white">{troisQuartsPoints} PTS</span>
                  </span>
                </div>

                <div className="w-full h-6 rounded-full bg-slate-800 overflow-hidden flex border border-slate-700 font-black text-[11px]">
                  <div
                    style={{ width: `${avantsPct}%` }}
                    className="h-full bg-amber-400 text-slate-950 flex items-center justify-center transition-all duration-300 shrink-0"
                  >
                    {avantsPct >= 12 ? `${avantsPct}%` : ''}
                  </div>
                  <div
                    style={{ width: `${troisQuartsPct}%` }}
                    className="h-full bg-sky-500 text-white flex items-center justify-center transition-all duration-300 shrink-0"
                  >
                    {troisQuartsPct >= 12 ? `${troisQuartsPct}%` : ''}
                  </div>
                </div>
              </section>

              <section className="bg-[#0b1120] border border-slate-800 rounded-2xl p-5 space-y-4">
                <p className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  3. Podiums par Poste
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {ROLES.map((role) => {
                    const roleTop3 = sortedPlayers
                      .filter((p) => p.roleId === role.id)
                      .slice(0, 3);
                    return (
                      <div
                        key={role.id}
                        className="bg-slate-900/85 border border-slate-800 rounded-2xl p-4 space-y-2"
                      >
                        <h3 className="font-black text-sm text-white border-b border-slate-800 pb-2 text-center">
                          {role.label}
                        </h3>
                        <PodiumMarches
                          list={roleTop3}
                          emptyText="Pas encore de joueur sur ce poste."
                          onSelectBadge={(b, playerName) =>
                            setBadgeInfo({ ...b, playerName })
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="bg-[#0b1120] border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-wider text-amber-400">
                      4. Mur des Séances
                    </p>
                    <p className="text-xs text-slate-400">
                      Ajoute une photo de séance et sa description, et vote avec
                      des cœurs ❤️.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={safeWallPage === 0}
                      onClick={() => setWallPage((p) => Math.max(0, p - 1))}
                      aria-label="Publications précédentes"
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-35 border border-slate-700 text-xs font-black text-white transition"
                    >
                      ←
                    </button>
                    <span className="text-[11px] font-bold text-slate-400">
                      {safeWallPage + 1} / {totalWallPages}
                    </span>
                    <button
                      type="button"
                      disabled={safeWallPage >= totalWallPages - 1}
                      onClick={() =>
                        setWallPage((p) => Math.min(totalWallPages - 1, p + 1))
                      }
                      aria-label="Publications suivantes"
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-35 border border-slate-700 text-xs font-black text-white transition"
                    >
                      →
                    </button>
                  </div>
                </div>

                <form
                  onSubmit={handleCreateWallPost}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3"
                >
                  <input
                    type="text"
                    value={postDescription}
                    onChange={(e) => setPostDescription(e.target.value)}
                    placeholder={`Description de la séance pour ${currentPlayer.name} (ex: 6,5 km en 31 min...)`}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="text-xs font-bold text-slate-300 cursor-pointer">
                      📷 Photo de la séance :
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleWallPhotoUpload}
                        className="block mt-1 text-[11px] text-slate-400"
                      />
                    </label>

                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition"
                    >
                      Publier sur le Mur des Séances
                    </button>
                  </div>

                  {postPhotoUrl && (
                    <img
                      src={postPhotoUrl}
                      alt="Aperçu séance"
                      className="w-32 h-24 object-cover rounded-xl border border-amber-400/50"
                    />
                  )}
                </form>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {visibleWallPosts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-slate-900/85 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        <img
                          src={post.photoUrl}
                          alt={post.caption}
                          className="w-full h-40 object-cover border-b border-slate-800"
                        />
                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xl shrink-0">
                                {AVATARS.find((a) => a.id === post.avatarId)
                                  ?.emoji || '🏉'}
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-black text-white truncate">
                                  {post.playerName}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {post.poste} • {post.createdAt}
                                </p>
                              </div>
                            </div>
                            {post.id === topHeartsPostId && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-[10px] font-black text-amber-300 shrink-0">
                                ⭐ Top Cœurs
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                            {post.caption}
                          </p>
                        </div>
                      </div>

                      <div className="px-4 py-3 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-xs text-slate-400">Voter</span>
                        <button
                          type="button"
                          onClick={() => handleToggleHeart(post.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black border transition ${
                            post.likedByMe
                              ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                              : 'bg-slate-950 border-slate-700 text-slate-200 hover:border-rose-400/50'
                          }`}
                        >
                          ❤️ {post.hearts}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'coach' && (
            <div className="space-y-6 w-full">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <span>🎄</span>
                  <span>Challenge Noël • Espace Prépa</span>
                </h2>
                <p className="text-xs text-slate-300">
                  • Départ d&apos;une séance → séance validée → déblocage de la
                  séance d&apos;après • 3 séances d&apos;affilée = un badge et
                  des points bonus.
                </p>
              </div>

              {!coachUnlocked ? (
                <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-5">
                  <form onSubmit={handleCoachSubmit} className="space-y-3">
                    <h3 className="text-base font-black text-white">
                      🛡️ Accès Staff
                    </h3>
                    <p className="text-xs text-slate-400">
                      Entre le code préparateur physique pour consulter les
                      séances validées, vérifier toutes les séances sur le
                      terrain et modifier leur contenu.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="password"
                        value={coachCode}
                        onChange={(e) => setCoachCode(e.target.value)}
                        placeholder="Code Prépa (1900)"
                        className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm"
                      >
                        Déverrouiller
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  <section className="bg-[#0b1120] border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-white">
                        Suivi des joueurs & publications ({players.length}{' '}
                        joueurs • {submissions.length} validations)
                      </h3>
                      <button
                        type="button"
                        onClick={() => setCoachUnlocked(false)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                      >
                        Verrouiller
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {players.map((p) => (
                        <div
                          key={p.id}
                          className="rounded-xl bg-slate-900/90 border border-slate-800 px-3.5 py-2.5 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-black text-white truncate">
                              {AVATARS.find((a) => a.id === p.avatarId)
                                ?.emoji || '🏉'}{' '}
                              {p.name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {p.poste} • {p.completedIds.length} séance(s)
                            </p>
                          </div>
                          <span className="text-xs font-black text-amber-400 shrink-0">
                            {p.points} PTS
                          </span>
                        </div>
                      ))}
                    </div>

                    {submissions.length === 0 ? (
                      <p className="text-xs text-slate-400">
                        Aucune séance soumise pour le moment.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {submissions.map((sub) => (
                          <div
                            key={sub.id}
                            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">
                                {AVATARS.find((a) => a.id === sub.avatarId)
                                  ?.emoji || '🏉'}
                              </span>
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-black text-sm text-white">
                                    {sub.playerName}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    • {sub.poste}{' '}
                                    {sub.createdAt ? `• ${sub.createdAt}` : ''}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                      sub.status === 'approved'
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                        : sub.status === 'rejected'
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    }`}
                                  >
                                    {sub.status === 'approved'
                                      ? 'Photo validée'
                                      : sub.status === 'rejected'
                                      ? 'Refusée'
                                      : 'À valider'}
                                  </span>
                                </div>
                                <p className="text-xs font-bold text-sky-300">
                                  {sub.sessionTitle} (+{sub.points} PTS)
                                </p>
                                {sub.photoUrl && (
                                  <img
                                    src={sub.photoUrl}
                                    alt={`Preuve ${sub.playerName}`}
                                    className="w-28 h-20 object-cover rounded-xl border border-slate-700 mt-1.5"
                                  />
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateSubmissionStatus(
                                    sub.id,
                                    'approved'
                                  )
                                }
                                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition"
                              >
                                ✅ Valider la photo
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateSubmissionStatus(
                                    sub.id,
                                    'rejected'
                                  )
                                }
                                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 border border-slate-700 hover:border-rose-500/50 text-slate-200 hover:text-rose-200 font-bold text-xs transition"
                              >
                                Refuser
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="bg-[#0b1120] border border-amber-400/40 rounded-2xl p-5 space-y-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-amber-400">
                        Aperçu Terrain & Édition en Direct des Séances
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Clique sur n’importe quelle étape du petit terrain pour
                        la charger et modifier son texte : la mise à jour est
                        immédiate sur le parcours joueur.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                      <div className="lg:col-span-5 relative h-[340px] rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-800 via-emerald-950 to-slate-900 overflow-hidden">
                        <img
                          src={DEFAULT_FIELD_URL}
                          alt="Petit terrain RCA"
                          className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-slate-950/25 pointer-events-none" />

                        <svg
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
                        >
                          <polyline
                            points={trailPoints}
                            fill="none"
                            stroke="#fde047"
                            strokeWidth="0.85"
                            strokeDasharray="1.6 1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>

                        {sessions.map((s) => {
                          const isSelected = s.id === editingSession.id;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setEditingSessionId(s.id)}
                              style={{
                                left: `${s.mapPos.x}%`,
                                top: `${s.mapPos.y}%`,
                              }}
                              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group"
                            >
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm border-2 shadow-lg transition ${
                                  isSelected
                                    ? 'bg-amber-400 border-white text-slate-950 scale-110'
                                    : 'bg-slate-900/95 border-amber-400/70 text-amber-200 group-hover:scale-105'
                                }`}
                              >
                                {s.kind === 'gift'
                                  ? '🎁'
                                  : s.kind === 'extra'
                                  ? '🔥'
                                  : '🏉'}
                              </div>
                              <span
                                className={`mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold whitespace-nowrap max-w-[95px] truncate ${
                                  isSelected
                                    ? 'bg-amber-400 text-slate-950'
                                    : 'bg-slate-950/90 text-white'
                                }`}
                              >
                                {s.mapLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="lg:col-span-7 bg-slate-900/85 border border-slate-800 rounded-2xl p-4 space-y-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <select
                            value={editingSession.id}
                            onChange={(e) =>
                              setEditingSessionId(e.target.value)
                            }
                            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white"
                          >
                            {sessions.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.title}
                              </option>
                            ))}
                          </select>
                          <span className="text-[11px] font-semibold text-emerald-300">
                            ● Synchronisé en direct
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <label className="text-xs font-bold text-slate-300 space-y-1">
                            <span>Titre de la séance</span>
                            <input
                              type="text"
                              value={editingSession.title}
                              onChange={(e) =>
                                handleUpdateSessionField(
                                  editingSession.id,
                                  (prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                  })
                                )
                              }
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                            />
                          </label>

                          <label className="text-xs font-bold text-slate-300 space-y-1">
                            <span>Sous-titre</span>
                            <input
                              type="text"
                              value={editingSession.subtitle}
                              onChange={(e) =>
                                handleUpdateSessionField(
                                  editingSession.id,
                                  (prev) => ({
                                    ...prev,
                                    subtitle: e.target.value,
                                  })
                                )
                              }
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                            />
                          </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {ROLES.map((r) => (
                            <label
                              key={r.id}
                              className="text-[11px] font-bold text-slate-300 space-y-1"
                            >
                              <span>{r.label}</span>
                              <input
                                type="text"
                                value={editingSession.consigneByRole[r.id]}
                                onChange={(e) =>
                                  handleUpdateSessionField(
                                    editingSession.id,
                                    (prev) => ({
                                      ...prev,
                                      consigneByRole: {
                                        ...prev.consigneByRole,
                                        [r.id]: e.target.value,
                                      },
                                    })
                                  )
                                }
                                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                              />
                            </label>
                          ))}
                        </div>

                        <div className="space-y-2.5">
                          {editingSession.blocks.map((block, bIdx) => (
                            <div
                              key={bIdx}
                              className="rounded-xl bg-slate-950/90 border border-slate-800 p-3 space-y-1.5"
                            >
                              <p className="text-[11px] font-black uppercase text-amber-400">
                                {block.heading}
                              </p>
                              <textarea
                                rows={Math.max(2, block.lines.length)}
                                value={block.lines.join('\n')}
                                onChange={(e) => {
                                  const nextLines = e.target.value.split('\n');
                                  handleUpdateSessionField(
                                    editingSession.id,
                                    (prev) => ({
                                      ...prev,
                                      blocks: prev.blocks.map((item, idx) =>
                                        idx === bIdx
                                          ? { ...item, lines: nextLines }
                                          : item
                                      ),
                                    })
                                  );
                                }}
                                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 leading-relaxed"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODALE CONNEXION / INSCRIPTION JOUEUR PAR LIEN */}
      {joinModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#050914]/90 backdrop-blur-sm p-4 flex items-center justify-center">
          <form
            onSubmit={handleJoinSubmit}
            className="w-full max-w-md rounded-2xl border border-amber-400/60 bg-[#0b1120] p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                  PROFIL JOUEUR
                </span>
                <h2 className="text-lg font-black text-white mt-1.5">
                  Rejoindre le Challenge Noël
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inscris ton prénom, ton nom, ton poste et ton avatar pour
                  démarrer ton parcours.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setJoinModalOpen(false)}
                aria-label="Fermer"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-xs font-bold text-slate-200 space-y-1">
                <span>Prénom</span>
                <input
                  type="text"
                  required
                  value={joinFirstName}
                  onChange={(e) => setJoinFirstName(e.target.value)}
                  placeholder="Ex: Jules"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </label>

              <label className="text-xs font-bold text-slate-200 space-y-1">
                <span>Nom</span>
                <input
                  type="text"
                  required
                  value={joinLastName}
                  onChange={(e) => setJoinLastName(e.target.value)}
                  placeholder="Ex: Martin"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-200 block">
                Poste
              </span>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setJoinRoleId(r.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                      joinRoleId === r.id
                        ? 'bg-amber-400 text-slate-950 border-amber-300'
                        : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-200 block">
                Choisir l&apos;avatar
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setJoinAvatarId(av.id)}
                    className={`py-2 rounded-xl text-base border transition flex flex-col items-center ${
                      joinAvatarId === av.id
                        ? 'bg-amber-400/20 border-amber-400'
                        : 'bg-slate-950 border-slate-800 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <span>{av.emoji}</span>
                    <span className="text-[9px] font-bold text-slate-300 mt-0.5">
                      {av.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold transition"
            >
              Valider mon profil & charger ma progression
            </button>
          </form>
        </div>
      )}

      {/* MODALE SÉANCE EXTRA */}
      {extraModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#050914]/90 backdrop-blur-sm p-4 flex items-center justify-center">
          <form
            onSubmit={handleSubmitExtra}
            className="w-full max-w-md rounded-2xl border border-amber-400/60 bg-[#0b1120] p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                  +20 PTS
                </span>
                <h2 className="text-lg font-black text-white mt-1.5">
                  Valider une Séance Extra
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Insère une photo de ta séance extra pour l’envoyer à la
                  validation du staff.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setExtraModalOpen(false);
                  setExtraPhotoUrl(null);
                }}
                aria-label="Fermer"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
              <label className="text-xs font-bold text-slate-200 cursor-pointer block">
                📷 Photo obligatoire de la séance extra :
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleExtraPhotoUpload}
                  className="block mt-1.5 text-[11px] text-slate-400"
                />
              </label>

              {extraPhotoUrl && (
                <img
                  src={extraPhotoUrl}
                  alt="Aperçu séance extra"
                  className="w-full h-40 object-cover rounded-xl border border-amber-400/50"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={!extraPhotoUrl}
              className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-extrabold transition"
            >
              Envoyer la photo pour validation (+20 PTS)
            </button>
          </form>
        </div>
      )}

      {/* MODALE SÉANCE / CADEAU PLEIN ÉCRAN */}
      {openSession && (
        <div className="fixed inset-0 z-50 bg-[#050914]/95 backdrop-blur-sm overflow-y-auto p-4 sm:p-8 flex justify-center">
          <div className="w-full max-w-4xl my-auto space-y-5 relative">
            <button
              type="button"
              onClick={() => {
                setTimerRunning(false);
                setOpenSessionId(null);
              }}
              aria-label="Fermer"
              className="fixed top-5 right-5 w-11 h-11 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center text-lg font-bold shadow-lg"
            >
              ✕
            </button>

            <div className="space-y-2 pt-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3.5 py-1 rounded-full bg-blue-600 text-white text-xs font-extrabold">
                  {openSession.badgeDate}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                  {openSession.pointsLabel}
                </span>
                <span className="text-xs font-semibold text-rose-300">
                  🗓️ {openSession.deadlineText}
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {openSession.title}
              </h2>
              <p className="text-sm text-slate-400">{openSession.subtitle}</p>
            </div>

            {openSession.kind === 'gift' ? (
              <div className="rounded-2xl border border-amber-400/70 bg-[#0b1326] px-6 py-8 text-center space-y-3">
                <div className="text-6xl">🎁</div>
                <p className="text-base sm:text-xl font-black text-white max-w-2xl mx-auto leading-relaxed">
                  {openSession.id === 'c1-noel'
                    ? 'J’espère que vous profitez bien avec votre famille. Prenez-vous en photo et insérez dedans.'
                    : 'Prenez-vous en photo pour le Nouvel An et insérez dedans.'}
                </p>
              </div>
            ) : (
              <>
                {openSession.category === 'course' && (
                  <div className="rounded-2xl border border-amber-400/70 bg-[#0b1326] px-5 py-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                        CHOISIS TON POSTE POUR VOIR LA DISTANCE
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {ROLES.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => handleRoleSelect(r.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                              selectedRole === r.id
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
                            }`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-wider text-sky-300">
                          {currentRoleObj.label.toUpperCase()}
                        </p>
                        <p className="text-lg sm:text-xl font-black text-white mt-0.5">
                          {openSession.consigneByRole[selectedRole]}
                        </p>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold italic text-amber-300">
                        {openSession.consigneRightHint}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {openSession.blocks.map((block, bIdx) => (
                    <div
                      key={bIdx}
                      className="rounded-2xl border border-slate-800 bg-[#0a1020] px-5 py-4 text-center space-y-1.5"
                    >
                      <p className="text-xs font-black uppercase tracking-wider text-amber-400">
                        {block.heading}
                      </p>
                      {block.lines.map((line, lIdx) => (
                        <p
                          key={lIdx}
                          className="text-sm sm:text-base text-slate-200 leading-relaxed"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-blue-800/60 bg-[#081229] px-5 py-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl text-amber-400">⏱️</span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">
                        CHRONO {chronoMode === 'course' ? 'COURSE' : 'SÉANCE'}
                      </p>
                      <p className="text-3xl font-black tracking-wider text-white font-mono">
                        {formatChrono(secondsLeft)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setChronoMode((m) =>
                          m === 'seance' ? 'course' : 'seance'
                        );
                        setTimerRunning(false);
                        setSecondsLeft(
                          chronoMode === 'seance'
                            ? 25 * 60
                            : openSession.defaultSeconds
                        );
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition"
                    >
                      Chrono Course
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimerRunning((r) => !r)}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition"
                    >
                      {timerRunning ? '❚❚ Pause' : '▶ Start'}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="rounded-2xl border border-slate-800 bg-[#0a1020] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
              <label className="text-xs font-bold text-slate-200 cursor-pointer">
                📷{' '}
                {openSession.kind === 'gift'
                  ? 'Insérer votre photo :'
                  : 'Joindre une photo de séance / GPS (optionnel) :'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProofUpload}
                  className="block mt-1 text-[11px] text-slate-400"
                />
              </label>
              {proofPhotoUrl && (
                <img
                  src={proofPhotoUrl}
                  alt="Aperçu preuve"
                  className="w-16 h-12 object-cover rounded-lg border border-amber-400/50"
                />
              )}
            </div>

            <button
              type="button"
              onClick={() => handleValidateSession(openSession)}
              className="w-full py-3.5 px-5 rounded-2xl border border-amber-300 bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-extrabold text-center transition"
            >
              {currentPlayer.completedIds.includes(openSession.id)
                ? '✅ Séance déjà validée • Renvoyer / Joindre une photo'
                : `Valider la séance (+${openSession.points} PTS)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
