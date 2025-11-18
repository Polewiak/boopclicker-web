const STORAGE_KEY = 'boopclicker-save-v5';
const SAVE_INTERVAL_SECONDS = 5;
const BASE_BPC = 1;
const BASE_BPS = 0;
const BASE_CRIT_CHANCE = 0.03;
const BASE_OFFLINE_EFFICIENCY = 0.5;
const PRESTIGE_THRESHOLD = 1_000_000;
const numberFormatter = new Intl.NumberFormat('pl-PL');

const bpcUpgradesConfig = [
  {
    id: 'energetic_ear_flicker',
    name: 'Energetic Ear Flicker',
    description: 'Szybkie potrząśnięcie uszami daje +5 BPC.',
    cost: 100,
    bonusBpc: 5,
    purchased: false,
  },
  {
    id: 'boy_bopper',
    name: 'Boy Bopper',
    description: 'Mocniejsze boopy od uroczych chłopów. +20 BPC.',
    cost: 500,
    bonusBpc: 20,
    purchased: false,
  },
  {
    id: 'himbo_hooters',
    name: 'Himbo Hooters',
    description: 'Drużyna himbo trenuje łapki. +80 BPC.',
    cost: 2000,
    bonusBpc: 80,
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
  boopEssence: 0,
  globalMultiplier: 1,
  bpcMultiplier: 1,
  bpsMultiplier: 1,
  offlineEfficiency: BASE_OFFLINE_EFFICIENCY,
  prestigeThreshold: PRESTIGE_THRESHOLD,
  lastUpdate: Date.now(),
};

let intervalId = null;
let saveTimer = 0;
let offlineNoticeTimeout = null;

const ui = {
  boops: document.getElementById('boops'),
  totalBoops: document.getElementById('totalBoops'),
  bpc: document.getElementById('bpc'),
  bps: document.getElementById('bps'),
  critChance: document.getElementById('critChance'),
  critMultiplier: document.getElementById('critMultiplier'),
  boopButton: document.getElementById('boopButton'),
  offlineNotice: document.getElementById('offlineNotice'),
  critPopup: document.getElementById('crit-popup'),
  clickUpgradesContainer: document.getElementById('click-upgrades-container'),
  autoUpgradesContainer: document.getElementById('auto-upgrades-container'),
  metaPerksContainer: document.getElementById('meta-perks-container'),
  metaBeValue: document.getElementById('meta-be-value'),
  prestigeTotalBoops: document.getElementById('total-boops-value'),
  boopEssence: document.getElementById('boop-essence-value'),
  prestigeGain: document.getElementById('prestige-gain-value'),
  globalMultiplier: document.getElementById('global-multiplier-value'),
  prestigeButton: document.getElementById('prestige-button'),
};

function initGame() {
  loadGame();
  attachHandlers();
  renderUpgrades();
  updateUI();
  if (intervalId) {
    clearInterval(intervalId);
  }
  intervalId = setInterval(gameLoop, 1000);
}

function attachHandlers() {
  ui.boopButton?.addEventListener('click', doBoop);
  ui.prestigeButton?.addEventListener('click', () => {
    doPrestige();
  });
  window.addEventListener('beforeunload', saveGame);
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
  } catch (error) {
    console.warn('Nie udało się wczytać zapisu', error);
  }

  recalculateProductionStats();
  applyOfflineProgress();
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
    boopEssence: gameState.boopEssence,
    globalMultiplier: gameState.globalMultiplier,
    bpcMultiplier: gameState.bpcMultiplier,
    bpsMultiplier: gameState.bpsMultiplier,
    offlineEfficiency: gameState.offlineEfficiency,
    prestigeThreshold: gameState.prestigeThreshold,
    lastUpdate: Date.now(),
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

function getFinalBpc() {
  return gameState.bpc * gameState.bpcMultiplier;
}

function getFinalBps() {
  return gameState.bps * gameState.bpsMultiplier;
}

function applyOfflineProgress() {
  const now = Date.now();
  const secondsPassed = Math.floor((now - (gameState.lastUpdate || now)) / 1000);
  const passiveRate = gameState.bps * gameState.bpsMultiplier * gameState.globalMultiplier;
  if (secondsPassed > 0 && passiveRate > 0) {
    const baseGain = secondsPassed * passiveRate * gameState.offlineEfficiency;
    const actualGain = addBoops(Math.floor(baseGain));
    announceOfflineGain(actualGain, secondsPassed);
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
    ui.critChance.textContent = formatCritChance(gameState.critChance);
  }
  if (ui.critMultiplier) {
    ui.critMultiplier.textContent = `×${numberFormatter.format(gameState.critMultiplier)}`;
  }

  if (ui.metaBeValue) {
    ui.metaBeValue.textContent = numberFormatter.format(Math.floor(gameState.boopEssence));
  }

  renderUpgrades();
  updatePrestigeUI();
  renderMetaPerks();
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

  const fragment = document.createDocumentFragment();
  availableUpgrades.forEach((upgrade) => {
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
    button.addEventListener('click', () => buyBpcUpgrade(upgrade.id));

    card.append(title, description, bonus, cost, button);
    fragment.appendChild(card);
  });

  container.appendChild(fragment);
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

function doBoop() {
  const baseGain = gameState.bpc * gameState.bpcMultiplier;
  const isCrit = Math.random() < gameState.critChance;
  let gain = baseGain;

  if (isCrit) {
    gain *= gameState.critMultiplier;
  }

  gain *= gameState.globalMultiplier;
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

function gameLoop() {
  const now = Date.now();
  const elapsedSeconds = Math.floor((now - gameState.lastUpdate) / 1000);
  const secondsToApply = Math.max(1, elapsedSeconds);
  const passiveGainPerSecond = gameState.bps * gameState.bpsMultiplier * gameState.globalMultiplier;
  if (passiveGainPerSecond > 0) {
    const gain = Math.floor(secondsToApply * passiveGainPerSecond);
    addBoops(gain);
  }
  gameState.lastUpdate = now;
  saveTimer += secondsToApply;

  if (saveTimer >= SAVE_INTERVAL_SECONDS) {
    saveTimer = 0;
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
  }, 300);
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
