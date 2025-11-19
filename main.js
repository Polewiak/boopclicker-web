const STORAGE_KEY = 'boopclicker-save-v5';
const SAVE_INTERVAL_SECONDS = 5;
const LOOP_INTERVAL_MS = 100;
const BASE_BPC = 1;
const BASE_BPS = 0;
const BASE_CRIT_CHANCE = 0.03;
const BASE_OFFLINE_EFFICIENCY = 0.5;
const PRESTIGE_THRESHOLD = 1_000_000;
const DEBUG_BOOST_AMOUNT = 10_000_000;
const numberFormatter = new Intl.NumberFormat('pl-PL');

const bpcUpgradesConfig = [
  {
    id: 'energetic_ear_flicker',
    name: 'Energetic Ear Flicker',
    description: 'Szybkie potrząśnięcie uszami daje +5 BPC.',
    cost: 100,
    bonusBpc: 5,
    unlockAt: 100,
    purchased: false,
  },
  {
    id: 'boy_bopper',
    name: 'Boy Bopper',
    description: 'Mocniejsze boopy od uroczych chłopów. +20 BPC.',
    cost: 500,
    bonusBpc: 20,
    unlockAt: 500,
    purchased: false,
  },
  {
    id: 'himbo_hooters',
    name: 'Himbo Hooters',
    description: 'Drużyna himbo trenuje łapki. +80 BPC.',
    cost: 2000,
    bonusBpc: 80,
    unlockAt: 2000,
    purchased: false,
  },
];

