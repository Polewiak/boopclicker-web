const STORAGE_KEY = 'boopclicker-save-v3';
const SAVE_INTERVAL_SECONDS = 5;
const BASE_BPC = 1;
const BASE_BPS = 0;
const numberFormatter = new Intl.NumberFormat('pl-PL');

const clickUpgradesConfig = [
  {
    id: 'energetic_ear_flicker',
    name: 'Energetic Ear Flicker',
    description: 'Szybkie potrząśnięcie uszami dla +5 BPC.',
    bonusBpc: 5,
    bonusBps: 0,
    cost: 100,
    purchased: false,
  },
  {
    id: 'boy_bopper',
    name: 'Boy Bopper',
    description: 'Silniejszy kumpel dodający +20 BPC.',
    bonusBpc: 20,
    bonusBps: 0,
    cost: 500,
    purchased: false,
  },
  {
    id: 'himbo_hooters',
    name: 'Himbo Hooters',
    description: 'Drużyna himbo zwiększa BPC o +80.',
    bonusBpc: 80,
    bonusBps: 0,
    cost: 2000,
    purchased: false,
  },
];

const autoUpgradesConfig = [
  {
    id: 'overworked_fox_intern',
    name: 'Overworked Fox Intern',
    description: 'Ambitny lis dodaje +8 BPS.',
    bonusBpc: 0,
    bonusBps: 8,
    cost: 300,
    purchased: false,
  },
  {
    id: 'wolfgirl_call_center',
    name: 'Wolfgirl Call Center',
    description: 'Całe call center produkuje +45 BPS.',
    bonusBpc: 0,
    bonusBps: 45,
    cost: 2000,
    purchased: false,
  },
  {
    id: 'boomerang_otter_crew',
    name: 'Boomerang Otter Crew',
    description: 'Wydajne wydry przynoszą +250 BPS.',
    bonusBpc: 0,
    bonusBps: 250,
    cost: 12000,
    purchased: false,
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
    boops: gameState.boops,
    totalBoops: gameState.totalBoops,
    bpc: gameState.bpc,
    bps: gameState.bps,
    critChance: gameState.critChance,
    critMultiplier: gameState.critMultiplier,
    lastCritValue: gameState.lastCritValue,
    upgradesClick: gameState.upgradesClick,
    upgradesAuto: gameState.upgradesAuto,
    lastUpdate: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function restoreUpgradeList(savedList, defaults) {
  return defaults.map((upgrade) => {
    const saved = Array.isArray(savedList) ? savedList.find((item) => item.id === upgrade.id) : null;
    return {
      ...upgrade,
      purchased: saved?.purchased ?? upgrade.purchased ?? false,
    };
  });
}

function recalculateProductionStats() {
  gameState.bpc = BASE_BPC;
  gameState.bps = BASE_BPS;
  gameState.upgradesClick.forEach((upgrade) => {
    if (upgrade.purchased) {
      gameState.bpc += upgrade.bonusBpc || 0;
    }
  });
  gameState.upgradesAuto.forEach((upgrade) => {
    if (upgrade.purchased) {
      gameState.bps += upgrade.bonusBps || 0;
    }
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

  list
    .filter((upgrade) => !upgrade.purchased)
    .forEach((upgrade) => {
      const card = document.createElement('article');
      card.className = 'upgrade-card';

      const title = document.createElement('h3');
      title.textContent = upgrade.name;

      const description = document.createElement('p');
      description.textContent = upgrade.description;

      const effect = document.createElement('p');
      const bonusText = upgrade.bonusBpc
        ? `+${numberFormatter.format(upgrade.bonusBpc)} BPC`
        : `+${numberFormatter.format(upgrade.bonusBps)} BPS`;
      effect.innerHTML = `Bonus: <strong>${bonusText}</strong>`;

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
      button.addEventListener('click', () => {
        if (type === 'click') {
          buyClickUpgrade(upgrade.id);
        } else {
          buyAutoUpgrade(upgrade.id);
        }
      });

      card.append(title, description, effect, cost, button);
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
  if (!upgrade || upgrade.purchased || gameState.boops < upgrade.cost) return;

  gameState.boops -= upgrade.cost;
  upgrade.purchased = true;
  recalculateProductionStats();

  updateUI();
  saveGame();
}

function buyAutoUpgrade(id) {
  const upgrade = gameState.upgradesAuto.find((item) => item.id === id);
  if (!upgrade || upgrade.purchased || gameState.boops < upgrade.cost) return;

  gameState.boops -= upgrade.cost;
  upgrade.purchased = true;
  recalculateProductionStats();

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
