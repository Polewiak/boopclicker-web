const STORAGE_KEY = 'boopclicker-save-v5';
const SAVE_INTERVAL_SECONDS = 5;
const LOOP_INTERVAL_MS = 100;
const BASE_BPC = 1;
const BASE_BPS = 0;
const BASE_CRIT_CHANCE = 0.03;
const BASE_OFFLINE_EFFICIENCY = 0.5;
const PRESTIGE_THRESHOLD = 1_000_000;
const DEBUG_BOOST_AMOUNT = 10_000_000;
const BOOP_IMAGE_DEFAULT_SRC = 'assets/Default_Character_Idle.png';
const BOOP_IMAGE_PRESSED_SRC = 'assets/Default_Character_Booped.png';
const BOOP_FACE_DURATION_MS = 350;
const numberFormatter = new Intl.NumberFormat('pl-PL');
const DAILY_BOX_COOLDOWN_MS = 24 * 60 * 60 * 1000;
// Layout note: #main-layout (grid under the fixed top bar) now owns the two-column view,
// and previous full-height centering rules were dropped to remove the desktop blank space.

const ALL_TITLES = [
  { id: 'none', name: 'No Title' },
  { id: 'cert_booper', name: 'Certified Booper' },
  { id: 'critical_paw', name: 'Critical Paw' },
  { id: 'himbo_specialist', name: 'Himbo Specialist' },
  { id: 'snoot_mage', name: 'Snoot Mage' },
  { id: 'boop_deity', name: 'Boop Deity' },
];

function formatNumber(value) {
  if (!gameState?.settings?.shortNumbers) {
    return numberFormatter.format(value);
  }
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return numberFormatter.format(value);
}

function getTitleById(id) {
  return ALL_TITLES.find((title) => title.id === id) || ALL_TITLES[0];
}

const bpcUpgradesConfig = [
  {
    id: 'earFlicker',
    name: 'Energetic Ear Flicker',
    description: '+1 boop per click.',
    icon: '🐾',
    cost: 100,
    bpcFlatBonus: 1,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'boyBopper',
    name: 'Boy Bopper',
    description: '+1 boop per click.',
    icon: '🦊',
    cost: 500,
    bpcFlatBonus: 1,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'himboHooters',
    name: 'Himbo Hooters',
    description: '+2 boops per click.',
    icon: '🐻',
    cost: 2000,
    bpcFlatBonus: 2,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'doubleTap',
    name: 'Double Tap Technique',
    description: '+2 boops per click.',
    icon: '🐱',
    cost: 5000,
    bpcFlatBonus: 2,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'noseTargeting',
    name: 'Advanced Nose Targeting',
    description: '+3 boops per click.',
    icon: '🐶',
    cost: 10_000,
    bpcFlatBonus: 3,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'softPawPads',
    name: 'Soft Paw Pads',
    description: '+3 boops per click.',
    icon: '🐹',
    cost: 25_000,
    bpcFlatBonus: 3,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'emotionalSupportBoops',
    name: 'Emotional Support Boops',
    description: '+4 boops per click.',
    icon: '🐰',
    cost: 50_000,
    bpcFlatBonus: 4,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'boopWorkshops',
    name: 'Boop Workshops',
    description: '+5 boops per click.',
    icon: '🦁',
    cost: 100_000,
    bpcFlatBonus: 5,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'thumbEndurance',
    name: 'Thumb Endurance Training',
    description: '+6 boops per click.',
    icon: '🐯',
    cost: 250_000,
    bpcFlatBonus: 6,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'boopDiploma',
    name: 'Boopology Diploma',
    description: '+7 boops per click.',
    icon: '🎓',
    cost: 500_000,
    bpcFlatBonus: 7,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'fandomClout',
    name: 'Fandom Clout',
    description: '+8 boops per click.',
    icon: '📣',
    cost: 1_000_000,
    bpcFlatBonus: 8,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'pawCareRoutine',
    name: 'Paw Care Routine',
    description: '+9 boops per click.',
    icon: '🧴',
    cost: 2_000_000,
    bpcFlatBonus: 9,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'boopMerch',
    name: 'Official Boop Merch',
    description: '+10 boops per click.',
    icon: '👕',
    cost: 5_000_000,
    bpcFlatBonus: 10,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'limitedPrintBadges',
    name: 'Limited Print Badges',
    description: '+12 boops per click.',
    icon: '🎟️',
    cost: 10_000_000,
    bpcFlatBonus: 12,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'clickerMuscleMemory',
    name: 'Clicker Muscle Memory',
    description: '+14 boops per click.',
    icon: '💪',
    cost: 25_000_000,
    bpcFlatBonus: 14,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'snootRadar',
    name: 'Snoot Radar',
    description: '+16 boops per click.',
    icon: '📡',
    cost: 50_000_000,
    bpcFlatBonus: 16,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'collabStream',
    name: 'Collab Stream',
    description: '+18 boops per click.',
    icon: '📹',
    cost: 100_000_000,
    bpcFlatBonus: 18,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'boopUniversity',
    name: 'Boop University Chair',
    description: '+20 boops per click.',
    icon: '🏛️',
    cost: 250_000_000,
    bpcFlatBonus: 20,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'brandDeals',
    name: 'Brand Deals',
    description: '+22 boops per click.',
    icon: '📦',
    cost: 500_000_000,
    bpcFlatBonus: 22,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'conGoerLegend',
    name: 'Con-Goer Legend',
    description: "Everyone at conventions knows you as 'that boop person'.",
    icon: '🎭',
    cost: 1_000_000_000,
    bpcFlatBonus: 24,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'hyperFocus',
    name: 'Hyperfocus Mode',
    description: '+26 boops per click.',
    icon: '🧠',
    cost: 2_000_000_000,
    bpcFlatBonus: 26,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'boopCult',
    name: 'Boop Cult',
    description: '+28 boops per click.',
    icon: '🔥',
    cost: 5_000_000_000,
    bpcFlatBonus: 28,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'crossUniverseFanbase',
    name: 'Cross-Universe Fanbase',
    description: 'Your boops trend in alternate timelines (+30 boops).',
    icon: '🌌',
    cost: 10_000_000_000,
    bpcFlatBonus: 30,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'mythicStatus',
    name: 'Mythic Booper Status',
    description: '+32 boops per click.',
    icon: '🐉',
    cost: 25_000_000_000,
    bpcFlatBonus: 32,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'timeLoopPractice',
    name: 'Time Loop Practice',
    description: '+34 boops per click.',
    icon: '⏳',
    cost: 50_000_000_000,
    bpcFlatBonus: 34,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'quantumClicks',
    name: 'Quantum Clicks',
    description: '+36 boops per click.',
    icon: '⚛️',
    cost: 100_000_000_000,
    bpcFlatBonus: 36,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'boopDeity',
    name: 'Ascended Boop Deity',
    description: '+38 boops per click.',
    icon: '🙏',
    cost: 250_000_000_000,
    bpcFlatBonus: 38,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'boopChurch',
    name: 'Church of the Holy Boop',
    description: '+40 boops per click.',
    icon: '⛪',
    cost: 500_000_000_000,
    bpcFlatBonus: 40,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'galacticAmbassador',
    name: 'Galactic Boop Ambassador',
    description: '+45 boops per click.',
    icon: '🚀',
    cost: 1_000_000_000_000,
    bpcFlatBonus: 45,
    purchased: false,
    wasAffordable: false,
  },
  {
    id: 'endOfAllSnoots',
    name: 'End of All Snoots',
    description: '+50 boops per click.',
    icon: '🌀',
    cost: 5_000_000_000_000,
    bpcFlatBonus: 50,
    purchased: false,
    wasAffordable: false,
  },
];

const autoBoopersConfig = [
  {
    id: 'feralToaster',
    name: 'Feral Toaster',
    description: 'A slightly possessed toaster that boops whenever something pops.',
    icon: '🐭',
    owned: 0,
    baseCost: 60,
    costGrowth: 1.15,
    baseBps: 0.5,
    wasAffordable: false,
  },
  {
    id: 'overworkedFoxIntern',
    name: 'Overworked Fox Intern',
    description: 'Fox intern clicking boop forms all night for exposure.',
    icon: '🐱',
    owned: 0,
    baseCost: 300,
    costGrowth: 1.15,
    baseBps: 3,
    wasAffordable: false,
  },
  {
    id: 'wolfgirlCallCenter',
    name: 'Wolfgirl Call Center',
    description: "Entire call center of wolfgirls on headsets saying 'boop?' all day.",
    icon: '🐶',
    owned: 0,
    baseCost: 2000,
    costGrowth: 1.15,
    baseBps: 20,
    wasAffordable: false,
  },
  {
    id: 'boomerangOtterCrew',
    name: 'Boomerang Otter Crew',
    description: 'They boop you, you boop them, boops come back around.',
    icon: '🦊',
    owned: 0,
    baseCost: 12_000,
    costGrowth: 1.15,
    baseBps: 120,
    wasAffordable: false,
  },
  {
    id: 'hyperHuskyStreamer',
    name: 'Hyperactive Husky Streamer',
    description: '24/7 chaos stream where chat redeems boops every second.',
    icon: '🐻',
    owned: 0,
    baseCost: 60_000,
    costGrowth: 1.15,
    baseBps: 600,
    wasAffordable: false,
  },
  {
    id: 'catgirlCafeShift',
    name: 'Catgirl Café Shift',
    description: 'Every order is served with a complimentary nose boop.',
    icon: '🐼',
    owned: 0,
    baseCost: 300_000,
    costGrowth: 1.15,
    baseBps: 3000,
    wasAffordable: false,
  },
  {
    id: 'nightshiftRaccoons',
    name: 'Nightshift Security Raccoons',
    description: 'They patrol all night and boop anything that moves.',
    icon: '🐯',
    owned: 0,
    baseCost: 1_500_000,
    costGrowth: 1.15,
    baseBps: 15_000,
    wasAffordable: false,
  },
  {
    id: 'neonFoxRave',
    name: 'Neon Fox Rave',
    description: 'Strobe lights, loud music, every beat is another boop.',
    icon: '🐨',
    owned: 0,
    baseCost: 8_000_000,
    costGrowth: 1.15,
    baseBps: 80_000,
    wasAffordable: false,
  },
  {
    id: 'dragonConBooth',
    name: 'Dragon Convention Booth',
    description: 'Huge con booth where the queue is only for nose boops.',
    icon: '🐷',
    owned: 0,
    baseCost: 40_000_000,
    costGrowth: 1.15,
    baseBps: 400_000,
    wasAffordable: false,
  },
  {
    id: 'corporateMascots',
    name: 'Corporate Fursuit Mascots',
    description: 'Brand deals and boop campaigns across the city.',
    icon: '🐸',
    owned: 0,
    baseCost: 200_000_000,
    costGrowth: 1.15,
    baseBps: 2_000_000,
    wasAffordable: false,
  },
  {
    id: 'interstellarPawMail',
    name: 'Interstellar Paw-mail Service',
    description: 'Every delivered package requires a confirmation boop.',
    icon: '🐔',
    owned: 0,
    baseCost: 1_000_000_000,
    costGrowth: 1.15,
    baseBps: 10_000_000,
    wasAffordable: false,
  },
  {
    id: 'parallelPawLab',
    name: 'Parallel Universe Paw-Lab',
    description: 'Lab that connects to parallel worlds and imports their boops.',
    icon: '🐵',
    owned: 0,
    baseCost: 6_000_000_000,
    costGrowth: 1.15,
    baseBps: 60_000_000,
    wasAffordable: false,
  },
  {
    id: 'quantumBoopCollider',
    name: 'Quantum Boop Collider',
    description: 'Smashes particles together to discover new, denser boops.',
    icon: '🐙',
    owned: 0,
    baseCost: 40_000_000_000,
    costGrowth: 1.15,
    baseBps: 400_000_000,
    wasAffordable: false,
  },
  {
    id: 'floofCouncil',
    name: 'Transdimensional Floof Council',
    description: 'Ancient beings deciding the fate of all boops across realities.',
    icon: '🐲',
    owned: 0,
    baseCost: 250_000_000_000,
    costGrowth: 1.15,
    baseBps: 2_500_000_000,
    wasAffordable: false,
  },
  {
    id: 'cosmicBoopEngine',
    name: 'Cosmic Boop Engine',
    description: 'A singularity that converts pure fluff into infinite boops.',
    icon: '🌌',
    owned: 0,
    baseCost: 1_000_000_000_000,
    costGrowth: 1.15,
    baseBps: 10_000_000_000,
    wasAffordable: false,
  },
];