const autoBoopersConfig = [
  {
    id: 'feral_toaster',
    name: 'Feral Toaster',
    description: 'Dzikie tostery wypiekają boopy. +1 BPS/poziom.',
    level: 0,
    baseCost: 50,
    currentCost: 50,
    scale: 1.17,
    bonusBpsPerLevel: 1,
  },
  {
    id: 'overworked_fox_intern',
    name: 'Overworked Fox Intern',
    description: 'Przemęczony lis dodaje +8 BPS na poziom.',
    level: 0,
    baseCost: 300,
    currentCost: 300,
    scale: 1.18,
    bonusBpsPerLevel: 8,
  },
  {
    id: 'wolfgirl_call_center',
    name: 'Wolfgirl Call Center',
    description: 'Oddział wilczyc generuje +45 BPS/poziom.',
    level: 0,
    baseCost: 2000,
    currentCost: 2000,
    scale: 1.18,
    bonusBpsPerLevel: 45,
  },
  {
    id: 'boomerang_otter_crew',
    name: 'Boomerang Otter Crew',
    description: 'Wydry na boomerangach dodają +250 BPS/poziom.',
    level: 0,
    baseCost: 12000,
    currentCost: 12000,
    scale: 1.19,
    bonusBpsPerLevel: 250,
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
  bps: BASE_BPS,
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
  totalClicks: 0,
  totalCrits: 0,
  totalPrestiges: 0,
  totalAutoBoopers: 0,
  lastUpdate: Date.now(),
};

let intervalId = null;
let saveTimer = 0;
let offlineNoticeTimeout = null;
let passiveGainRemainder = 0;
let storeNeedsRender = true;
let lastUnlockedClickCount = 0;
let factionOverlayRendered = false;

const ui = {
  topBoops: document.getElementById('ts-boops'),
  topBpc: document.getElementById('ts-bpc'),
  topBps: document.getElementById('ts-bps'),
  topTotalBoops: document.getElementById('ts-total-boops'),
  topEssence: document.getElementById('ts-boop-essence'),
  critChance: document.getElementById('critChance'),
  critMultiplier: document.getElementById('critMultiplier'),
  boopButton: document.getElementById('boopButton'),
  boopFloatContainer: document.getElementById('boop-float-container'),
  offlineNotice: document.getElementById('offlineNotice'),
  critPopup: document.getElementById('crit-popup'),
  clickUpgradesContainer: document.getElementById('click-upgrades-container'),
  autoUpgradesContainer: document.getElementById('auto-upgrades-container'),
  metaPerksContainer: document.getElementById('meta-perks-container'),
  metaBeValue: document.getElementById('meta-be-value'),
  profileName: document.getElementById('profile-name'),
  profileAvatar: document.getElementById('profile-avatar'),
  currentSkinBoops: document.getElementById('current-skin-boops'),
  topSkinName: document.getElementById('top-skin-name'),
  topSkinBoops: document.getElementById('top-skin-boops'),
  skinsShopList: document.getElementById('skins-shop-list'),
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
  achievementsGrid: document.getElementById('achievements-grid'),
  achievementToast: document.getElementById('achievement-toast'),
  debugAddBoopsButton: document.getElementById('debug-add-boops'),
  debugResetButton: document.getElementById('debug-reset'),
  factionOverlay: document.getElementById('faction-overlay'),
  factionOverlayChoices: document.getElementById('faction-overlay-choices'),
};

const storeTooltip = {
  root: document.getElementById('store-tooltip'),
  name: document.getElementById('store-tooltip-name'),
  description: document.getElementById('store-tooltip-description'),
  extra: document.getElementById('store-tooltip-extra'),
};

const sfx = {
  boop: null,
  crit: null,
  buy: null,
};

function playSfx(name) {
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

function getUnlockedClickUpgradeCount() {
  return gameState.bpcUpgrades.filter(
    (upgrade) => gameState.totalBoops >= (upgrade.unlockAt ?? upgrade.cost)
  ).length;
}

function updateStoreUI() {
  if (getUnlockedClickUpgradeCount() !== lastUnlockedClickCount) {
    storeNeedsRender = true;
  }

  if (storeNeedsRender) {
    renderUpgrades();
    storeNeedsRender = false;
  } else {
    refreshStoreRowAffordability();
  }
}

function refreshStoreRowAffordability() {
  const rows = document.querySelectorAll('.store-row');
  if (!rows.length) {
    return;
  }

  rows.forEach((row) => {
    if (row.classList.contains('disabled')) {
      row.classList.remove('affordable');
      return;
    }

    const { id, type } = row.dataset;
    if (!id || !type) {
      return;
    }

    let canAfford = false;
    if (type === 'click') {
      const upgrade = gameState.bpcUpgrades.find((item) => item.id === id);
      if (upgrade) {
        canAfford = gameState.boops >= upgrade.cost;
      }
    } else if (type === 'auto') {
      const booper = gameState.autoBoopers.find((item) => item.id === id);
      if (booper) {
        canAfford = gameState.boops >= booper.currentCost;
        const ownedEl = row.querySelector('.store-sub');
        if (ownedEl) {
          ownedEl.textContent = `Owned: ${numberFormatter.format(booper.level)}`;
        }
        const costEl = row.querySelector('.store-cost');
        if (costEl) {
          costEl.textContent = `${numberFormatter.format(booper.currentCost)} boops`;
        }
      }
    }

    row.classList.toggle('affordable', canAfford);
  });
}

const modalControls = {
  overlay: document.getElementById('modal-overlay'),
  closeButton: document.getElementById('modal-close'),
};

function setupModals() {
  const sideButtons = document.querySelectorAll('.side-menu-btn');
  sideButtons.forEach((button) => {
    const targetId = button.getAttribute('data-modal');
    button.addEventListener('click', () => openModal(targetId));
  });

  modalControls.closeButton?.addEventListener('click', closeModal);
  modalControls.overlay?.addEventListener('click', (event) => {
    if (event.target === modalControls.overlay) {
      closeModal();
    }
  });
}

function openModal(targetId) {
  if (!targetId || !modalControls.overlay) {
    return;
  }

  document.querySelectorAll('.modal-content').forEach((content) => {
    content.classList.add('hidden');
  });

  const target = document.getElementById(targetId);
  if (!target) {
    return;
  }

  hideStoreTooltip();
  if (targetId === 'stats-modal') {
    updateStatsUI();
    updateAchievementsUI();
  }
  target.classList.remove('hidden');
  modalControls.overlay.classList.remove('hidden');
}

function closeModal() {
  document.querySelectorAll('.modal-content').forEach((content) => {
    content.classList.add('hidden');
  });
  modalControls.overlay?.classList.add('hidden');
}

function initGame() {
  setupModals();
  loadGame();
  initProfileUI();
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

function attachHandlers() {
  ui.boopButton?.addEventListener('click', doBoop);
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
    gameState.bpcFlatBonus = typeof data.bpcFlatBonus === 'number' ? data.bpcFlatBonus : 0;
    gameState.totalClicks = Number(data.totalClicks) || 0;
    gameState.totalCrits = Number(data.totalCrits) || 0;
    gameState.totalPrestiges = Number(data.totalPrestiges) || 0;
    gameState.totalAutoBoopers = Number(data.totalAutoBoopers) || 0;
    if (data.totalAutoBoopers == null) {
      gameState.totalAutoBoopers = gameState.autoBoopers.reduce(
        (sum, booper) => sum + (booper.level || 0),
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
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function restoreBpcUpgrades(savedList) {
  return bpcUpgradesConfig.map((upgrade) => {
    const saved = Array.isArray(savedList) ? savedList.find((item) => item.id === upgrade.id) : null;
    return {
      ...upgrade,
      purchased: saved?.purchased ?? false,
    };
  });
}

function restoreAutoBoopers(savedList) {
  return autoBoopersConfig.map((booper) => {
    const saved = Array.isArray(savedList) ? savedList.find((item) => item.id === booper.id) : null;
    return {
      ...booper,
      level: saved?.level ?? 0,
      currentCost: saved?.currentCost ?? booper.baseCost,
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
  let baseBpc = BASE_BPC;
  let baseBps = BASE_BPS;

  gameState.bpcUpgrades.forEach((upgrade) => {
    if (upgrade.purchased) {
      baseBpc += upgrade.bonusBpc;
    }
  });

  gameState.autoBoopers.forEach((booper) => {
    if (booper.level > 0) {
      baseBps += booper.level * booper.bonusBpsPerLevel;
    }
  });

  gameState.bpc = baseBpc;
  gameState.bps = baseBps;
  rebuildPermanentBonuses();
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
  const baseWithFlat = gameState.bpc + (gameState.bpcFlatBonus || 0);
  return (
    baseWithFlat *
    gameState.bpcMultiplier *
    gameState.globalMultiplier *
    (1 + gameState.factionBonus.bpc)
  );
}

function getFinalBps() {
  return (
    gameState.bps *
    gameState.bpsMultiplier *
    gameState.globalMultiplier *
    (1 + gameState.factionBonus.bps)
  );
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
  const finalBpc = getFinalBpc();
  const finalBps = getFinalBps();
  const formattedBoops = numberFormatter.format(Math.floor(gameState.boops));
  const formattedTotal = numberFormatter.format(Math.floor(gameState.totalBoops));
  const formattedBpc = numberFormatter.format(Math.round(finalBpc * 100) / 100);
  const formattedBps = numberFormatter.format(Math.round(finalBps * 100) / 100);

  if (!gameState.currentFaction) {
    showFactionOverlay();
  } else {
    hideFactionOverlay();
  }

  if (ui.topBoops) {
    ui.topBoops.textContent = formattedBoops;
  }
  if (ui.topTotalBoops) {
    ui.topTotalBoops.textContent = formattedTotal;
  }
  if (ui.topBpc) {
    ui.topBpc.textContent = formattedBpc;
  }
  if (ui.topBps) {
    ui.topBps.textContent = formattedBps;
  }
  if (ui.topEssence) {
    ui.topEssence.textContent = numberFormatter.format(Math.floor(gameState.boopEssence));
  }

  if (ui.critChance) {
    ui.critChance.textContent = formatCritChance(getEffectiveCritChance());
  }
  if (ui.critMultiplier) {
    ui.critMultiplier.textContent = `×${numberFormatter.format(gameState.critMultiplier)}`;
  }

  if (ui.metaBeValue) {
    ui.metaBeValue.textContent = numberFormatter.format(Math.floor(gameState.boopEssence));
  }

  updateProfileUI();
  updateSkinStatsUI();
  renderSkinsShop();
  renderHighscores();

  updateStoreUI();
  updatePrestigeUI();
  renderMetaPerks();
  renderFactions();
  updateStatsUI();
  updateAchievementsUI();
}

function updatePrestigeUI() {
  if (ui.prestigeTotalBoops) {
    ui.prestigeTotalBoops.textContent = numberFormatter.format(Math.floor(gameState.totalBoops));
  }
  if (ui.boopEssence) {
    ui.boopEssence.textContent = numberFormatter.format(Math.floor(gameState.boopEssence));
  }
  if (ui.globalMultiplier) {
    ui.globalMultiplier.textContent = gameState.globalMultiplier.toFixed(2);
  }
  if (ui.prestigeGain) {
    ui.prestigeGain.textContent = numberFormatter.format(calculatePrestigeGain());
  }
  if (ui.prestigeButton) {
    ui.prestigeButton.disabled = calculatePrestigeGain() <= 0;
  }
}

function hideStoreTooltip() {
  storeTooltip.root?.classList.add('hidden');
}

function showStoreTooltip(data) {
  if (!storeTooltip.root || !storeTooltip.name || !storeTooltip.description || !storeTooltip.extra) {
    return;
  }
  storeTooltip.name.textContent = data.name || '';
  storeTooltip.description.textContent = data.description || '';
  storeTooltip.extra.textContent = data.extra || '';
  storeTooltip.root.classList.remove('hidden');
}

function attachStoreRowEvents(row, data) {
  if (!storeTooltip.root) return;
  const updateTooltipPosition = (event) => {
    if (!storeTooltip.root) return;
    const offset = 16;
    storeTooltip.root.style.left = `${event.pageX + offset}px`;
    storeTooltip.root.style.top = `${event.pageY + offset}px`;
  };

  row.addEventListener('mouseenter', (event) => {
    showStoreTooltip(data);
    updateTooltipPosition(event);
  });
  row.addEventListener('mousemove', updateTooltipPosition);
  row.addEventListener('mouseleave', hideStoreTooltip);
  row.addEventListener('focus', (event) => {
    showStoreTooltip(data);
    const target = event.target;
    if (target instanceof HTMLElement && storeTooltip.root) {
      const rect = target.getBoundingClientRect();
      storeTooltip.root.style.left = `${rect.right + 12}px`;
      storeTooltip.root.style.top = `${rect.top + window.scrollY}px`;
    }
  });
  row.addEventListener('blur', hideStoreTooltip);
  row.addEventListener('click', () => handleStoreRowPurchase(data));
  row.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleStoreRowPurchase(data);
    }
  });
}

function handleStoreRowPurchase(data) {
  if (data.disabled) {
    return;
  }
  if (data.type === 'click') {
    buyBpcUpgrade(data.id);
  } else if (data.type === 'auto') {
    buyAutoBooper(data.id);
  }
}

function createStoreRow({ icon, name, subLabel, costLabel, dataset, affordable, disabled, tooltipData }) {
  const row = document.createElement('div');
  row.className = 'store-row';
  if (affordable) {
    row.classList.add('affordable');
  }
  if (disabled) {
    row.classList.add('disabled');
    row.setAttribute('aria-disabled', 'true');
  }
  row.dataset.id = dataset.id;
  row.dataset.type = dataset.type;
  row.setAttribute('tabindex', '0');
  row.setAttribute('role', 'button');
  row.setAttribute('aria-label', `${name} (${costLabel})`);

  const iconEl = document.createElement('div');
  iconEl.className = 'store-icon';
  iconEl.textContent = icon;

  const main = document.createElement('div');
  main.className = 'store-main';
  const nameEl = document.createElement('div');
  nameEl.className = 'store-name';
  nameEl.textContent = name;
  main.appendChild(nameEl);
  if (subLabel) {
    const subEl = document.createElement('div');
    subEl.className = 'store-sub';
    subEl.textContent = subLabel;
    main.appendChild(subEl);
  }

  const costEl = document.createElement('div');
  costEl.className = 'store-cost';
  costEl.textContent = costLabel;

  row.append(iconEl, main, costEl);
  attachStoreRowEvents(row, { ...tooltipData, type: dataset.type, id: dataset.id, disabled });
  return row;
}

function renderUpgrades() {
  hideStoreTooltip();
  renderBpcUpgrades();
  renderAutoBoopers();
}

function renderBpcUpgrades() {
  const container = ui.clickUpgradesContainer;
  if (!container) return;
  container.innerHTML = '';

  const unlocked = gameState.bpcUpgrades.filter(
    (upgrade) => gameState.totalBoops >= (upgrade.unlockAt ?? upgrade.cost)
  );
  lastUnlockedClickCount = unlocked.length;
  const locked = gameState.bpcUpgrades.filter(
    (upgrade) => !upgrade.purchased && gameState.totalBoops < (upgrade.unlockAt ?? upgrade.cost)
  );

  if (unlocked.length === 0) {
    const lockedInfo = document.createElement('p');
    lockedInfo.className = 'locked-upgrade';
    lockedInfo.textContent = 'Klikane ulepszenia odblokują się po zdobyciu większej liczby boops.';
    container.appendChild(lockedInfo);
    return;
  }

  const fragment = document.createDocumentFragment();
  unlocked.forEach((upgrade) => {
    const canAfford = !upgrade.purchased && gameState.boops >= upgrade.cost;
    const row = createStoreRow({
      icon: '🐾',
      name: upgrade.name,
      subLabel: upgrade.purchased ? 'Purchased' : 'Unlocked',
      costLabel: upgrade.purchased
        ? 'Purchased'
        : `${numberFormatter.format(upgrade.cost)} boops`,
      dataset: { id: upgrade.id, type: 'click' },
      affordable: canAfford,
      disabled: upgrade.purchased,
      tooltipData: {
        name: upgrade.name,
        description: upgrade.description,
        extra: `+${numberFormatter.format(upgrade.bonusBpc)} BPC`,
      },
    });
    fragment.appendChild(row);
  });

  container.appendChild(fragment);

  if (locked.length > 0) {
    const lockedWrapper = document.createElement('div');
    lockedWrapper.className = 'locked-upgrade';
    const lockedTitle = document.createElement('p');
    lockedTitle.textContent = 'Następne ulepszenia odblokują się przy:';
    lockedWrapper.appendChild(lockedTitle);
    locked.forEach((upgrade) => {
      const item = document.createElement('p');
      const threshold = numberFormatter.format(upgrade.unlockAt ?? upgrade.cost);
      item.textContent = `${upgrade.name} – ${threshold} total boops`;
      lockedWrapper.appendChild(item);
    });
    container.appendChild(lockedWrapper);
  }
}

function renderAutoBoopers() {
  const container = ui.autoUpgradesContainer;
  if (!container) return;
  container.innerHTML = '';

  const fragment = document.createDocumentFragment();
  gameState.autoBoopers.forEach((booper) => {
    const canAfford = gameState.boops >= booper.currentCost;
    const row = createStoreRow({
      icon: '🏭',
      name: booper.name,
      subLabel: `Owned: ${numberFormatter.format(booper.level)}`,
      costLabel: `${numberFormatter.format(booper.currentCost)} boops`,
      dataset: { id: booper.id, type: 'auto' },
      affordable: canAfford,
      disabled: false,
      tooltipData: {
        name: booper.name,
        description: booper.description,
        extra: `+${numberFormatter.format(booper.bonusBpsPerLevel)} BPS / lvl`,
      },
    });
    fragment.appendChild(row);
  });

  container.appendChild(fragment);
}

function renderSkinsShop() {
  const list = ui.skinsShopList;
  if (!list) return;
  list.innerHTML = '';

  const fragment = document.createDocumentFragment();
  const visibleSkins = gameState.skins.filter((skin) => skin.public || skin.owned);

  visibleSkins.forEach((skin) => {
    const card = document.createElement('article');
    card.className = 'skin-card';
    if (skin.owned) {
      card.classList.add('owned');
    }

    const header = document.createElement('div');
    header.className = 'skin-card-header';
    const avatar = document.createElement('span');
    avatar.className = 'skin-avatar';
    avatar.textContent = skin.avatar || '✨';
    const title = document.createElement('div');
    title.className = 'skin-name';
    title.textContent = skin.name;
    header.append(avatar, title);

    const boopsLine = document.createElement('div');
    boopsLine.className = 'skin-boops';
    boopsLine.textContent = `Boops: ${numberFormatter.format(skin.boops || 0)}`;

    const actions = document.createElement('div');
    actions.className = 'skin-actions';

    if (skin.owned) {
      const equipButton = document.createElement('button');
      equipButton.type = 'button';
      equipButton.textContent = skin.id === gameState.currentSkinId ? 'Equipped' : 'Equip';
      equipButton.disabled = skin.id === gameState.currentSkinId;
      equipButton.addEventListener('click', () => equipSkin(skin.id));
      actions.appendChild(equipButton);
    } else if (skin.unlockCost != null) {
      const buyButton = document.createElement('button');
      buyButton.type = 'button';
      buyButton.textContent = `Buy (${numberFormatter.format(skin.unlockCost)} boops)`;
      buyButton.disabled = gameState.boops < skin.unlockCost;
      buyButton.addEventListener('click', () => buySkinWithBoops(skin.id));
      actions.appendChild(buyButton);
    } else if (skin.unlockCode) {
      const label = document.createElement('p');
      label.className = 'skin-locked-label';
      label.textContent = 'Unlockable by code';
      actions.appendChild(label);
    }

    card.append(header, boopsLine, actions);
    fragment.appendChild(card);
  });

  list.appendChild(fragment);
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
    costEl.textContent = `${numberFormatter.format(perk.cost)} BE`;
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
}

function updateSkinStatsUI() {
  const currentSkin = getCurrentSkin();
  if (ui.currentSkinBoops) {
    ui.currentSkinBoops.textContent = currentSkin ? numberFormatter.format(currentSkin.boops || 0) : 0;
  }
  const topSkin = getMostBoopedSkin();
  if (ui.topSkinName && ui.topSkinBoops) {
    if (topSkin) {
      ui.topSkinName.textContent = topSkin.name;
      ui.topSkinBoops.textContent = numberFormatter.format(topSkin.boops || 0);
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

function renderHighscores() {
  updateHighscores();

  const boopersList = ui.topBoopersList;
  const skinsList = ui.topSkinsList;

  if (boopersList) {
    boopersList.innerHTML = '';
    (gameState.boopers || []).forEach((entry) => {
      const li = document.createElement('li');
      li.textContent = `${entry.avatar || ''} ${entry.name || 'Anon'} – ${numberFormatter.format(
        entry.totalBoops || 0
      )} boops`;
      boopersList.appendChild(li);
    });
  }

  if (skinsList) {
    skinsList.innerHTML = '';
    (gameState.skinHighscores || []).forEach((entry) => {
      const li = document.createElement('li');
      li.textContent = `${entry.avatar || ''} ${entry.name || 'Skin'} – ${numberFormatter.format(
        entry.boops || 0
      )} boops`;
      skinsList.appendChild(li);
    });
  }
}

function updateStatsUI() {
  if (ui.statsTotalClicks) {
    ui.statsTotalClicks.textContent = numberFormatter.format(gameState.totalClicks);
  }
  if (ui.statsTotalCrits) {
    ui.statsTotalCrits.textContent = numberFormatter.format(gameState.totalCrits);
  }
  if (ui.statsTotalPrestiges) {
    ui.statsTotalPrestiges.textContent = numberFormatter.format(gameState.totalPrestiges);
  }
}

function updateAchievementsUI() {
  const container = ui.achievementsGrid;
  if (!container) return;
  container.innerHTML = '';

  const fragment = document.createDocumentFragment();
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
  });

  container.appendChild(fragment);
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

function doBoop() {
  const baseGain = getFinalBpc();
  const isCrit = Math.random() < getEffectiveCritChance();
  let gain = baseGain;

  gameState.totalClicks += 1;

  if (isCrit) {
    gain *= gameState.critMultiplier;
    gameState.totalCrits += 1;
  }

  const appliedGain = addBoops(Math.max(1, Math.floor(gain)));
  const currentSkin = getCurrentSkin();
  if (currentSkin) {
    currentSkin.boops = (currentSkin.boops || 0) + 1;
  }
  spawnBoopFloat(appliedGain);
  animateBoopButton();
  playSfx(isCrit ? 'crit' : 'boop');

  if (isCrit) {
    gameState.lastCritValue = appliedGain;
    showCritPopup(appliedGain);
  }

  updateUI();
  saveGame();
}

function buyBpcUpgrade(id) {
  const upgrade = gameState.bpcUpgrades.find((item) => item.id === id);
  if (!upgrade || upgrade.purchased || gameState.boops < upgrade.cost) {
    return;
  }

  gameState.boops -= upgrade.cost;
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
  if (!booper || gameState.boops < booper.currentCost) {
    return;
  }

  gameState.boops -= booper.currentCost;
  booper.level += 1;
  booper.currentCost = Math.ceil(booper.currentCost * booper.scale);
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
  gameState.lastUpdate = now;
  saveTimer += elapsedSeconds;

  while (saveTimer >= SAVE_INTERVAL_SECONDS) {
    saveTimer -= SAVE_INTERVAL_SECONDS;
    saveGame();
  }

  updateUI();
}

function addBoops(amount) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }
  gameState.boops += amount;
  gameState.totalBoops += amount;
  checkAchievements();
  return amount;
}

function announceOfflineGain(gain, seconds) {
  if (!ui.offlineNotice) return;
  if (!gain) {
    ui.offlineNotice.hidden = true;
    return;
  }

  const roundedGain = numberFormatter.format(Math.floor(gain));
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
  const { randX, randY } = getRandomBoopOffsets();
  ui.critPopup.textContent = `CRITICAL BOOP! +${numberFormatter.format(Math.floor(value))}`;
  ui.critPopup.style.setProperty('--crit-x', `${randX}px`);
  ui.critPopup.style.setProperty('--crit-y', `${randY}px`);
  ui.critPopup.classList.remove('show');
  void ui.critPopup.offsetWidth;
  ui.critPopup.classList.add('show');
}

function animateBoopButton() {
  if (!ui.boopButton) return;
  ui.boopButton.classList.remove('boop-anim');
  void ui.boopButton.offsetWidth;
  ui.boopButton.classList.add('boop-anim');
}

function spawnBoopFloat(amount) {
  const container = ui.boopFloatContainer;
  if (!container || amount <= 0) return;
  const { randX, randY } = getRandomBoopOffsets();
  const bubble = document.createElement('div');
  bubble.className = 'boop-float';
  bubble.style.setProperty('--float-x', `${randX}px`);
  bubble.style.setProperty('--float-y', `${randY}px`);
  bubble.textContent = `+${numberFormatter.format(Math.floor(amount))}`;
  container.appendChild(bubble);
  setTimeout(() => {
    bubble.remove();
  }, 800);
}

function getRandomBoopOffsets() {
  if (!ui.boopButton) return { randX: 0, randY: 0 };
  const rect = ui.boopButton.getBoundingClientRect();
  const randX = Math.random() * rect.width - rect.width / 2;
  const randY = Math.random() * rect.height - rect.height / 2;
  return { randX, randY };
}

function flashStoreRow(id) {
  if (!id) return;
  const row = document.querySelector(`.store-row[data-id="${id}"]`);
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
Gra działa w pętli sekundowej, naliczając BPS * globalMultiplier oraz boopy z kliknięć,
które korzystają z aktualnego BPC (w tym critów). Stan gry, prestiż, meta-perki oraz
zakupione upgrade'y zapisują się w localStorage i obejmują progres offline. Rozszerzenia
to TODO powyżej: rozbudowane meta tree oraz społecznościowe totemy.
*/
