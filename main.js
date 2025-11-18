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
    description: '+5% Critical Chance.',
    bonusType: 'crit',
    bonusValue: 0.05,
  },
  {
    id: 'wolf',
    name: 'Wolf Pack',
    description: '+5% BPS.',
    bonusType: 'bps',
    bonusValue: 0.05,
  },
  {
    id: 'dragon',
    name: 'Dragon Brood',
    description: '+5% BPC.',
    bonusType: 'bpc',
    bonusValue: 0.05,
  },
];

const achievementsConfig = [
  {
    id: 'first_prestige',
    name: 'First Prestige',
    description: 'Perform your first Prestige.',
    unlocked: false,
  },
  {
    id: 'million_boops',
    name: 'One in a Million',
    description: 'Reach 1,000,000 total boops.',
    unlocked: false,
  },
  {
    id: 'crit_master',
    name: 'Crit Master',
    description: 'Get 100 Critical Boops.',
    unlocked: false,
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
  achievements: achievementsConfig.map((achievement) => ({ ...achievement })),
  factions: factionConfig.map((faction) => ({ ...faction })),
  currentFaction: null,
  factionBonus: { crit: 0, bps: 0, bpc: 0 },
  boopEssence: 0,
  globalMultiplier: 1,
  bpcMultiplier: 1,
  bpsMultiplier: 1,
  offlineEfficiency: BASE_OFFLINE_EFFICIENCY,
  prestigeThreshold: PRESTIGE_THRESHOLD,
  stats: {
    totalClicks: 0,
    totalCrits: 0,
    totalPrestiges: 0,
  },
  lastUpdate: Date.now(),
};

let intervalId = null;
let saveTimer = 0;
let offlineNoticeTimeout = null;
let passiveGainRemainder = 0;

const ui = {
  boops: document.getElementById('boops'),
  totalBoops: document.getElementById('totalBoops'),
  bpc: document.getElementById('bpc'),
  bps: document.getElementById('bps'),
  critChance: document.getElementById('critChance'),
  critMultiplier: document.getElementById('critMultiplier'),
  coreEssence: document.getElementById('core-boop-essence'),
  boopButton: document.getElementById('boopButton'),
  offlineNotice: document.getElementById('offlineNotice'),
  critPopup: document.getElementById('crit-popup'),
  clickUpgradesContainer: document.getElementById('click-upgrades-container'),
  autoUpgradesContainer: document.getElementById('auto-upgrades-container'),
  metaPerksContainer: document.getElementById('meta-perks-container'),
  metaBeValue: document.getElementById('meta-be-value'),
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
  achievementsContainer: document.getElementById('achievements-container'),
  debugAddBoopsButton: document.getElementById('debug-add-boops'),
  debugResetButton: document.getElementById('debug-reset'),
  quickBoops: document.getElementById('boops-quick'),
  quickBpc: document.getElementById('bpc-quick'),
  quickBps: document.getElementById('bps-quick'),
  quickTotalBoops: document.getElementById('total-boops-quick'),
  quickEssence: document.getElementById('essence-quick'),
};

function initGame() {
  setupAccordions();
  loadGame();
  attachHandlers();
  renderUpgrades();
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
  window.addEventListener('beforeunload', saveGame);
}

function setupAccordions() {
  const headers = document.querySelectorAll('.accordion-header');
  headers.forEach((header) => {
    header.addEventListener('click', () => {
      header.parentElement?.classList.toggle('open');
    });
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
    gameState.boopEssence = typeof data.boopEssence === 'number' ? data.boopEssence : 0;
    gameState.globalMultiplier = 1 + gameState.boopEssence * 0.02;
    gameState.bpcMultiplier = typeof data.bpcMultiplier === 'number' ? data.bpcMultiplier : 1;
    gameState.bpsMultiplier = typeof data.bpsMultiplier === 'number' ? data.bpsMultiplier : 1;
    gameState.offlineEfficiency = typeof data.offlineEfficiency === 'number' ? data.offlineEfficiency : BASE_OFFLINE_EFFICIENCY;
    gameState.prestigeThreshold = typeof data.prestigeThreshold === 'number' ? data.prestigeThreshold : PRESTIGE_THRESHOLD;
    gameState.lastUpdate = typeof data.lastUpdate === 'number' ? data.lastUpdate : Date.now();
    gameState.bpcUpgrades = restoreBpcUpgrades(data.bpcUpgrades);
    gameState.autoBoopers = restoreAutoBoopers(data.autoBoopers);
    gameState.metaPerks = restoreMetaPerks(data.metaPerks);
    gameState.achievements = restoreAchievements(data.achievements);
    gameState.stats = restoreStats(data.stats);
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
  checkAchievements();
}

function saveGame() {
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
    achievements: gameState.achievements,
    currentFaction: gameState.currentFaction,
    factionBonus: gameState.factionBonus,
    boopEssence: gameState.boopEssence,
    globalMultiplier: gameState.globalMultiplier,
    bpcMultiplier: gameState.bpcMultiplier,
    bpsMultiplier: gameState.bpsMultiplier,
    offlineEfficiency: gameState.offlineEfficiency,
    prestigeThreshold: gameState.prestigeThreshold,
    stats: gameState.stats,
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

function restoreStats(savedStats) {
  return {
    totalClicks: Number(savedStats?.totalClicks) || 0,
    totalCrits: Number(savedStats?.totalCrits) || 0,
    totalPrestiges: Number(savedStats?.totalPrestiges) || 0,
  };
}

function restoreAchievements(savedList) {
  return achievementsConfig.map((achievement) => {
    const saved = Array.isArray(savedList)
      ? savedList.find((item) => item.id === achievement.id)
      : null;
    return {
      ...achievement,
      unlocked: saved?.unlocked ?? false,
    };
  });
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
  applyAllMetaPerks();
}

function applyAllMetaPerks() {
  gameState.bpcMultiplier = 1;
  gameState.bpsMultiplier = 1;
  gameState.offlineEfficiency = BASE_OFFLINE_EFFICIENCY;
  gameState.critChance = BASE_CRIT_CHANCE;

  gameState.metaPerks.forEach((perk) => {
    if (perk.purchased) {
      applyMetaPerkEffect(perk);
    }
  });
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

function applyFactionBonusById(factionId) {
  const faction = gameState.factions.find((item) => item.id === factionId) || null;
  gameState.currentFaction = faction ? faction.id : null;
  gameState.factionBonus = { crit: 0, bps: 0, bpc: 0 };
  if (faction) {
    gameState.factionBonus[faction.bonusType] = faction.bonusValue;
  }
}

function canChangeFaction() {
  return Math.floor(gameState.boops) === 0;
}

function chooseFaction(id) {
  if (!canChangeFaction()) {
    return;
  }
  applyFactionBonusById(id);
  saveGame();
  updateUI();
}

function getFinalBpc() {
  return (
    gameState.bpc *
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
  ui.boops.textContent = numberFormatter.format(Math.floor(gameState.boops));
  ui.totalBoops.textContent = numberFormatter.format(Math.floor(gameState.totalBoops));
  ui.bpc.textContent = numberFormatter.format(Math.round(finalBpc * 100) / 100);
  ui.bps.textContent = numberFormatter.format(Math.round(finalBps * 100) / 100);

  if (ui.critChance) {
    ui.critChance.textContent = formatCritChance(getEffectiveCritChance());
  }
  if (ui.critMultiplier) {
    ui.critMultiplier.textContent = `×${numberFormatter.format(gameState.critMultiplier)}`;
  }

  if (ui.coreEssence) {
    ui.coreEssence.textContent = numberFormatter.format(Math.floor(gameState.boopEssence));
  }

  if (ui.metaBeValue) {
    ui.metaBeValue.textContent = numberFormatter.format(Math.floor(gameState.boopEssence));
  }

  if (ui.quickBoops) {
    ui.quickBoops.textContent = numberFormatter.format(Math.floor(gameState.boops));
  }
  if (ui.quickBpc) {
    ui.quickBpc.textContent = numberFormatter.format(Math.round(finalBpc * 100) / 100);
  }
  if (ui.quickBps) {
    ui.quickBps.textContent = numberFormatter.format(Math.round(finalBps * 100) / 100);
  }
  if (ui.quickTotalBoops) {
    ui.quickTotalBoops.textContent = numberFormatter.format(Math.floor(gameState.totalBoops));
  }
  if (ui.quickEssence) {
    ui.quickEssence.textContent = numberFormatter.format(Math.floor(gameState.boopEssence));
  }

  renderUpgrades();
  updatePrestigeUI();
  renderMetaPerks();
  renderFactions();
  updateStatsUI();
  renderAchievements();
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

function renderUpgrades() {
  renderBpcUpgrades();
  renderAutoBoopers();
}

function renderBpcUpgrades() {
  const container = ui.clickUpgradesContainer;
  if (!container) return;
  container.innerHTML = '';

  const availableUpgrades = gameState.bpcUpgrades.filter((upgrade) => !upgrade.purchased);
  if (availableUpgrades.length === 0) {
    const done = document.createElement('p');
    done.className = 'upgrade-empty';
    done.textContent = 'Wszystkie klikane ulepszenia kupione.';
    container.appendChild(done);
    return;
  }

  const unlocked = availableUpgrades.filter((upgrade) => gameState.totalBoops >= (upgrade.unlockAt ?? upgrade.cost));
  const locked = availableUpgrades.filter((upgrade) => gameState.totalBoops < (upgrade.unlockAt ?? upgrade.cost));

  if (unlocked.length === 0) {
    const lockedInfo = document.createElement('p');
    lockedInfo.className = 'locked-upgrade';
    lockedInfo.textContent = 'Klikane ulepszenia odblokują się po zdobyciu większej liczby boops.';
    container.appendChild(lockedInfo);
  }

  const fragment = document.createDocumentFragment();
  unlocked.forEach((upgrade) => {
    const card = document.createElement('article');
    card.className = 'upgrade-card';

    const title = document.createElement('h3');
    title.textContent = upgrade.name;

    const description = document.createElement('p');
    description.textContent = upgrade.description;

    const bonus = document.createElement('p');
    bonus.innerHTML = `Bonus: <strong>+${numberFormatter.format(upgrade.bonusBpc)} BPC</strong>`;

    const cost = document.createElement('p');
    cost.innerHTML = `Koszt: <strong>${numberFormatter.format(upgrade.cost)}</strong> boops`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'buy-button';
    button.textContent = 'Buy';
    const canAfford = gameState.boops >= upgrade.cost;
    button.disabled = !canAfford;
    button.classList.toggle('disabled', !canAfford);
    button.classList.toggle('is-affordable', canAfford);
    card.classList.toggle('affordable', canAfford);
    button.addEventListener('click', () => buyBpcUpgrade(upgrade.id));

    card.append(title, description, bonus, cost, button);
    fragment.appendChild(card);
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
    const card = document.createElement('article');
    card.className = 'upgrade-card';

    const title = document.createElement('h3');
    title.textContent = booper.name;

    const description = document.createElement('p');
    description.textContent = booper.description;

    const meta = document.createElement('p');
    meta.innerHTML = `Poziom: <strong>${numberFormatter.format(booper.level)}</strong> · Bonus: <strong>+${numberFormatter.format(
      booper.bonusBpsPerLevel
    )} BPS/poziom</strong>`;

    const cost = document.createElement('p');
    cost.innerHTML = `Aktualny koszt: <strong>${numberFormatter.format(booper.currentCost)}</strong> boops`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'buy-button';
    button.textContent = 'Buy';
    const canAfford = gameState.boops >= booper.currentCost;
    button.disabled = !canAfford;
    button.classList.toggle('disabled', !canAfford);
    button.classList.toggle('is-affordable', canAfford);
    card.classList.toggle('affordable', canAfford);
    button.addEventListener('click', () => buyAutoBooper(booper.id));

    card.append(title, description, meta, cost, button);
    fragment.appendChild(card);
  });

  container.appendChild(fragment);
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
  if (!currentEl || !container) return;

  const activeFaction = gameState.factions.find((item) => item.id === gameState.currentFaction);
  currentEl.textContent = activeFaction
    ? `${activeFaction.name} — ${activeFaction.description}`
    : 'Brak wybranego totemu.';

  container.innerHTML = '';
  const fragment = document.createDocumentFragment();
  const canPick = canChangeFaction();

  gameState.factions.forEach((faction) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${faction.name} – ${faction.description}`;
    button.disabled = !canPick;
    if (faction.id === gameState.currentFaction) {
      button.classList.add('selected');
    }
    button.addEventListener('click', () => chooseFaction(faction.id));
    fragment.appendChild(button);
  });

  container.appendChild(fragment);
}

function updateStatsUI() {
  if (ui.statsTotalClicks) {
    ui.statsTotalClicks.textContent = numberFormatter.format(gameState.stats.totalClicks);
  }
  if (ui.statsTotalCrits) {
    ui.statsTotalCrits.textContent = numberFormatter.format(gameState.stats.totalCrits);
  }
  if (ui.statsTotalPrestiges) {
    ui.statsTotalPrestiges.textContent = numberFormatter.format(gameState.stats.totalPrestiges);
  }
}

function renderAchievements() {
  const container = ui.achievementsContainer;
  if (!container) return;
  container.innerHTML = '';

  const fragment = document.createDocumentFragment();
  gameState.achievements.forEach((achievement) => {
    const card = document.createElement('article');
    card.className = 'achievement-card';
    if (achievement.unlocked) {
      card.classList.add('unlocked');
    }

    const title = document.createElement('h3');
    title.textContent = achievement.name;

    const description = document.createElement('p');
    description.textContent = achievement.description;

    const status = document.createElement('p');
    status.textContent = achievement.unlocked ? 'Odblokowane' : 'Zablokowane';
    status.style.opacity = 0.8;

    card.append(title, description, status);
    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

function checkAchievements() {
  let unlockedAny = false;
  gameState.achievements.forEach((achievement) => {
    if (achievement.unlocked) {
      return;
    }
    switch (achievement.id) {
      case 'first_prestige':
        if (gameState.stats.totalPrestiges >= 1) {
          achievement.unlocked = true;
          unlockedAny = true;
        }
        break;
      case 'million_boops':
        if (gameState.totalBoops >= 1_000_000) {
          achievement.unlocked = true;
          unlockedAny = true;
        }
        break;
      case 'crit_master':
        if (gameState.stats.totalCrits >= 100) {
          achievement.unlocked = true;
          unlockedAny = true;
        }
        break;
      default:
        break;
    }
  });

  if (unlockedAny) {
    saveGame();
  }
}

function doBoop() {
  const baseGain = getFinalBpc();
  const isCrit = Math.random() < getEffectiveCritChance();
  let gain = baseGain;

  gameState.stats.totalClicks += 1;

  if (isCrit) {
    gain *= gameState.critMultiplier;
    gameState.stats.totalCrits += 1;
  }

  const appliedGain = addBoops(Math.max(1, Math.floor(gain)));

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

  updateUI();
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
  recalculateProductionStats();

  updateUI();
  saveGame();
}

function buyMetaPerk(id) {
  const perk = gameState.metaPerks.find((item) => item.id === id);
  if (!perk || perk.purchased || gameState.boopEssence < perk.cost) {
    return;
  }

  gameState.boopEssence -= perk.cost;
  perk.purchased = true;
  applyMetaPerkEffect(perk);
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
  gameState.achievements = achievementsConfig.map((achievement) => ({ ...achievement }));
  gameState.stats = { totalClicks: 0, totalCrits: 0, totalPrestiges: 0 };
  gameState.currentFaction = null;
  gameState.factionBonus = { crit: 0, bps: 0, bpc: 0 };
  passiveGainRemainder = 0;
  saveTimer = 0;
  gameState.lastUpdate = Date.now();
  recalculateProductionStats();
  updateGlobalMultiplier();
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
  ui.critPopup.textContent = `CRITICAL! +${numberFormatter.format(Math.floor(value))}`;
  ui.critPopup.classList.add('show');
  setTimeout(() => {
    ui.critPopup?.classList.remove('show');
  }, 600);
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
  gameState.stats.totalPrestiges += 1;
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
  applyFactionBonusById(gameState.currentFaction);
  // Meta-perki oraz Boop Essence pozostają nietknięte podczas prestiżu.
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