const metaPerksConfig = [
  {
    id: 'stronger_pokes',
    name: 'Stronger Pokes',
    description: '+5% BPC (stały bonus).',
    cost: 1,
    purchased: false,
  },
  {
    id: 'idle_efficiency',
    name: 'Idle Efficiency',
    description: '+5% BPS (stały bonus).',
    cost: 1,
    purchased: false,
  },
  {
    id: 'crit_chance_up',
    name: 'Crit Chance Up',
    description: '+1% Critical Boop chance.',
    cost: 2,
    purchased: false,
  },
  {
    id: 'offline_mastery',
    name: 'Offline Mastery',
    description: '+25% efektywności offline.',
    cost: 3,
    purchased: false,
  },
];

const factionConfig = [
  {
    id: 'fox',
    name: 'Fox Clan',
    description: '+2% Critical Chance.',
    bonusType: 'crit',
    bonusValue: 0.02,
  },
  {
    id: 'wolf',
    name: 'Wolf Pack',
    description: '+2% BPS.',
    bonusType: 'bps',
    bonusValue: 0.02,
  },
  {
    id: 'dragon',
    name: 'Dragon Brood',
    description: '+2% BPC.',
    bonusType: 'bpc',
    bonusValue: 0.02,
  },
];

const skinsConfig = [
  {
    id: 'player1',
    name: 'Kordi',
    avatar: '🦊',
    owned: false,
    unlockCost: 500,
    unlockCode: null,
    boops: 0,
    public: true,
  },
  {
    id: 'player2',
    name: 'Lumina',
    avatar: '🐱',
    owned: false,
    unlockCost: 800,
    unlockCode: null,
    boops: 0,
    public: true,
  },
  {
    id: 'custom_slot',
    name: 'Your Custom Slot',
    avatar: '✨',
    owned: false,
    unlockCost: null,
    unlockCode: 'SLOT1234',
    boops: 0,
    public: false,
  },
  {
    id: 'pink_glow',
    name: 'Pink Glow',
    avatar: '✨',
    owned: false,
    unlockCost: null,
    unlockCode: 'achievement_prestige_1',
    boops: 0,
    public: false,
  },
];

const achievements = [
  {
    id: 'boop_100',
    name: 'Softpaw Starter',
    desc: 'Kliknij 100 razy.',
    rarity: 'common',
    condition: (state) => state.totalBoops >= 100,
    reward: { type: 'bpc_mult', value: 1.01 },
  },
  {
    id: 'boop_1000',
    name: 'Boop Apprentice',
    desc: 'Kliknij 1 000 razy.',
    rarity: 'rare',
    condition: (state) => state.totalBoops >= 1000,
    reward: { type: 'bpc_mult', value: 1.03 },
  },
  {
    id: 'crit_50',
    name: 'Critical Thinker',
    desc: 'Wylosuj 50 CRITów.',
    rarity: 'common',
    condition: (state) => state.totalCrits >= 50,
    reward: { type: 'bps_mult', value: 1.01 },
  },
  {
    id: 'auto_25',
    name: 'Factory Fur',
    desc: 'Kup 25 auto-booperów łącznie.',
    rarity: 'rare',
    condition: (state) => state.totalAutoBoopers >= 25,
    reward: { type: 'bpc_add', value: 5 },
  },
  {
    id: 'prestige_1',
    name: 'Ascended Paw',
    desc: 'Wykonaj 1 Prestige.',
    rarity: 'epic',
    condition: (state) => state.totalPrestiges >= 1,
    reward: { type: 'unlock_skin', skinId: 'pink_glow' },
  },
];

const gameState = {
  boops: 0,
  totalBoops: 0,
  bpc: BASE_BPC,
  bpcBase: BASE_BPC,
  bps: BASE_BPS,
  bpsBase: BASE_BPS,
  critChance: BASE_CRIT_CHANCE,
  critMultiplier: 7,
  lastCritValue: 0,
  bpcUpgrades: bpcUpgradesConfig.map((upgrade) => ({ ...upgrade })),
  autoBoopers: autoBoopersConfig.map((booper) => ({ ...booper })),
  metaPerks: metaPerksConfig.map((perk) => ({ ...perk })),
  skins: skinsConfig.map((skin) => ({ ...skin })),
  currentSkinId: 'player1',
  playerName: 'Anonymous',
  playerAvatar: '🧸',
  playerTitleId: 'none',
  unlockedTitleIds: ['none', 'cert_booper'],
  factions: factionConfig.map((faction) => ({ ...faction })),
  currentFaction: null,
  factionBonus: { crit: 0, bps: 0, bpc: 0 },
  boopEssence: 0,
  globalMultiplier: 1,
  bpcMultiplier: 1,
  bpsMultiplier: 1,
  bpcFlatBonus: 0,
  offlineEfficiency: BASE_OFFLINE_EFFICIENCY,
  prestigeThreshold: PRESTIGE_THRESHOLD,
  achievementsUnlocked: [],
  unlockedSkins: [],
  boopers: [],
  skinHighscores: [],
  settings: {
    soundEnabled: true,
    particlesEnabled: true,
    shortNumbers: true,
    showOrbitCrew: true,
    showGroundParade: true,
    showBoopRain: true,
  },
  totalClicks: 0,
  totalCrits: 0,
  totalPrestiges: 0,
  totalAutoBoopers: 0,
  lastUpdate: Date.now(),
  dailyBoxLastOpened: null,
  dailyBoxAvailable: true,
};

let intervalId = null;
let saveTimer = 0;
let offlineNoticeTimeout = null;
let passiveGainRemainder = 0;
let storeNeedsRender = true;
let lastUnlockedClickCount = 0;
let factionOverlayRendered = false;
let boopHoldActive = false;
let boopPressTimeout = null;
let boopHoldFinished = false;
let lastParadeSignature = '';

const ui = {
  boopPlayerName: document.getElementById('boop-player-name'),
  boopCountValue: document.getElementById('boop-count-value'),
  boopBpsValue: document.getElementById('boop-bps-value'),
  boopPanel: document.getElementById('boop-panel'),
  boopArea: document.getElementById('boop-area'),
  boopButton: document.getElementById('boop-button'),
  orbitCrewLayer: document.getElementById('orbit-crew-layer'),
  groundParadeLayer: document.getElementById('ground-parade-layer'),
  boopRainLayer: document.getElementById('boop-rain-layer'),
  offlineNotice: document.getElementById('offlineNotice'),
  critPopup: document.getElementById('crit-popup'),
  clickUpgradesGrid: document.getElementById('click-upgrades-grid'),
  clickUpgradeTooltip: document.getElementById('click-upgrade-tooltip'),
  autoUpgradesContainer: document.getElementById('auto-upgrades-container'),
  autoBooperTooltip: document.getElementById('auto-booper-tooltip'),
  metaPerksContainer: document.getElementById('meta-perks-container'),
  metaBeValue: document.getElementById('meta-be-value'),
  profileName: document.getElementById('profile-name'),
  profileAvatar: document.getElementById('profile-avatar'),
  profileTitle: document.getElementById('profile-title-display'),
  profileTitleSelect: document.getElementById('profile-title-select'),
  currentSkinBoops: document.getElementById('current-skin-boops'),
  topSkinName: document.getElementById('top-skin-name'),
  topSkinBoops: document.getElementById('top-skin-boops'),
  skinsGrid: document.getElementById('skins-grid'),
  skinCodeInput: document.getElementById('skin-code-input'),
  skinCodeButton: document.getElementById('skin-code-button'),
  skinCodeMessage: document.getElementById('skin-code-message'),
  topBoopersList: document.getElementById('top-boopers-list'),
  topSkinsList: document.getElementById('top-skins-list'),
  factionCurrent: document.getElementById('faction-current'),
  factionChoiceContainer: document.getElementById('faction-choice-container'),
  prestigeTotalBoops: document.getElementById('total-boops-value'),
  boopEssence: document.getElementById('boop-essence-value'),
  prestigeGain: document.getElementById('prestige-gain-value'),
  globalMultiplier: document.getElementById('global-multiplier-value'),
  prestigeButton: document.getElementById('prestige-button'),
  statsTotalClicks: document.getElementById('stats-total-clicks'),
  statsTotalCrits: document.getElementById('stats-total-crits'),
  statsTotalPrestiges: document.getElementById('stats-total-prestiges'),
  statsCritChance: document.getElementById('stats-crit-chance'),
  statsCritMultiplier: document.getElementById('stats-crit-multiplier'),
  statsBpcMultiplier: document.getElementById('stats-bpc-multiplier'),
  statsBpsMultiplier: document.getElementById('stats-bps-multiplier'),
  statsGlobalMultiplier: document.getElementById('stats-global-multiplier'),
  achievementsGrid: document.getElementById('achievements-grid'),
  achievementsList: document.getElementById('achievements-list'),
  achievementToast: document.getElementById('achievement-toast'),
  debugAddBoopsButton: document.getElementById('debug-add-boops'),
  debugResetButton: document.getElementById('debug-reset'),
  factionOverlay: document.getElementById('faction-overlay'),
  factionOverlayChoices: document.getElementById('faction-overlay-choices'),
  shareText: document.getElementById('share-text'),
  shareCopyButton: document.getElementById('share-copy-button'),
  shareStatus: document.getElementById('share-status'),
  settingsSound: document.getElementById('settings-sound'),
  settingsParticles: document.getElementById('settings-particles'),
  settingsShortNumbers: document.getElementById('settings-shortnumbers'),
  settingsOrbitCrew: document.getElementById('settings-orbit-crew'),
  settingsGroundParade: document.getElementById('settings-ground-parade'),
  settingsBoopRain: document.getElementById('settings-boop-rain'),
  dailyBoxFloatButton: document.getElementById('daily-box-float-button'),
  dailyBoxFloatTimer: document.getElementById('daily-box-float-timer'),
};

const sfx = {
  boop: null,
  crit: null,
  buy: null,
};

function playSfx(name) {
  if (!gameState.settings?.soundEnabled) return;
  const audio = sfx[name];
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {
    // Audio playback can be blocked; ignore for now.
  });
}

function markStoreDirty() {
  storeNeedsRender = true;
}

function hideUpgradeTooltips() {
  if (ui.clickUpgradeTooltip) {
    ui.clickUpgradeTooltip.classList.add('hidden');
    ui.clickUpgradeTooltip.textContent = '';
  }
  if (ui.autoBooperTooltip) {
    ui.autoBooperTooltip.classList.add('hidden');
    ui.autoBooperTooltip.textContent = '';
  }
}

function getUnlockedClickUpgradeCount() {
  return gameState.bpcUpgrades.filter(
    (upgrade) => gameState.totalBoops >= (upgrade.unlockAt ?? upgrade.cost)
  ).length;
}

