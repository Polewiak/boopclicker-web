const STORAGE_KEY = 'boopclicker-save-v2';
const SAVE_INTERVAL_SECONDS = 5;
const BASE_BPC = 1;
const BASE_BPS = 0;
const numberFormatter = new Intl.NumberFormat('pl-PL');

const clickUpgradesConfig = [
  {
    id: 'soft_paw_tap',
    name: 'Soft Paw Tap',
    description: 'Delikatne trącenie łapką. +1 BPC na poziom.',
    level: 0,
    baseCost: 10,
    currentCost: 10,
    scale: 1.15,
    bonusBpc: 1,
    bonusBps: 0,
  },
  {
    id: 'energetic_ear_flicker',
    name: 'Energetic Ear Flicker',
    description: 'Szybkie potrząśnięcie uszami dla +5 BPC na poziom.',
    level: 0,
    baseCost: 100,
    currentCost: 100,
    scale: 1.15,
    bonusBpc: 5,
    bonusBps: 0,
  },
  {
    id: 'boy_bopper',
    name: 'Boy Bopper',
    description: 'Nieco silniejszy kumpel dodający +20 BPC na poziom.',
    level: 0,
    baseCost: 500,
    currentCost: 500,
    scale: 1.17,
    bonusBpc: 20,
    bonusBps: 0,
  },
  {
    id: 'himbo_hooters',
    name: 'Himbo Hooters',
    description: 'Drużyna himbo zwiększa BPC o +80 na poziom.',
    level: 0,
    baseCost: 2000,
    currentCost: 2000,
    scale: 1.18,
    bonusBpc: 80,
    bonusBps: 0,
  },
];

const autoUpgradesConfig = [
  {
    id: 'feral_toaster',
    name: 'Feral Toaster',
    description: 'Wypluwa pasywne boopy: +1 BPS na poziom.',
    level: 0,
    baseCost: 50,
    currentCost: 50,
    scale: 1.17,
    bonusBpc: 0,
    bonusBps: 1,
  },
  {
    id: 'overworked_fox_intern',
    name: 'Overworked Fox Intern',
    description: 'Ambitny lis dodaje +8 BPS na poziom.',
    level: 0,
    baseCost: 300,
    currentCost: 300,
    scale: 1.18,
    bonusBpc: 0,
    bonusBps: 8,
  },
  {
    id: 'wolfgirl_call_center',
    name: 'Wolfgirl Call Center',
    description: 'Całe call center produkuje +45 BPS na poziom.',
    level: 0,
    baseCost: 2000,
    currentCost: 2000,
    scale: 1.18,
    bonusBpc: 0,
    bonusBps: 45,
  },
  {
    id: 'boomerang_otter_crew',
    name: 'Boomerang Otter Crew',
    description: 'Wydajne wydry przynoszą +250 BPS na poziom.',
    level: 0,
    baseCost: 12000,
    currentCost: 12000,
    scale: 1.19,
    bonusBpc: 0,
    bonusBps: 250,
  },
];

const gameState = {
  boops: 0,
  totalBoops: 0,
  bpc: BASE_BPC,
  bps: BASE_BPS,
  critChance: 0.03,
  critMultiplier: 7,
  lastCritValue: 0,
  upgradesClick: clickUpgradesConfig.map((upgrade) => ({ ...upgrade })),
  upgradesAuto: autoUpgradesConfig.map((upgrade) => ({ ...upgrade })),
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
  ui.boopButton.addEventListener('click', doBoop);
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
    gameState.critChance = typeof data.critChance === 'number' ? data.critChance : gameState.critChance;
    gameState.critMultiplier = typeof data.critMultiplier === 'number' ? data.critMultiplier : gameState.critMultiplier;
    gameState.lastCritValue = typeof data.lastCritValue === 'number' ? data.lastCritValue : 0;
    gameState.lastUpdate = typeof data.lastUpdate === 'number' ? data.lastUpdate : Date.now();
    gameState.upgradesClick = restoreUpgradeList(data.upgradesClick, clickUpgradesConfig);
    gameState.upgradesAuto = restoreUpgradeList(data.upgradesAuto, autoUpgradesConfig);
  } catch (error) {
    console.warn('Nie udało się wczytać zapisu', error);
  }

  recalculateProductionStats();
  applyOfflineProgress();
}

