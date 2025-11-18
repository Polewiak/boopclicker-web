const STORAGE_KEY = 'boopclicker-save-v1';
const SAVE_INTERVAL_SECONDS = 5;
const numberFormatter = new Intl.NumberFormat('pl-PL');

const gameState = {
  boops: 0,
  totalBoops: 0,
  bpc: 1,
  bps: 0,
  critChance: 0.03,
  critMultiplier: 7,
  lastCritValue: 0,
  upgrades: {
    bpc: { level: 0, baseCost: 10, cost: 10, scale: 1.15 },
    bps: { level: 0, baseCost: 50, cost: 50, scale: 1.17 }
  },
  lastUpdate: Date.now()
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
  bpcLevel: document.getElementById('bpcLevel'),
  bpcCost: document.getElementById('bpcCost'),
  bpsLevel: document.getElementById('bpsLevel'),
  bpsCost: document.getElementById('bpsCost'),
  bpcBuy: document.getElementById('bpcBuy'),
  bpsBuy: document.getElementById('bpsBuy'),
  offlineNotice: document.getElementById('offlineNotice'),
  critPopup: document.getElementById('crit-popup')
};

function initGame() {
  loadGame();
  attachHandlers();
  updateUI();
  if (intervalId) {
    clearInterval(intervalId);
  }
  intervalId = setInterval(gameLoop, 1000);
}

function attachHandlers() {
  ui.boopButton.addEventListener('click', doBoop);
  ui.bpcBuy.addEventListener('click', () => buyUpgrade('bpc'));
  ui.bpsBuy.addEventListener('click', () => buyUpgrade('bps'));
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
    Object.assign(gameState, data, {
      upgrades: {
        bpc: { ...gameState.upgrades.bpc, ...data.upgrades?.bpc },
        bps: { ...gameState.upgrades.bps, ...data.upgrades?.bps }
      }
    });

    if (typeof gameState.critChance !== 'number') gameState.critChance = 0.03;
    if (typeof gameState.critMultiplier !== 'number') gameState.critMultiplier = 7;
    if (typeof gameState.lastCritValue !== 'number') gameState.lastCritValue = 0;
  } catch (error) {
    console.warn('Nie udało się wczytać zapisu', error);
  }

  applyOfflineProgress();
}

function saveGame() {
  const payload = {
    ...gameState,
    lastUpdate: Date.now()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
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

  ui.bpcLevel.textContent = gameState.upgrades.bpc.level;
  ui.bpcCost.textContent = numberFormatter.format(gameState.upgrades.bpc.cost);
  ui.bpsLevel.textContent = gameState.upgrades.bps.level;
  ui.bpsCost.textContent = numberFormatter.format(gameState.upgrades.bps.cost);

  toggleBuyButton(ui.bpcBuy, gameState.boops >= gameState.upgrades.bpc.cost);
  toggleBuyButton(ui.bpsBuy, gameState.boops >= gameState.upgrades.bps.cost);
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

function buyUpgrade(type) {
  const upgrade = gameState.upgrades[type];
  if (!upgrade) return;
  if (gameState.boops < upgrade.cost) return;

  gameState.boops -= upgrade.cost;
  upgrade.level += 1;

  if (type === 'bpc') {
    gameState.bpc += 1;
  } else if (type === 'bps') {
    gameState.bps += 1;
  }

  upgrade.cost = Math.ceil(upgrade.cost * upgrade.scale);
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

function toggleBuyButton(button, canAfford) {
  if (!button) return;
  button.disabled = !canAfford;
  button.classList.toggle('is-affordable', canAfford);
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