function updateStoreUI() {
  const unlockedCount = getUnlockedClickUpgradeCount();
  if (unlockedCount !== lastUnlockedClickCount) {
    storeNeedsRender = true;
  }

  if (storeNeedsRender) {
    renderUpgrades();
    storeNeedsRender = false;
  }

  updateUpgradeCardVisuals();
  updateAutoBooperCardVisuals();
}

function updateUpgradeCardVisuals() {
  const boops = gameState.boops;
  const visibleClicks = gameState.bpcUpgrades.filter((upgrade) => !upgrade.purchased).slice(0, 10);

  visibleClicks.forEach((upgrade) => {
    if (typeof upgrade.wasAffordable !== 'boolean') {
      upgrade.wasAffordable = false;
    }
    const card = document.getElementById(`${upgrade.id}-card`);
    if (!card) return;
    const unlocked = gameState.totalBoops >= (upgrade.unlockAt ?? upgrade.cost);
    const affordable = unlocked && !upgrade.purchased && boops >= upgrade.cost;

    card.classList.remove('upgrade-available', 'upgrade-unaffordable', 'upgrade-just-unlocked', 'locked');

    if (upgrade.purchased) {
      card.classList.add('purchased');
      return;
    }

    if (!unlocked) {
      card.classList.add('locked', 'upgrade-unaffordable');
      return;
    }

    if (affordable) {
      card.classList.add('upgrade-available');
      if (!upgrade.wasAffordable) {
        card.classList.add('upgrade-just-unlocked');
        upgrade.wasAffordable = true;
        setTimeout(() => card.classList.remove('upgrade-just-unlocked'), 800);
      }
    } else {
      card.classList.add('upgrade-unaffordable');
    }
  });

}

const modalControls = {
  backdrop: document.getElementById('modal-backdrop'),
  closeButton: document.getElementById('modal-close-button'),
  content: document.getElementById('modal-content'),
  stash: document.getElementById('modal-stash'),
};

function setupModals() {
  const buttons = document.querySelectorAll('.top-bar-icon');
  buttons.forEach((button) => {
    const targetId = button.getAttribute('data-modal');
    button.addEventListener('click', () => openModal(targetId));
  });

  modalControls.closeButton?.addEventListener('click', closeModal);
  modalControls.backdrop?.addEventListener('click', (event) => {
    if (event.target === modalControls.backdrop) {
      closeModal();
    }
  });
}

function updateAutoBooperCardVisuals() {
  const container = ui.autoUpgradesContainer;
  if (!container) return;

  let maxOwnedIndex = -1;
  gameState.autoBoopers.forEach((auto, index) => {
    if ((auto.owned || 0) > 0 && index > maxOwnedIndex) {
      maxOwnedIndex = index;
    }
    if (typeof auto.wasAffordable !== 'boolean') {
      auto.wasAffordable = false;
    }
  });
  const maxVisibleIndex = Math.min(gameState.autoBoopers.length - 1, maxOwnedIndex + 1);

  gameState.autoBoopers.forEach((auto, index) => {
    const card = document.getElementById(`${auto.id}-autocard`);
    if (!card) return;

    const iconEl = card.querySelector('.auto-booper-icon');
    const nameEl = card.querySelector('.auto-booper-name');
    const metaEl = card.querySelector('.auto-booper-meta');
    const costEl = card.querySelector('.auto-booper-cost');

    const prevOwned = index === 0 || (gameState.autoBoopers[index - 1].owned || 0) > 0;
    const unlocked = index === 0 ? true : prevOwned && index <= maxVisibleIndex;

    card.classList.remove('available', 'unavailable', 'locked', 'upgrade-just-unlocked');

    if (!unlocked) {
      card.classList.add('locked');
      if (iconEl) iconEl.textContent = '❔';
      if (nameEl) nameEl.textContent = '???';
      if (metaEl) metaEl.textContent = '';
      if (costEl) costEl.textContent = '???';
      return;
    }

    const currentCost = getAutoBooperCost(auto);
    const affordable = gameState.boops >= currentCost;

    if (iconEl) iconEl.textContent = auto.icon || '🏭';
    if (nameEl) nameEl.textContent = auto.name;
    if (metaEl)
      metaEl.textContent = `Owned: ${formatNumber(auto.owned || 0)} • ${formatNumber(getAutoBooperBps(auto))} boops/s`;
    if (costEl) costEl.textContent = `${formatNumber(currentCost)} boops`;

    card.classList.add(affordable ? 'available' : 'unavailable');
    if (affordable && !auto.wasAffordable) {
      card.classList.add('upgrade-just-unlocked');
      const targetCard = card;
      setTimeout(() => targetCard.classList.remove('upgrade-just-unlocked'), 800);
    }
    auto.wasAffordable = auto.wasAffordable || affordable;
  });
}

function openModal(targetId) {
  if (!targetId || !modalControls.backdrop || !modalControls.content || !modalControls.stash) {
    return;
  }

  if (modalControls.content.firstChild) {
    modalControls.stash.appendChild(modalControls.content.firstChild);
  }

  const target = document.getElementById(targetId);
  if (!target) {
    return;
  }

  hideUpgradeTooltips();
  modalControls.content.appendChild(target);
  if (targetId === 'stats-panel' || targetId === 'achievements-section') {
    updateStatsUI();
    updateAchievementsUI();
  }
  if (targetId === 'prestige-section') {
    updatePrestigeUI();
  }
  if (targetId === 'meta-perks-section') {
    renderMetaPerks();
  }
  if (targetId === 'faction-section') {
    renderFactions();
  }
  if (targetId === 'highscores-section') {
    renderHighscores();
  }
  modalControls.backdrop.classList.remove('hidden');
}

function closeModal() {
  if (modalControls.stash && modalControls.content?.firstChild) {
    modalControls.stash.appendChild(modalControls.content.firstChild);
  }
  modalControls.backdrop?.classList.add('hidden');
}

function initGame() {
  setupModals();
  loadGame();
  if (ui.boopButton) {
    ui.boopButton.src = BOOP_IMAGE_DEFAULT_SRC;
  }
  initSfx();
  initProfileUI();
  initTitleUI();
  initSettingsUI();
  initShareUI();
  initDailyBoxUI();
  renderFactionOverlay();
  if (!gameState.currentFaction) {
    showFactionOverlay();
  } else {
    hideFactionOverlay();
  }
  attachHandlers();
  markStoreDirty();
  updateUI();
  if (intervalId) {
    clearInterval(intervalId);
  }
  intervalId = setInterval(gameLoop, LOOP_INTERVAL_MS);
}

function initSfx() {
  try {
    sfx.boop = new Audio('assets/sfx/boop-01.mp3');
  } catch (error) {
    sfx.boop = null;
  }
  if (!sfx.boop) {
    sfx.boop = document.getElementById('sfx-boop');
  }
  sfx.crit = document.getElementById('sfx-crit');
  sfx.buy = document.getElementById('sfx-prestige');
}

function attachHandlers() {
  setupBoopButtonControls();
  ui.prestigeButton?.addEventListener('click', () => {
    doPrestige();
  });
  ui.debugAddBoopsButton?.addEventListener('click', grantDebugBoops);
  ui.debugResetButton?.addEventListener('click', handleDebugResetClick);
  ui.skinCodeButton?.addEventListener('click', handleSkinCodeSubmit);
  ui.skinCodeInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSkinCodeSubmit();
    }
  });
  window.addEventListener('beforeunload', saveGame);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
}

function initProfileUI() {
  const nameInput = document.getElementById('profile-name-input');
  const saveButton = document.getElementById('profile-save-button');

  if (!nameInput || !saveButton) return;

  nameInput.value = gameState.playerName || '';

  saveButton.addEventListener('click', () => {
    const newName = nameInput.value.trim() || 'Anonymous';

    gameState.playerName = newName;

    saveGame();
    updateUI();
  });
}

function renderTitleSelect() {
  const select = ui.profileTitleSelect;
  if (!select) return;

  select.innerHTML = '';
  (gameState.unlockedTitleIds || []).forEach((id) => {
    const title = getTitleById(id);
    if (!title) return;
    const opt = document.createElement('option');
    opt.value = title.id;
    opt.textContent = title.name;
    select.appendChild(opt);
  });

  select.value = gameState.playerTitleId || 'none';
}

function initTitleUI() {
  const select = ui.profileTitleSelect;
  if (!select) return;

  renderTitleSelect();

  select.addEventListener('change', () => {
    gameState.playerTitleId = select.value;
    saveGame();
    updateUI();
  });
}

function initSettingsUI() {
  const soundInput = ui.settingsSound;
  const particlesInput = ui.settingsParticles;
  const shortNumbersInput = ui.settingsShortNumbers;
  const orbitInput = ui.settingsOrbitCrew;
  const paradeInput = ui.settingsGroundParade;
  const rainInput = ui.settingsBoopRain;
  if (!soundInput || !particlesInput || !shortNumbersInput || !orbitInput || !paradeInput || !rainInput) return;

  soundInput.checked = !!gameState.settings.soundEnabled;
  particlesInput.checked = !!gameState.settings.particlesEnabled;
  shortNumbersInput.checked = !!gameState.settings.shortNumbers;
  orbitInput.checked = !!gameState.settings.showOrbitCrew;
  paradeInput.checked = !!gameState.settings.showGroundParade;
  rainInput.checked = !!gameState.settings.showBoopRain;

  soundInput.addEventListener('change', () => {
    gameState.settings.soundEnabled = soundInput.checked;
    saveGame();
  });
  particlesInput.addEventListener('change', () => {
    gameState.settings.particlesEnabled = particlesInput.checked;
    saveGame();
  });
  shortNumbersInput.addEventListener('change', () => {
    gameState.settings.shortNumbers = shortNumbersInput.checked;
    saveGame();
    updateUI();
  });
  orbitInput.addEventListener('change', () => {
    gameState.settings.showOrbitCrew = orbitInput.checked;
    saveGame();
    updateOrbitCrew();
  });
  paradeInput.addEventListener('change', () => {
    gameState.settings.showGroundParade = paradeInput.checked;
    saveGame();
    refreshGroundParade();
  });
  rainInput.addEventListener('change', () => {
    gameState.settings.showBoopRain = rainInput.checked;
    saveGame();
    updateBoopRainVisibility();
  });
}

function initDailyBoxUI() {
  const openBtn = ui.dailyBoxFloatButton;
  if (!openBtn) return;

  openBtn.addEventListener('click', () => {
    if (!gameState.dailyBoxAvailable) return;

    const min = 10;
    const max = 10000;
    const reward = Math.floor(Math.random() * (max - min + 1)) + min;

    gameState.boops += reward;
    gameState.totalBoops = (gameState.totalBoops || 0) + reward;
    gameState.dailyBoxLastOpened = Date.now();
    gameState.dailyBoxAvailable = false;

    saveGame();
    updateUI();
  });
}