function saveGame() {
  const payload = {
    ...gameState,
    lastUpdate: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function restoreUpgradeList(savedList, defaults) {
  return defaults.map((upgrade) => {
    const saved = Array.isArray(savedList) ? savedList.find((item) => item.id === upgrade.id) : null;
    return {
      ...upgrade,
      level: saved?.level ?? upgrade.level,
      currentCost: saved?.currentCost ?? upgrade.currentCost ?? upgrade.baseCost,
    };
  });
}

function recalculateProductionStats() {
  gameState.bpc = BASE_BPC;
  gameState.bps = BASE_BPS;
  gameState.upgradesClick.forEach((upgrade) => {
    gameState.bpc += upgrade.level * (upgrade.bonusBpc || 0);
  });
  gameState.upgradesAuto.forEach((upgrade) => {
    gameState.bps += upgrade.level * (upgrade.bonusBps || 0);
  });
}

function applyOfflineProgress() {
  const now = Date.now();
  const secondsPassed = Math.floor((now - (gameState.lastUpdate || now)) / 1000);
  if (secondsPassed > 0) {
    const offlineGain = secondsPassed * gameState.bps * 0.5;
    addBoops(offlineGain);
    announceOfflineGain(offlineGain, secondsPassed);
  }
  gameState.lastUpdate = now;
}

function updateUI() {
  ui.boops.textContent = numberFormatter.format(Math.floor(gameState.boops));
  ui.totalBoops.textContent = numberFormatter.format(Math.floor(gameState.totalBoops));
  ui.bpc.textContent = numberFormatter.format(gameState.bpc);
  ui.bps.textContent = numberFormatter.format(gameState.bps);
  if (ui.critChance) {
    ui.critChance.textContent = formatCritChance(gameState.critChance);
  }
  if (ui.critMultiplier) {
    ui.critMultiplier.textContent = `×${numberFormatter.format(gameState.critMultiplier)}`;
  }

  renderUpgrades();
}

function renderUpgrades() {
  renderUpgradeList(gameState.upgradesClick, ui.clickUpgradesContainer, 'click');
  renderUpgradeList(gameState.upgradesAuto, ui.autoUpgradesContainer, 'auto');
}

function renderUpgradeList(list, container, type) {
  if (!container) return;
  container.innerHTML = '';
  const fragment = document.createDocumentFragment();

  list.forEach((upgrade) => {
    const card = document.createElement('article');
    card.className = 'upgrade-card';

    const title = document.createElement('h3');
    title.textContent = upgrade.name;

    const description = document.createElement('p');
    description.textContent = upgrade.description;

    const level = document.createElement('p');
    level.innerHTML = `Poziom: <strong>${upgrade.level}</strong>`;

    const cost = document.createElement('p');
    cost.innerHTML = `Koszt: <strong>${numberFormatter.format(Math.ceil(upgrade.currentCost))}</strong> boops`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'buy-button';
    button.textContent = 'Buy';
    const canAfford = gameState.boops >= upgrade.currentCost;
    button.disabled = !canAfford;
    button.classList.toggle('disabled', !canAfford);
    button.classList.toggle('is-affordable', canAfford);
    button.addEventListener('click', () => {
      if (type === 'click') {
        buyClickUpgrade(upgrade.id);
      } else {
        buyAutoUpgrade(upgrade.id);
      }
    });

    card.append(title, description, level, cost, button);
    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

function doBoop() {
  const baseGain = gameState.bpc;
  const isCrit = Math.random() < gameState.critChance;
  let gain = baseGain;

  if (isCrit) {
    gain = Math.round(baseGain * gameState.critMultiplier);
    gameState.lastCritValue = gain;
    showCritPopup(gain);
  }

  addBoops(gain);
  updateUI();
  saveGame();
}

function buyClickUpgrade(id) {
  const upgrade = gameState.upgradesClick.find((item) => item.id === id);
  if (!upgrade || gameState.boops < upgrade.currentCost) return;

  gameState.boops -= upgrade.currentCost;
  upgrade.level += 1;
  gameState.bpc += upgrade.bonusBpc;
  upgrade.currentCost = Math.ceil(upgrade.currentCost * upgrade.scale);

  updateUI();
  saveGame();
}

function buyAutoUpgrade(id) {
  const upgrade = gameState.upgradesAuto.find((item) => item.id === id);
  if (!upgrade || gameState.boops < upgrade.currentCost) return;

  gameState.boops -= upgrade.currentCost;
  upgrade.level += 1;
  gameState.bps += upgrade.bonusBps;
  upgrade.currentCost = Math.ceil(upgrade.currentCost * upgrade.scale);

  updateUI();
  saveGame();
}

function gameLoop() {
  const now = Date.now();
  const elapsedSeconds = Math.floor((now - gameState.lastUpdate) / 1000);
  const secondsToApply = Math.max(1, elapsedSeconds);
  addBoops(secondsToApply * gameState.bps);
  gameState.lastUpdate = now;
  saveTimer += secondsToApply;

  if (saveTimer >= SAVE_INTERVAL_SECONDS) {
    saveTimer = 0;
    saveGame();
  }

  updateUI();
}

function addBoops(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  gameState.boops += amount;
  gameState.totalBoops += amount;
}

function announceOfflineGain(gain, seconds) {
  if (!ui.offlineNotice) return;
  if (!gain) {
    ui.offlineNotice.hidden = true;
    return;
  }

  const roundedGain = numberFormatter.format(Math.floor(gain));
  ui.offlineNotice.textContent = `Byłeś offline ${seconds}s i zyskałeś ${roundedGain} boops (50% efektywności).`;
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

initGame();

// TODO: Prestige system that resets boops for long-term bonuses.
// TODO: Meta-perks purchasable with rare shards for stronger upgrades.
// TODO: Social faction totems with asynchronous community goals.

/*
Gra działa w pętli sekundowej, dodając BPS oraz reaguje na kliknięcia BOOP,
które korzystają z aktualnego BPC. Wszystkie wartości są zapisywane w
localStorage, wliczając progres offline liczony przy starcie. Najprostsze
punkty rozszerzeń to bloki TODO: prestiż (reset w zamian za bonusy), meta-perki
trwałe pomiędzy runami oraz społecznościowe totemy z zadaniami dla wielu graczy.
*/