function loadGame() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    gameState.lastUpdate = Date.now();
    return;
  }

  try {
    const data = JSON.parse(raw);
    gameState.boops = typeof data.boops === 'number' ? data.boops : gameState.boops;
    gameState.totalBoops = typeof data.totalBoops === 'number' ? data.totalBoops : gameState.totalBoops;
    gameState.critChance = BASE_CRIT_CHANCE;
    gameState.critMultiplier = typeof data.critMultiplier === 'number' ? data.critMultiplier : gameState.critMultiplier;
    gameState.lastCritValue = typeof data.lastCritValue === 'number' ? data.lastCritValue : 0;
    gameState.playerName = typeof data.playerName === 'string' ? data.playerName : gameState.playerName;
    gameState.playerAvatar = typeof data.playerAvatar === 'string' ? data.playerAvatar : gameState.playerAvatar;
    gameState.boopEssence = typeof data.boopEssence === 'number' ? data.boopEssence : 0;
    gameState.globalMultiplier = 1 + gameState.boopEssence * 0.02;
    gameState.bpcMultiplier = typeof data.bpcMultiplier === 'number' ? data.bpcMultiplier : 1;
    gameState.bpsMultiplier = typeof data.bpsMultiplier === 'number' ? data.bpsMultiplier : 1;
    gameState.offlineEfficiency = typeof data.offlineEfficiency === 'number' ? data.offlineEfficiency : BASE_OFFLINE_EFFICIENCY;
    gameState.prestigeThreshold = typeof data.prestigeThreshold === 'number' ? data.prestigeThreshold : PRESTIGE_THRESHOLD;
    gameState.lastUpdate = typeof data.lastUpdate === 'number' ? data.lastUpdate : Date.now();
    gameState.achievementsUnlocked = Array.isArray(data.achievementsUnlocked)
      ? Array.from(new Set(data.achievementsUnlocked))
      : [];
    if (gameState.achievementsUnlocked.length === 0 && Array.isArray(data.achievements)) {
      gameState.achievementsUnlocked = data.achievements
        .filter((item) => item?.unlocked)
        .map((item) => item.id);
    }
    gameState.unlockedSkins = Array.isArray(data.unlockedSkins)
      ? Array.from(new Set(data.unlockedSkins))
      : [];
    gameState.boopers = Array.isArray(data.boopers) ? data.boopers : [];
    gameState.skinHighscores = Array.isArray(data.skinHighscores) ? data.skinHighscores : [];
    gameState.settings = {
      soundEnabled: true,
      particlesEnabled: true,
      shortNumbers: true,
      showOrbitCrew: true,
      showGroundParade: true,
      showBoopRain: true,
      ...(typeof data.settings === 'object' ? data.settings : {}),
    };
    const savedSkins = Array.isArray(data.skins) ? data.skins : [];
    gameState.bpcUpgrades = restoreBpcUpgrades(data.bpcUpgrades);
    gameState.autoBoopers = restoreAutoBoopers(data.autoBoopers);
    gameState.metaPerks = restoreMetaPerks(data.metaPerks);
    gameState.skins = restoreSkins(savedSkins, gameState.unlockedSkins);
    const savedCurrentSkinId = typeof data.currentSkinId === 'string' ? data.currentSkinId : null;
    if (savedCurrentSkinId && gameState.skins.some((skin) => skin.id === savedCurrentSkinId)) {
      gameState.currentSkinId = savedCurrentSkinId;
    }
    getCurrentSkin();
    gameState.playerTitleId = typeof data.playerTitleId === 'string' ? data.playerTitleId : 'none';
    const loadedTitles = Array.isArray(data.unlockedTitleIds) ? data.unlockedTitleIds : ['none', 'cert_booper'];
    const ensuredTitles = new Set([...loadedTitles, 'none', 'cert_booper']);
    gameState.unlockedTitleIds = Array.from(ensuredTitles);
    gameState.bpcFlatBonus = typeof data.bpcFlatBonus === 'number' ? data.bpcFlatBonus : 0;
    gameState.totalClicks = Number(data.totalClicks) || 0;
    gameState.totalCrits = Number(data.totalCrits) || 0;
    gameState.totalPrestiges = Number(data.totalPrestiges) || 0;
    gameState.totalAutoBoopers = Number(data.totalAutoBoopers) || 0;
    if (data.totalAutoBoopers == null) {
      gameState.totalAutoBoopers = gameState.autoBoopers.reduce(
        (sum, booper) => sum + (booper.owned || 0),
        0
      );
    }
    const savedFactionId = typeof data.currentFaction === 'string' ? data.currentFaction : null;
    const factionExists = savedFactionId
      ? gameState.factions.some((faction) => faction.id === savedFactionId)
      : false;
    applyFactionBonusById(savedFactionId);
    if ((!savedFactionId || !factionExists) && typeof data.factionBonus === 'object') {
      gameState.factionBonus = {
        crit: Number(data.factionBonus.crit) || 0,
        bps: Number(data.factionBonus.bps) || 0,
        bpc: Number(data.factionBonus.bpc) || 0,
      };
    }
    gameState.dailyBoxLastOpened = data.dailyBoxLastOpened || null;
    gameState.dailyBoxAvailable = data.dailyBoxAvailable ?? true;
  } catch (error) {
    console.warn('Nie udało się wczytać zapisu', error);
  }

  recalculateProductionStats();
  applyOfflineProgress();
  syncAvatarWithSkin();
  checkAchievements();
  updateHighscores();
  markStoreDirty();
}

function saveGame() {
  updateBoopersLeaderboard();
  updateSkinHighscores();
  const payload = {
    boops: gameState.boops,
    totalBoops: gameState.totalBoops,
    bpc: gameState.bpc,
    bps: gameState.bps,
    critChance: gameState.critChance,
    critMultiplier: gameState.critMultiplier,
    lastCritValue: gameState.lastCritValue,
    bpcUpgrades: gameState.bpcUpgrades,
    autoBoopers: gameState.autoBoopers,
    metaPerks: gameState.metaPerks,
    skins: gameState.skins,
    currentSkinId: gameState.currentSkinId,
    playerName: gameState.playerName,
    playerAvatar: gameState.playerAvatar,
    playerTitleId: gameState.playerTitleId,
    unlockedTitleIds: gameState.unlockedTitleIds,
    achievementsUnlocked: gameState.achievementsUnlocked,
    unlockedSkins: gameState.unlockedSkins,
    boopers: gameState.boopers,
    skinHighscores: gameState.skinHighscores,
    currentFaction: gameState.currentFaction,
    factionBonus: gameState.factionBonus,
    boopEssence: gameState.boopEssence,
    globalMultiplier: gameState.globalMultiplier,
    bpcMultiplier: gameState.bpcMultiplier,
    bpsMultiplier: gameState.bpsMultiplier,
    bpcFlatBonus: gameState.bpcFlatBonus,
    offlineEfficiency: gameState.offlineEfficiency,
    prestigeThreshold: gameState.prestigeThreshold,
    totalClicks: gameState.totalClicks,
    totalCrits: gameState.totalCrits,
    totalPrestiges: gameState.totalPrestiges,
    totalAutoBoopers: gameState.totalAutoBoopers,
    lastUpdate: gameState.lastUpdate || Date.now(),
    settings: gameState.settings,
    dailyBoxLastOpened: gameState.dailyBoxLastOpened,
    dailyBoxAvailable: gameState.dailyBoxAvailable,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function restoreBpcUpgrades(savedList) {
  return bpcUpgradesConfig.map((upgrade) => {
    const saved = Array.isArray(savedList) ? savedList.find((item) => item.id === upgrade.id) : null;
    const savedFlatBonus =
      typeof saved?.bpcFlatBonus === 'number'
        ? saved.bpcFlatBonus
        : typeof saved?.bpcMultiplierBonus === 'number'
          ? Math.max(1, Math.round(saved.bpcMultiplierBonus * BASE_BPC))
          : upgrade.bpcFlatBonus || 0;
    return {
      ...upgrade,
      bpcFlatBonus: savedFlatBonus,
      purchased: saved?.purchased ?? false,
      wasAffordable: saved?.wasAffordable ?? false,
    };
  });
}

function restoreAutoBoopers(savedList) {
  return autoBoopersConfig.map((booper) => {
    const saved = Array.isArray(savedList) ? savedList.find((item) => item.id === booper.id) : null;
    return {
      ...booper,
      owned: saved?.owned ?? saved?.level ?? 0,
      baseCost: saved?.baseCost ?? booper.baseCost,
      costGrowth: saved?.costGrowth ?? saved?.scale ?? booper.costGrowth ?? 1.15,
      baseBps: saved?.baseBps ?? booper.baseBps ?? 0,
      wasAffordable: saved?.wasAffordable ?? false,
    };
  });
}

function restoreMetaPerks(savedList) {
  return metaPerksConfig.map((perk) => {
    const saved = Array.isArray(savedList) ? savedList.find((item) => item.id === perk.id) : null;
    return {
      ...perk,
      purchased: saved?.purchased ?? false,
    };
  });
}

function restoreSkins(savedList, unlockedSkins) {
  const unlockedSet = new Set(unlockedSkins || []);
  return skinsConfig.map((skin) => {
    const saved = Array.isArray(savedList) ? savedList.find((item) => item.id === skin.id) : null;
    const owned = (saved?.owned ?? skin.owned) || unlockedSet.has(skin.id);
    const boops = typeof saved?.boops === 'number' ? saved.boops : skin.boops || 0;
    const isPublic = saved?.public ?? skin.public ?? true;
    return {
      ...skin,
      avatar: saved?.avatar || skin.avatar,
      owned,
      boops,
      public: isPublic,
      unlockCost: saved?.unlockCost ?? skin.unlockCost ?? null,
      unlockCode: saved?.unlockCode ?? skin.unlockCode ?? null,
    };
  });
}

function getAutoBooperCost(auto) {
  const growth = auto.costGrowth ?? 1.15;
  const owned = auto.owned ?? 0;
  return Math.floor((auto.baseCost ?? 0) * Math.pow(growth, owned));
}

function getAutoBooperBps(auto) {
  const owned = auto.owned ?? 0;
  return (auto.baseBps ?? 0) * owned;
}

function getSkinById(id) {
  if (!id) return null;
  return gameState.skins.find((skin) => skin.id === id) || null;
}

function getFirstOwnedSkin() {
  return gameState.skins.find((skin) => skin.owned) || null;
}

function getCurrentSkin() {
  const selected = getSkinById(gameState.currentSkinId);
  if (selected && selected.owned) {
    return selected;
  }
  const fallback = getFirstOwnedSkin();
  if (fallback) {
    gameState.currentSkinId = fallback.id;
    return fallback;
  }
  return null;
}

function syncAvatarWithSkin() {
  const current = getCurrentSkin();
  if (current?.avatar) {
    gameState.playerAvatar = current.avatar;
  }
}

function getMostBoopedSkin() {
  if (!Array.isArray(gameState.skins) || gameState.skins.length === 0) {
    return null;
  }
  let best = null;
  gameState.skins.forEach((skin) => {
    const count = skin.boops || 0;
    if (!best || count > (best.boops || 0)) {
      best = skin;
    }
  });
  if (best && (best.boops || 0) > 0) {
    return best;
  }
  return null;
}

function recalculateProductionStats() {
  rebuildPermanentBonuses();
  gameState.boops = Math.floor(Number(gameState.boops) || 0);
  gameState.totalBoops = Math.floor(Number(gameState.totalBoops) || 0);

  const flatClickBonus = gameState.bpcUpgrades.reduce((acc, upgrade) => {
    if (upgrade.purchased) {
      return acc + (upgrade.bpcFlatBonus || 0);
    }
    return acc;
  }, 0);

  gameState.bpcBase = BASE_BPC + flatClickBonus;
  gameState.bpc = gameState.bpcBase;

  let baseBps = 0;
  gameState.autoBoopers.forEach((booper) => {
    baseBps += getAutoBooperBps(booper);
  });
  gameState.bpsBase = baseBps;
  gameState.bps = baseBps;
}

function rebuildPermanentBonuses() {
  gameState.bpcMultiplier = 1;
  gameState.bpsMultiplier = 1;
  gameState.offlineEfficiency = BASE_OFFLINE_EFFICIENCY;
  gameState.critChance = BASE_CRIT_CHANCE;
  gameState.bpcFlatBonus = 0;

  gameState.metaPerks.forEach((perk) => {
    if (perk.purchased) {
      applyMetaPerkEffect(perk);
    }
  });

  applyAchievementRewardsFromState();
}

function applyMetaPerkEffect(perk) {
  switch (perk.id) {
    case 'stronger_pokes':
      gameState.bpcMultiplier += 0.05;
      break;
    case 'idle_efficiency':
      gameState.bpsMultiplier += 0.05;
      break;
    case 'crit_chance_up':
      gameState.critChance += 0.01;
      break;
    case 'offline_mastery':
      gameState.offlineEfficiency += 0.25;
      break;
    default:
      break;
  }
}

function applyAchievementRewardsFromState() {
  if (!Array.isArray(gameState.achievementsUnlocked)) {
    gameState.achievementsUnlocked = [];
  }
  const unlockedSet = new Set(gameState.achievementsUnlocked);
  achievements.forEach((achievement) => {
    if (unlockedSet.has(achievement.id)) {
      applyAchievementReward(achievement);
    }
  });
}

function applyAchievementReward(achievement) {
  const reward = achievement.reward;
  if (!reward) {
    return;
  }
  switch (reward.type) {
    case 'bpc_mult':
      gameState.bpcMultiplier *= reward.value;
      break;
    case 'bps_mult':
      gameState.bpsMultiplier *= reward.value;
      break;
    case 'bpc_add':
      gameState.bpcFlatBonus += reward.value;
      break;
    case 'unlock_skin':
      if (!Array.isArray(gameState.unlockedSkins)) {
        gameState.unlockedSkins = [];
      }
      if (!gameState.unlockedSkins.includes(reward.skinId)) {
        gameState.unlockedSkins.push(reward.skinId);
      }
      const ownedSkin = getSkinById(reward.skinId);
      if (ownedSkin) {
        ownedSkin.owned = true;
      }
      break;
    default:
      break;
  }
}

function applyFactionBonusById(factionId) {
  const faction = gameState.factions.find((item) => item.id === factionId) || null;
  gameState.currentFaction = faction ? faction.id : null;
  gameState.factionBonus = { crit: 0, bps: 0, bpc: 0 };
  if (faction) {
    gameState.factionBonus[faction.bonusType] = faction.bonusValue;
  }
}

function chooseFaction(id) {
  applyFactionBonusById(id);
  saveGame();
  updateUI();
  hideFactionOverlay();
}

function getFinalBpc() {
  const base = Math.max(0, (gameState.bpcBase ?? BASE_BPC) + (gameState.bpcFlatBonus || 0));
  const factionBonus = 1 + (gameState.factionBonus?.bpc || 0);
  const raw = base * gameState.bpcMultiplier * gameState.globalMultiplier * factionBonus;
  return Math.max(1, Math.floor(raw));
}

function getFinalBps() {
  const base = gameState.bpsBase ?? gameState.bps ?? 0;
  const factionBonus = 1 + (gameState.factionBonus?.bps || 0);
  return base * gameState.bpsMultiplier * gameState.globalMultiplier * factionBonus;
}

function getEffectiveCritChance() {
  return Math.min(0.95, Math.max(0, gameState.critChance + gameState.factionBonus.crit));
}

function applyOfflineProgress() {
  const now = Date.now();
  const secondsPassed = Math.max(0, (now - (gameState.lastUpdate || now)) / 1000);
  const passiveRate = getFinalBps();
  if (secondsPassed > 0 && passiveRate > 0) {
    const baseGain = secondsPassed * passiveRate * gameState.offlineEfficiency;
    const gainInteger = Math.floor(baseGain);
    passiveGainRemainder = baseGain - gainInteger;
    const actualGain = addBoops(gainInteger);
    announceOfflineGain(actualGain, Math.round(secondsPassed));
  } else {
    passiveGainRemainder = 0;
  }
  gameState.lastUpdate = now;
}

function updateUI() {
  const finalBps = getFinalBps();
  const formattedBoops = formatNumber(Math.floor(Number(gameState.boops) || 0));
  const formattedTotal = formatNumber(Math.floor(Number(gameState.totalBoops) || 0));
  const formattedBps = formatNumber(Math.round(finalBps * 100) / 100);

  if (!gameState.currentFaction) {
    showFactionOverlay();
  } else {
    hideFactionOverlay();
  }

  if (ui.boopPlayerName) {
    ui.boopPlayerName.textContent = gameState.playerName || 'Anonymous';
  }
  if (ui.boopCountValue) {
    ui.boopCountValue.textContent = formattedBoops;
  }
  if (ui.boopBpsValue) {
    ui.boopBpsValue.textContent = `${formattedBps} boops / second`;
  }

  if (ui.metaBeValue) {
    ui.metaBeValue.textContent = formatNumber(Math.floor(gameState.boopEssence));
  }

  updateProfileUI();
  updateSkinStatsUI();
  renderSkinsShop();
  renderHighscores();
  updateShareText();

  updateStoreUI();
  renderInventory();
  updateOrbitCrew();
  refreshGroundParade();
  updateBoopRainVisibility();
  updatePrestigeUI();
  renderMetaPerks();
  renderFactions();
  updateStatsUI();
  updateAchievementsUI();
  updateDailyBoxFloatUI();
}

function updateDailyBoxState() {
  const now = Date.now();
  if (!gameState.dailyBoxLastOpened) {
    gameState.dailyBoxAvailable = true;
    return;
  }
  const elapsed = now - gameState.dailyBoxLastOpened;
  gameState.dailyBoxAvailable = elapsed >= DAILY_BOX_COOLDOWN_MS;
}

function getDailyBoxRemainingMs() {
  if (!gameState.dailyBoxLastOpened) return 0;
  const elapsed = Date.now() - gameState.dailyBoxLastOpened;
  const remaining = DAILY_BOX_COOLDOWN_MS - elapsed;
  return Math.max(0, remaining);
}

function updateDailyBoxFloatUI() {
  updateDailyBoxState();
  const openBtn = ui.dailyBoxFloatButton;
  const timerEl = ui.dailyBoxFloatTimer;
  if (!openBtn || !timerEl) return;

  if (gameState.dailyBoxAvailable) {
    timerEl.textContent = 'Ready!';
    openBtn.disabled = false;
  } else {
    const remainingMs = getDailyBoxRemainingMs();
    if (remainingMs <= 0) {
      timerEl.textContent = 'Ready!';
      openBtn.disabled = false;
      gameState.dailyBoxAvailable = true;
    } else {
      const totalSeconds = Math.floor(remainingMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      timerEl.textContent = `Next in ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      openBtn.disabled = true;
    }
  }
}

function updatePrestigeUI() {
  if (ui.prestigeTotalBoops) {
    ui.prestigeTotalBoops.textContent = formatNumber(Math.floor(gameState.totalBoops));
  }
  if (ui.boopEssence) {
    ui.boopEssence.textContent = formatNumber(Math.floor(gameState.boopEssence));
  }
  if (ui.globalMultiplier) {
    ui.globalMultiplier.textContent = gameState.globalMultiplier.toFixed(2);
  }
  if (ui.prestigeGain) {
    ui.prestigeGain.textContent = formatNumber(calculatePrestigeGain());
  }
  if (ui.prestigeButton) {
    ui.prestigeButton.disabled = calculatePrestigeGain() <= 0;
  }
}

// Deprecated store tooltip hooks replaced by icon/grid tooltips.

function renderUpgrades() {
  hideUpgradeTooltips();
  renderClickUpgradesGrid();
  renderAutoBoopers();
}

function renderClickUpgradesGrid() {
  const container = ui.clickUpgradesGrid;
  if (!container) return;
  container.innerHTML = '';

  const visibleUpgrades = gameState.bpcUpgrades.filter((upgrade) => !upgrade.purchased).slice(0, 10);
  lastUnlockedClickCount = getUnlockedClickUpgradeCount();

  visibleUpgrades.forEach((upgrade, index) => {
    if (typeof upgrade.wasAffordable === 'undefined') {
      upgrade.wasAffordable = false;
    }
    const unlocked = gameState.totalBoops >= (upgrade.unlockAt ?? upgrade.cost);
    const icon = document.createElement('div');
    icon.className = 'click-upgrade-icon upgrade-card';
    icon.id = `${upgrade.id}-card`;
    icon.dataset.id = upgrade.id;
    icon.dataset.type = 'click';
    const iconSymbol = upgrade.icon || '★';
    icon.textContent = unlocked ? iconSymbol : '？';

    if (unlocked) {
      icon.classList.add('available');
    } else {
      icon.classList.add('locked');
    }

    const showTooltip = (event) => {
      const tooltip = ui.clickUpgradeTooltip;
      if (!tooltip) return;
      if (!unlocked) {
        tooltip.textContent = 'Future upgrade';
      } else {
        const bonusText = upgrade.bpcFlatBonus != null ? `+${upgrade.bpcFlatBonus} BPC` : '';
        tooltip.innerHTML = `<strong>${upgrade.name}</strong><br>${upgrade.description}<br>Cost: ${formatNumber(
          upgrade.cost
        )} boops${bonusText ? `<br>${bonusText}` : ''}`;
      }
      tooltip.classList.remove('hidden');
      tooltip.style.left = `${event.pageX + 12}px`;
      tooltip.style.top = `${event.pageY + 12}px`;
    };

    icon.addEventListener('mouseenter', (event) => showTooltip(event));
    icon.addEventListener('mousemove', (event) => showTooltip(event));
    icon.addEventListener('mouseleave', hideUpgradeTooltips);

    if (unlocked && !upgrade.purchased) {
      icon.addEventListener('click', () => {
        const latest = gameState.bpcUpgrades.find((u) => u.id === upgrade.id);
        if (!latest || latest.purchased) return;
        const canAfford = gameState.boops >= (latest.cost ?? latest.baseCost ?? 0);
        if (canAfford) {
          buyBpcUpgrade(latest.id);
        }
      });
    }
    container.appendChild(icon);
  });
}

function renderInventory() {
  const container = document.getElementById('inventory-items');
  if (!container) return;
  container.innerHTML = '';

  gameState.bpcUpgrades.forEach((upgrade) => {
    if (!upgrade.purchased) return;
    const item = document.createElement('div');
    item.className = 'inventory-item';
    item.textContent = upgrade.icon || '★';
    container.appendChild(item);
  });
}

function updateOrbitCrew() {
  const layer = ui.orbitCrewLayer;
  if (!layer) return;
  const ownedTypes = gameState.autoBoopers.filter((auto) => (auto.owned || 0) > 0);
  const toRender = ownedTypes.slice(-12);

  if (!gameState.settings.showOrbitCrew || !toRender.length) {
    layer.innerHTML = '';
    layer.style.display = 'none';
    return;
  }

  layer.style.display = 'block';
  layer.innerHTML = '';

  const fragment = document.createDocumentFragment();
  const total = toRender.length;
  const radius = Math.max(96, (ui.boopArea?.clientWidth || 240) * 0.35 + 32);

  toRender.forEach((auto, index) => {
    const angle = (index / total) * Math.PI * 2;
    const offsetX = Math.cos(angle) * radius;
    const offsetY = Math.sin(angle) * radius;
    const icon = document.createElement('div');
    icon.className = 'orbit-icon';
    icon.textContent = auto.icon || '🌀';
    icon.style.left = '50%';
    icon.style.top = '50%';
    icon.style.transform = `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px)`;
    fragment.appendChild(icon);
  });

  layer.appendChild(fragment);
}

function refreshGroundParade() {
  const layer = ui.groundParadeLayer;
  if (!layer) return;
  if (!gameState.settings.showGroundParade) {
    layer.innerHTML = '';
    layer.style.display = 'none';
    return;
  }

  layer.style.display = 'flex';
  layer.innerHTML = '';

  const walkers = [];
  gameState.autoBoopers.forEach((auto) => {
    const owned = auto.owned || 0;
    if (owned > 0) {
      const count = Math.min(3, Math.max(1, Math.floor(owned / 10) + 1));
      for (let i = 0; i < count; i += 1) {
        walkers.push(auto);
        if (walkers.length >= 12) break;
      }
    }
  });

  const signature = `${gameState.settings.showGroundParade ? 'on' : 'off'}|${walkers
    .map((auto) => `${auto.id}:${auto.owned || 0}`)
    .join(',')}`;

  if (!walkers.length) {
    layer.style.display = 'none';
    lastParadeSignature = signature;
    return;
  }

  if (signature === lastParadeSignature) {
    return;
  }
  lastParadeSignature = signature;

  walkers.slice(0, 12).forEach((auto) => {
    const walker = document.createElement('div');
    walker.className = 'ground-walker';
    walker.textContent = auto.icon || '🐾';
    const duration = 7 + Math.random() * 4;
    walker.style.animationDuration = `${duration}s`;
    walker.style.animationDelay = `${Math.random() * 3}s`;
    layer.appendChild(walker);
  });
}

function renderAutoBoopers() {
  const container = ui.autoUpgradesContainer;
  if (!container) return;
  container.innerHTML = '';

  let maxOwnedIndex = -1;
  gameState.autoBoopers.forEach((auto, index) => {
    if ((auto.owned || 0) > 0 && index > maxOwnedIndex) {
      maxOwnedIndex = index;
    }
    if (typeof auto.wasAffordable === 'undefined') {
      auto.wasAffordable = false;
    }
  });

  const visibleUnlocked = [];
  const locked = [];

  gameState.autoBoopers.forEach((auto, index) => {
    const prevOwned = index === 0 || (gameState.autoBoopers[index - 1].owned || 0) > 0;
    const unlocked = index === 0 ? true : prevOwned && index <= maxOwnedIndex + 1;
    if (unlocked) {
      visibleUnlocked.push({ auto, index });
    } else {
      locked.push({ auto, index });
    }
  });

  const fragment = document.createDocumentFragment();

  visibleUnlocked.forEach(({ auto, index }) => {
    const currentCost = getAutoBooperCost(auto);
    const affordable = gameState.boops >= currentCost;
    const stateClass = affordable ? 'available' : 'unavailable';

    const card = document.createElement('div');
    card.className = `auto-booper-card auto-booper-item ${stateClass}`;
    card.id = `${auto.id}-autocard`;
    card.dataset.id = auto.id;
    card.dataset.index = String(index);

    const icon = document.createElement('div');
    icon.className = 'auto-booper-icon';
    icon.textContent = auto.icon || '🏭';

    const infoWrap = document.createElement('div');
    infoWrap.className = 'auto-booper-info';

    const nameEl = document.createElement('div');
    nameEl.className = 'auto-booper-name';
    nameEl.textContent = auto.name;

    const metaEl = document.createElement('div');
    metaEl.className = 'auto-booper-meta';
    metaEl.textContent = `Owned: ${formatNumber(auto.owned || 0)} • ${formatNumber(getAutoBooperBps(auto))} boops/s`;

    infoWrap.append(nameEl, metaEl);

    const costEl = document.createElement('div');
    costEl.className = 'auto-booper-cost';
    costEl.textContent = `${formatNumber(currentCost)} boops`;

    const showAutoTooltip = (event) => {
      const tooltip = ui.autoBooperTooltip;
      if (!tooltip) return;
      const unitBps = formatNumber(auto.baseBps);
      const totalBps = formatNumber(getAutoBooperBps(auto));
      tooltip.innerHTML = `<strong>${auto.name}</strong><br>${auto.description}<br>Cost: ${formatNumber(currentCost)} boops<br>+${unitBps} BPS per unit (total ${totalBps})`;
      tooltip.classList.remove('hidden');
      tooltip.style.left = `${event.pageX + 12}px`;
      tooltip.style.top = `${event.pageY + 12}px`;
    };

    card.addEventListener('mouseenter', (event) => showAutoTooltip(event));
    card.addEventListener('mousemove', (event) => showAutoTooltip(event));
    card.addEventListener('mouseleave', hideUpgradeTooltips);

    card.addEventListener('click', () => {
      const latest = gameState.autoBoopers.find((item) => item.id === auto.id);
      if (!latest) return;
      const currentIdx = gameState.autoBoopers.indexOf(latest);
      const prevOwned = currentIdx <= 0 || (gameState.autoBoopers[currentIdx - 1].owned || 0) > 0;
      const liveCost = getAutoBooperCost(latest);
      const canAfford = prevOwned && gameState.boops >= liveCost;
      if (!canAfford) return;
      buyAutoBooper(latest.id);
    });

    card.append(icon, infoWrap, costEl);
    fragment.appendChild(card);
  });

  const maxLockedToShow = 3;
  const lockedToRender = locked.slice(0, maxLockedToShow);

  lockedToRender.forEach(({ auto, index }) => {
    const card = document.createElement('div');
    card.className = 'auto-booper-card auto-booper-item locked';
    card.id = `${auto.id}-autocard`;
    card.dataset.id = auto.id;
    card.dataset.index = String(index);

    const icon = document.createElement('div');
    icon.className = 'auto-booper-icon';
    icon.textContent = '❔';

    const infoWrap = document.createElement('div');
    infoWrap.className = 'auto-booper-info';

    const nameEl = document.createElement('div');
    nameEl.className = 'auto-booper-name';
    nameEl.textContent = '???';

    const metaEl = document.createElement('div');
    metaEl.className = 'auto-booper-meta';
    metaEl.textContent = '';

    infoWrap.append(nameEl, metaEl);

    const costEl = document.createElement('div');
    costEl.className = 'auto-booper-cost';
    costEl.textContent = '???';

    card.append(icon, infoWrap, costEl);
    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}


function renderSkinsShop() {
  const grid = ui.skinsGrid;
  if (!grid) return;
  grid.innerHTML = '';

  const visibleSkins = gameState.skins.filter((skin) => skin.public || skin.owned);
  const fragment = document.createDocumentFragment();

  visibleSkins.forEach((skin) => {
    const tile = document.createElement('article');
    tile.className = 'skin-tile';
    if (skin.id === gameState.currentSkinId) {
      tile.classList.add('equipped');
    }

    const header = document.createElement('div');
    header.className = 'skin-tile-header';
    const avatar = document.createElement('div');
    avatar.className = 'skin-tile-avatar';
    avatar.textContent = skin.avatar || '✨';
    const name = document.createElement('div');
    name.className = 'skin-tile-name';
    name.textContent = skin.name;
    header.append(avatar, name);

    const meta = document.createElement('div');
    meta.className = 'skin-tile-meta';
    meta.textContent = skin.owned ? 'Owned' : 'Not owned';

    const boopsLine = document.createElement('div');
    boopsLine.className = 'skin-tile-meta';
    boopsLine.textContent = `Boops: ${formatNumber(skin.boops || 0)}`;

    const footer = document.createElement('div');
    footer.className = 'skin-tile-footer';
    const actionWrap = document.createElement('div');

    if (skin.owned) {
      const equipButton = document.createElement('button');
      equipButton.type = 'button';
      equipButton.textContent = skin.id === gameState.currentSkinId ? 'Equipped' : 'Equip';
      equipButton.disabled = skin.id === gameState.currentSkinId;
      equipButton.addEventListener('click', () => equipSkin(skin.id));
      actionWrap.appendChild(equipButton);
      if (skin.id === gameState.currentSkinId) {
        const badge = document.createElement('span');
        badge.className = 'equipped-label';
        badge.textContent = 'Equipped';
        footer.appendChild(badge);
      }
    } else if (skin.unlockCost != null) {
      const buyButton = document.createElement('button');
      buyButton.type = 'button';
      buyButton.textContent = `Buy (${formatNumber(skin.unlockCost)} boops)`;
      buyButton.disabled = gameState.boops < skin.unlockCost;
      buyButton.addEventListener('click', () => buySkinWithBoops(skin.id));
      actionWrap.appendChild(buyButton);
    } else if (skin.unlockCode) {
      const label = document.createElement('span');
      label.className = 'skin-tile-meta';
      label.textContent = 'Unlock via code';
      actionWrap.appendChild(label);
    }

    footer.appendChild(actionWrap);
    tile.append(header, meta, boopsLine, footer);
    fragment.appendChild(tile);
  });

  grid.appendChild(fragment);
}

function renderMetaPerks() {
  const container = ui.metaPerksContainer;
  if (!container) return;
  container.innerHTML = '';

  const fragment = document.createDocumentFragment();
  gameState.metaPerks.forEach((perk) => {
    const card = document.createElement('article');
    card.className = 'meta-perk-card';
    if (perk.purchased) {
      card.classList.add('purchased');
    }

    const header = document.createElement('header');
    const nameEl = document.createElement('span');
    nameEl.textContent = perk.name;
    const costEl = document.createElement('span');
    costEl.textContent = `${formatNumber(perk.cost)} BE`;
    header.append(nameEl, costEl);

    const description = document.createElement('p');
    description.textContent = perk.description;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'buy-button';

    if (perk.purchased) {
      button.textContent = 'Purchased';
      button.disabled = true;
    } else {
      button.textContent = 'Buy';
      const canAfford = gameState.boopEssence >= perk.cost;
      button.disabled = !canAfford;
      button.classList.toggle('disabled', !canAfford);
      button.classList.toggle('is-affordable', canAfford);
      button.addEventListener('click', () => buyMetaPerk(perk.id));
    }

    card.append(header, description, button);
    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

function renderFactions() {
  const currentEl = ui.factionCurrent;
  const container = ui.factionChoiceContainer;
  if (!currentEl) return;

  const activeFaction = gameState.factions.find((item) => item.id === gameState.currentFaction);
  currentEl.textContent = activeFaction
    ? `${activeFaction.name} — ${activeFaction.description}`
    : 'Brak wybranego totemu.';

  if (container) {
    container.innerHTML = '';
    const note = document.createElement('p');
    note.textContent = 'You can change your faction after the next Prestige.';
    container.appendChild(note);
  }
}

function updateProfileUI() {
  if (ui.profileName) {
    ui.profileName.textContent = gameState.playerName || 'Anonymous';
  }
  if (ui.profileAvatar) {
    ui.profileAvatar.textContent = gameState.playerAvatar || '🧸';
  }
  if (ui.profileTitle) {
    const titleObj = getTitleById(gameState.playerTitleId || 'none');
    ui.profileTitle.textContent = titleObj?.name || 'No Title';
  }
  renderTitleSelect();
}

function updateSkinStatsUI() {
  const currentSkin = getCurrentSkin();
  if (ui.currentSkinBoops) {
    ui.currentSkinBoops.textContent = currentSkin ? formatNumber(currentSkin.boops || 0) : 0;
  }
  const topSkin = getMostBoopedSkin();
  if (ui.topSkinName && ui.topSkinBoops) {
    if (topSkin) {
      ui.topSkinName.textContent = topSkin.name;
      ui.topSkinBoops.textContent = formatNumber(topSkin.boops || 0);
    } else {
      ui.topSkinName.textContent = 'None';
      ui.topSkinBoops.textContent = 0;
    }
  }
}

function buySkinWithBoops(id) {
  const skin = getSkinById(id);
  if (!skin || skin.owned || skin.unlockCost == null) return;
  if (gameState.boops < skin.unlockCost) return;

  gameState.boops -= skin.unlockCost;
  skin.owned = true;
  if (!gameState.currentSkinId || !getCurrentSkin()) {
    gameState.currentSkinId = skin.id;
  }
  syncAvatarWithSkin();
  updateSkinHighscores();
  saveGame();
  updateUI();
}

function equipSkin(id) {
  const skin = getSkinById(id);
  if (!skin || !skin.owned) return;
  gameState.currentSkinId = skin.id;
  syncAvatarWithSkin();
  saveGame();
  updateUI();
}

function unlockSkinWithCode(code) {
  const messageEl = ui.skinCodeMessage;
  if (!code) {
    if (messageEl) messageEl.textContent = 'Enter a code to unlock a custom skin.';
    return;
  }
  const normalized = code.trim().toLowerCase();
  const skin = gameState.skins.find(
    (item) => item.unlockCode && item.unlockCode.toLowerCase() === normalized
  );
  if (!skin) {
    if (messageEl) messageEl.textContent = 'Invalid code.';
    return;
  }

  if (!skin.owned) {
    skin.owned = true;
    skin.public = true;
    gameState.unlockedSkins = Array.from(new Set([...(gameState.unlockedSkins || []), skin.id]));
    if (!gameState.currentSkinId) {
      gameState.currentSkinId = skin.id;
    }
    syncAvatarWithSkin();
    saveGame();
    renderSkinsShop();
    if (messageEl) messageEl.textContent = `${skin.name} unlocked!`;
  } else if (messageEl) {
    messageEl.textContent = `${skin.name} is already unlocked.`;
  }
}

function handleSkinCodeSubmit() {
  const input = ui.skinCodeInput;
  if (!input) return;
  unlockSkinWithCode(input.value || '');
  input.value = '';
}

function updateBoopersLeaderboard() {
  const entry = {
    name: gameState.playerName || 'Anonymous',
    avatar: gameState.playerAvatar || '🧸',
    totalBoops: Math.floor(gameState.totalBoops || 0),
    playerTitleId: gameState.playerTitleId || 'none',
  };
  const list = Array.isArray(gameState.boopers) ? [...gameState.boopers] : [];
  const existingIndex = list.findIndex(
    (item) => item.name === entry.name && item.avatar === entry.avatar
  );
  if (existingIndex >= 0) {
    list[existingIndex] = entry;
  } else {
    list.push(entry);
  }
  list.sort((a, b) => (b.totalBoops || 0) - (a.totalBoops || 0));
  gameState.boopers = list.slice(0, 5);
}

function updateSkinHighscores() {
  const list = Array.isArray(gameState.skins)
    ? gameState.skins.map((skin) => ({
        id: skin.id,
        name: skin.name,
        avatar: skin.avatar,
        boops: skin.boops || 0,
      }))
    : [];
  list.sort((a, b) => (b.boops || 0) - (a.boops || 0));
  gameState.skinHighscores = list.slice(0, 5);
}

function updateHighscores() {
  updateBoopersLeaderboard();
  updateSkinHighscores();
}

function updateShareText() {
  const shareTextEl = ui.shareText;
  if (!shareTextEl) return;
  const player = gameState.playerName || 'Anonymous';
  const avatar = gameState.playerAvatar || '🧸';
  const total = formatNumber(Math.floor(gameState.totalBoops || 0));
  const currentSkin = getCurrentSkin();
  const skinName = currentSkin ? currentSkin.name : 'no skin';
  const skinBoops = currentSkin ? formatNumber(currentSkin.boops || 0) : 0;
  const factionId = gameState.currentFaction;
  const faction = gameState.factions?.find((f) => f.id === factionId);
  const factionName = faction ? faction.name : 'No faction';

  const text = `${avatar} ${player} has booped ${total} times in Boopclicker!\nCurrent skin: ${skinName} (${skinBoops} boops)\nFaction: ${factionName}`;
  shareTextEl.value = text;
}

function initShareUI() {
  const copyBtn = ui.shareCopyButton;
  const statusEl = ui.shareStatus;
  if (!copyBtn || !statusEl || !ui.shareText) return;
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(ui.shareText.value);
      statusEl.textContent = 'Copied!';
    } catch (error) {
      statusEl.textContent = 'Copy failed. Select the text manually.';
    }
    setTimeout(() => {
      statusEl.textContent = '';
    }, 2000);
  });
}

function renderHighscores() {
  updateHighscores();

  const boopersList = ui.topBoopersList;
  const skinsList = ui.topSkinsList;

  if (boopersList) {
    boopersList.innerHTML = '';
    (gameState.boopers || []).forEach((entry) => {
      const li = document.createElement('li');
      const titleObj = getTitleById(entry.playerTitleId || 'none');
      const titleText = titleObj ? titleObj.name : 'No Title';
      li.textContent = `${entry.avatar || ''} ${entry.name || 'Anon'} – [${titleText}] – ${formatNumber(
        entry.totalBoops || 0
      )} boops`;
      boopersList.appendChild(li);
    });
  }

  if (skinsList) {
    skinsList.innerHTML = '';
    (gameState.skinHighscores || []).forEach((entry) => {
      const li = document.createElement('li');
      li.textContent = `${entry.avatar || ''} ${entry.name || 'Skin'} – ${formatNumber(
        entry.boops || 0
      )} boops`;
      skinsList.appendChild(li);
    });
  }
}

function updateStatsUI() {
  if (ui.statsTotalClicks) {
    ui.statsTotalClicks.textContent = formatNumber(gameState.totalClicks);
  }
  if (ui.statsTotalCrits) {
    ui.statsTotalCrits.textContent = formatNumber(gameState.totalCrits);
  }
  if (ui.statsTotalPrestiges) {
    ui.statsTotalPrestiges.textContent = formatNumber(gameState.totalPrestiges);
  }
  if (ui.statsCritChance) {
    ui.statsCritChance.textContent = formatCritChance(getEffectiveCritChance());
  }
  if (ui.statsCritMultiplier) {
    ui.statsCritMultiplier.textContent = `×${formatNumber(gameState.critMultiplier)}`;
  }
  if (ui.statsBpcMultiplier) {
    const bpcMultDisplay = gameState.bpcMultiplier < 10
      ? (Math.round(gameState.bpcMultiplier * 100) / 100).toFixed(2)
      : formatNumber(Math.round(gameState.bpcMultiplier * 100) / 100);
    ui.statsBpcMultiplier.textContent = bpcMultDisplay;
  }
  if (ui.statsBpsMultiplier) {
    ui.statsBpsMultiplier.textContent = formatNumber(gameState.bpsMultiplier);
  }
  if (ui.statsGlobalMultiplier) {
    ui.statsGlobalMultiplier.textContent = formatNumber(gameState.globalMultiplier);
  }
}

function updateAchievementsUI() {
  const container = ui.achievementsGrid;
  const sidebar = ui.achievementsList;
  if (container) {
    container.innerHTML = '';
  }
  if (sidebar) {
    sidebar.innerHTML = '';
  }

  const fragment = document.createDocumentFragment();
  const listFragment = document.createDocumentFragment();
  const unlockedSet = new Set(gameState.achievementsUnlocked);

  achievements.forEach((achievement) => {
    const card = document.createElement('div');
    card.className = 'achievement-card';
    if (unlockedSet.has(achievement.id)) {
      card.classList.add('unlocked');
    }

    card.innerHTML = `
      <div class="achievement-name">${achievement.name}</div>
      <div class="achievement-desc">${achievement.desc}</div>
      <div class="achievement-rarity">${achievement.rarity.toUpperCase()}</div>
    `;
    fragment.appendChild(card);

    const row = document.createElement('div');
    row.className = 'achievement-row';
    if (unlockedSet.has(achievement.id)) {
      row.classList.add('unlocked');
    }
    row.innerHTML = `
      <div class="achievement-name">${achievement.name}</div>
      <div class="achievement-desc">${achievement.desc}</div>
    `;
    listFragment.appendChild(row);
  });

  if (container) {
    container.appendChild(fragment);
  }
  if (sidebar) {
    sidebar.appendChild(listFragment);
  }
}

function checkAchievements() {
  if (!Array.isArray(gameState.achievementsUnlocked)) {
    gameState.achievementsUnlocked = [];
  }
  const unlockedSet = new Set(gameState.achievementsUnlocked);
  achievements.forEach((achievement) => {
    if (unlockedSet.has(achievement.id)) {
      return;
    }
    if (achievement.condition(gameState)) {
      unlockAchievement(achievement);
    }
  });
}

function unlockAchievement(achievement) {
  if (gameState.achievementsUnlocked.includes(achievement.id)) {
    return;
  }
  gameState.achievementsUnlocked.push(achievement.id);
  rebuildPermanentBonuses();
  showAchievementPopup(achievement);
  saveGame();
  updateAchievementsUI();
}

function showAchievementPopup(achievement) {
  const toast = ui.achievementToast;
  if (!toast) return;
  toast.textContent = `Achievement unlocked: ${achievement.name}!`;
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

function formatBoopGain(amount) {
  if (!Number.isFinite(amount)) return '0';
  const rounded = Math.max(0, Math.floor(amount));
  return formatNumber(rounded);
}

function doBoop() {
  const baseGain = Math.max(1, Math.floor(getFinalBpc()));
  const isCrit = Math.random() < getEffectiveCritChance();
  let gain = baseGain;

  gameState.totalClicks += 1;

  if (isCrit) {
    gain *= gameState.critMultiplier;
    gameState.totalCrits += 1;
  }

  const appliedGain = addBoops(gain);
  const currentSkin = getCurrentSkin();
  if (currentSkin) {
    currentSkin.boops = (currentSkin.boops || 0) + 1;
  }
  spawnBoopFloat(appliedGain);
  if (isCrit) {
    playSfx('crit');
  }

  if (isCrit) {
    gameState.lastCritValue = appliedGain;
    showCritPopup(appliedGain);
  }

  updateUI();
  saveGame();
}

function buyBpcUpgrade(id) {
  const upgrade = gameState.bpcUpgrades.find((item) => item.id === id);
  gameState.boops = Math.floor(Number(gameState.boops) || 0);
  const cost = Number(upgrade?.cost ?? 0);
  if (!upgrade || upgrade.purchased || gameState.boops < cost) {
    return;
  }

  gameState.boops = Math.max(0, gameState.boops - cost);
  upgrade.purchased = true;
  recalculateProductionStats();
  markStoreDirty();
  checkAchievements();

  updateUI();
  flashStoreRow(upgrade.id);
  playSfx('buy');
  saveGame();
}

function buyAutoBooper(id) {
  const booper = gameState.autoBoopers.find((item) => item.id === id);
  const cost = booper ? getAutoBooperCost(booper) : 0;
  const index = booper ? gameState.autoBoopers.indexOf(booper) : -1;
  const prevOwned = index <= 0 || (gameState.autoBoopers[index - 1]?.owned || 0) > 0;
  gameState.boops = Math.floor(Number(gameState.boops) || 0);
  if (!booper || gameState.boops < cost || !prevOwned) {
    return;
  }

  gameState.boops = Math.max(0, gameState.boops - cost);
  booper.owned = (booper.owned || 0) + 1;
  gameState.totalAutoBoopers += 1;
  recalculateProductionStats();
  markStoreDirty();
  checkAchievements();

  updateUI();
  flashStoreRow(booper.id);
  playSfx('buy');
  saveGame();
}

function buyMetaPerk(id) {
  const perk = gameState.metaPerks.find((item) => item.id === id);
  if (!perk || perk.purchased || gameState.boopEssence < perk.cost) {
    return;
  }

  gameState.boopEssence -= perk.cost;
  perk.purchased = true;
  rebuildPermanentBonuses();
  updateGlobalMultiplier();

  updateUI();
  saveGame();
}

function grantDebugBoops() {
  const gained = addBoops(DEBUG_BOOST_AMOUNT);
  if (gained <= 0) {
    return;
  }
  updateUI();
  saveGame();
}

function handleDebugResetClick() {
  const confirmed = window.confirm('Na pewno zresetować cały zapis?');
  if (!confirmed) {
    return;
  }
  hardResetGame();
}

function hardResetGame() {
  localStorage.removeItem(STORAGE_KEY);
  gameState.boops = 0;
  gameState.totalBoops = 0;
  gameState.bpc = BASE_BPC;
  gameState.bps = BASE_BPS;
  gameState.boopEssence = 0;
  gameState.globalMultiplier = 1;
  gameState.critChance = BASE_CRIT_CHANCE;
  gameState.lastCritValue = 0;
  gameState.bpcUpgrades = bpcUpgradesConfig.map((upgrade) => ({ ...upgrade }));
  gameState.autoBoopers = autoBoopersConfig.map((booper) => ({ ...booper }));
  gameState.metaPerks = metaPerksConfig.map((perk) => ({ ...perk }));
  gameState.achievementsUnlocked = [];
  gameState.unlockedSkins = [];
  gameState.totalClicks = 0;
  gameState.totalCrits = 0;
  gameState.totalPrestiges = 0;
  gameState.totalAutoBoopers = 0;
  gameState.bpcFlatBonus = 0;
  gameState.currentFaction = null;
  gameState.factionBonus = { crit: 0, bps: 0, bpc: 0 };
  passiveGainRemainder = 0;
  saveTimer = 0;
  gameState.lastUpdate = Date.now();
  recalculateProductionStats();
  updateGlobalMultiplier();
  markStoreDirty();
  saveGame();
  updateUI();
}

function gameLoop() {
  const now = Date.now();
  const elapsedSeconds = Math.max(0, (now - gameState.lastUpdate) / 1000);
  const passiveGainPerSecond = getFinalBps();
  if (passiveGainPerSecond > 0 && elapsedSeconds > 0) {
    const rawGain = passiveGainPerSecond * elapsedSeconds + passiveGainRemainder;
    const gain = Math.floor(rawGain);
    passiveGainRemainder = rawGain - gain;
    if (gain > 0) {
      addBoops(gain);
    }
  }
  maybeSpawnBoopParticle(passiveGainPerSecond);
  gameState.lastUpdate = now;
  saveTimer += elapsedSeconds;

  while (saveTimer >= SAVE_INTERVAL_SECONDS) {
    saveTimer -= SAVE_INTERVAL_SECONDS;
    saveGame();
  }

  updateUI();
}

function addBoops(amount) {
  const gain = Math.floor(Number(amount) || 0);
  if (!Number.isFinite(gain) || gain <= 0) {
    return 0;
  }
  gameState.boops = Math.max(0, Math.floor(Number(gameState.boops) || 0) + gain);
  gameState.totalBoops = Math.max(0, Math.floor(Number(gameState.totalBoops) || 0) + gain);
  checkAchievements();
  return gain;
}

function announceOfflineGain(gain, seconds) {
  if (!ui.offlineNotice) return;
  if (!gain) {
    ui.offlineNotice.hidden = true;
    return;
  }

  const roundedGain = formatNumber(Math.floor(gain));
  const efficiencyPercent = Math.round(gameState.offlineEfficiency * 100);
  ui.offlineNotice.textContent = `Byłeś offline ${seconds}s i zyskałeś ${roundedGain} boops (${efficiencyPercent}% efektywności).`;
  ui.offlineNotice.hidden = false;

  if (offlineNoticeTimeout) {
    clearTimeout(offlineNoticeTimeout);
  }

  offlineNoticeTimeout = setTimeout(() => {
    ui.offlineNotice.hidden = true;
  }, 4500);
}

function showCritPopup(value) {
  if (!ui.critPopup) return;
  const gainText = formatBoopGain(value);
  ui.critPopup.textContent = `CRITICAL BOOP! +${gainText}`;
  ui.critPopup.classList.remove('show');
  void ui.critPopup.offsetWidth;
  ui.critPopup.classList.add('show');
  spawnFloatingText(`CRITICAL BOOP! +${gainText}`, 'crit-floating');
}

function setBoopFace(src) {
  if (ui.boopButton) {
    ui.boopButton.src = src;
  }
}

function handleBoopPress(event) {
  if (event) {
    event.preventDefault();
  }
  if (!ui.boopButton) return;

  boopHoldActive = true;
  boopHoldFinished = false;
  setBoopFace(BOOP_IMAGE_PRESSED_SRC);
  ui.boopButton.classList.add('boop-squish');
  if (boopPressTimeout) {
    clearTimeout(boopPressTimeout);
  }
  boopPressTimeout = setTimeout(() => {
    boopHoldFinished = true;
    if (!boopHoldActive) {
      setBoopFace(BOOP_IMAGE_DEFAULT_SRC);
      ui.boopButton.classList.remove('boop-squish');
    }
  }, BOOP_FACE_DURATION_MS);

  playSfx('boop');
  doBoop();
}

function handleBoopRelease() {
  if (!ui.boopButton) return;

  boopHoldActive = false;
  if (boopHoldFinished) {
    setBoopFace(BOOP_IMAGE_DEFAULT_SRC);
    ui.boopButton.classList.remove('boop-squish');
  }
}

function setupBoopButtonControls() {
  const button = ui.boopButton;
  if (!button) return;

  const releaseHandler = () => handleBoopRelease();

  button.addEventListener('pointerdown', (event) => {
    handleBoopPress(event);
  });
  button.addEventListener('pointerup', releaseHandler);
  button.addEventListener('pointerleave', releaseHandler);
  button.addEventListener('pointercancel', releaseHandler);
}

function spawnBoopFloat(amount) {
  if (!gameState.settings?.particlesEnabled || amount <= 0) return;
  spawnFloatingText(`+${formatBoopGain(amount)}`);
}

function spawnFloatingText(text, extraClass) {
  if (!gameState.settings?.particlesEnabled) return;
  const boopBtn = ui.boopButton;
  if (!boopBtn) return;
  const rect = boopBtn.getBoundingClientRect();
  const popup = document.createElement('div');
  popup.className = 'floating-text';
  if (extraClass) popup.classList.add(extraClass);
  popup.textContent = text;
  const randX = rect.left + rect.width * (0.2 + 0.6 * Math.random());
  const randY = rect.top + rect.height * (0.2 + 0.6 * Math.random());
  popup.style.left = `${randX}px`;
  popup.style.top = `${randY}px`;
  document.body.appendChild(popup);
  requestAnimationFrame(() => {
    popup.style.transform = 'translateY(-40px)';
    popup.style.opacity = '0';
  });
  setTimeout(() => popup.remove(), 700);
}

function updateBoopRainVisibility() {
  const layer = ui.boopRainLayer;
  if (!layer) return;
  if (gameState.settings.showBoopRain) {
    layer.style.display = 'block';
  } else {
    layer.style.display = 'none';
    layer.innerHTML = '';
  }
}

function spawnBoopParticle() {
  const layer = ui.boopRainLayer;
  if (!layer || !gameState.settings.showBoopRain) return;
  const rect = layer.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const particle = document.createElement('span');
  particle.className = 'boop-particle';
  particle.textContent = '🐾';
  particle.style.left = `${Math.random() * 100}%`;
  const duration = 1 + Math.random() * 0.5;
  particle.style.animationDuration = `${duration}s`;
  layer.appendChild(particle);
  setTimeout(() => particle.remove(), duration * 1000 + 200);
}

function maybeSpawnBoopParticle(bps) {
  if (!gameState.settings.showBoopRain) return;
  const rate = Math.max(0, bps || 0);
  if (rate <= 0) return;
  const chance = Math.min(0.05 + rate / 500, 0.35);
  if (Math.random() < chance) {
    spawnBoopParticle();
  }
}

function flashStoreRow(id) {
  if (!id) return;
  const row =
    document.getElementById(`${id}-card`) ||
    document.getElementById(`${id}-autocard`) ||
    document.querySelector(`[data-id="${id}"]`);
  if (!row) return;
  row.classList.remove('purchased-flash');
  void row.offsetWidth;
  row.classList.add('purchased-flash');
}

function formatCritChance(value) {
  const percent = (value * 100).toFixed(1);
  return `${percent.endsWith('.0') ? percent.slice(0, -2) : percent}%`;
}

function calculatePrestigeGain() {
  if (gameState.totalBoops < gameState.prestigeThreshold) {
    return 0;
  }
  const raw = gameState.totalBoops / gameState.prestigeThreshold;
  return Math.floor(Math.sqrt(raw));
}

function updateGlobalMultiplier() {
  gameState.globalMultiplier = 1 + gameState.boopEssence * 0.02;
}

function doPrestige() {
  const gain = calculatePrestigeGain();
  if (gain <= 0) {
    return;
  }

  const confirmed = window.confirm(`Reset daje ${gain} Boop Essence. Kontynuować?`);
  if (!confirmed) {
    return;
  }

  gameState.boopEssence += gain;
  updateGlobalMultiplier();
  gameState.totalPrestiges += 1;
  checkAchievements();
  resetProgressForPrestige();
  recalculateProductionStats();
  saveGame();
  updateUI();
}

function resetProgressForPrestige() {
  gameState.boops = 0;
  gameState.bpc = BASE_BPC;
  gameState.bps = BASE_BPS;
  gameState.bpcUpgrades = bpcUpgradesConfig.map((upgrade) => ({ ...upgrade }));
  gameState.autoBoopers = autoBoopersConfig.map((booper) => ({ ...booper }));
  gameState.lastUpdate = Date.now();
  applyFactionBonusById(null);
  showFactionOverlay();
  renderFactionOverlay();
  markStoreDirty();
  // Meta-perki oraz Boop Essence pozostają nietknięte podczas prestiżu.
}

function renderFactionOverlay() {
  const overlay = ui.factionOverlay;
  const container = ui.factionOverlayChoices;
  if (!overlay || !container) return;

  container.innerHTML = '';

  gameState.factions.forEach((faction) => {
    const button = document.createElement('button');
    button.className = 'faction-overlay-button';
    button.innerHTML = `<strong>${faction.name}</strong><span>${faction.description}</span>`;
    button.addEventListener('click', () => {
      chooseFaction(faction.id);
      hideFactionOverlay();
    });
    container.appendChild(button);
  });
  factionOverlayRendered = true;
}

function showFactionOverlay() {
  const overlay = ui.factionOverlay;
  if (!overlay) return;
  if (!factionOverlayRendered) {
    renderFactionOverlay();
  }
  overlay.classList.remove('hidden');
}

function hideFactionOverlay() {
  const overlay = ui.factionOverlay;
  if (!overlay) return;
  overlay.classList.add('hidden');
}

initGame();

// TODO: Rozbudować meta tree o kolejne gałęzie i synergy boosty.
// TODO: Dodać kolejne meta-perki (np. prestiżowe auto-rituały).
// TODO: Social faction totems dzielone między graczy.

/*
Dev summary:
- Settings UI: lewa kolumna, sekcja "Settings" – toggluje soundEnabled, particlesEnabled
  (floating text) oraz shortNumbers (formatNumber respektuje wybór).
- Achievements: stan w gameState.achievementsUnlocked, sprawdzane w checkAchievements()
  po klikach, zakupach i prestiżu; nagrody stosowane w applyAchievementReward/showAchievementPopup
  i renderowane w modalu + panelu bocznym.
- Ekonomia: helpery getAutoBooperCost/getAutoBooperBps i getFinalBpc ujednolicają koszt,
  skalowanie BPS oraz ostateczny BPC (uwzględnia mnożniki, frakcję, globalMultiplier).
- Share panel: aktualizowany w updateShareText() (left column) i kopiowany przyciskiem
  initShareUI() z użyciem navigator.clipboard.
*/
