const CAMBORDER_STORAGE_KEY = 'camborder-settings-v1';

const CAMBORDER_DEFAULTS = {
  useGradient: true,
  primaryColor: '#9146FF',
  secondaryColor: '#00D8D8',
  thickness: 10,
  cornerStyle: 'rounded', // rounded | square | cut
  cornerRadius: 24,
  glow: true,
  glowColor: '#9146FF',
  glowIntensity: 18,
  animated: false,
  animationSpeed: 6,
  label: {
    show: false,
    text: 'LIVE',
    position: 'bottom-center', // top-left|top-center|top-right|bottom-left|bottom-center|bottom-right
    fontSize: 18,
    textColor: '#ffffff',
    bgColor: '#9146FF',
  },
};

const CAMBORDER_PRESETS = {
  'Twitch Purple': {
    useGradient: true, primaryColor: '#9146FF', secondaryColor: '#00D8D8',
    thickness: 10, cornerStyle: 'rounded', cornerRadius: 24,
    glow: true, glowColor: '#9146FF', glowIntensity: 18, animated: false,
  },
  'Neon Cycle': {
    useGradient: true, primaryColor: '#ff00e6', secondaryColor: '#00e6ff',
    thickness: 8, cornerStyle: 'rounded', cornerRadius: 20,
    glow: true, glowColor: '#ff00e6', glowIntensity: 26, animated: true, animationSpeed: 5,
  },
  'Minimal White': {
    useGradient: false, primaryColor: '#ffffff', secondaryColor: '#ffffff',
    thickness: 4, cornerStyle: 'square', cornerRadius: 0,
    glow: false, glowColor: '#ffffff', glowIntensity: 0, animated: false,
  },
  'Fire': {
    useGradient: true, primaryColor: '#ff512f', secondaryColor: '#f9d423',
    thickness: 12, cornerStyle: 'cut', cornerRadius: 28,
    glow: true, glowColor: '#ff512f', glowIntensity: 24, animated: true, animationSpeed: 4,
  },
};

// Camborder can run two ways:
//  1. Served over http(s) by server.js — settings live in a JSON file on the
//     server and are pushed to every connected page (OBS + your browser)
//     over Server-Sent Events. This is the only mode where edits made in a
//     regular browser are guaranteed to reach OBS's separate browser engine.
//  2. Opened directly as a local file (file://) — falls back to
//     localStorage, which only syncs between pages loaded in the *same*
//     browser engine. Fine for previewing, not guaranteed to reach OBS.
const CAMBORDER_USE_SERVER = location.protocol === 'http:' || location.protocol === 'https:';

function camborderDeepMerge(base, extra) {
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const key in extra) {
    if (extra[key] && typeof extra[key] === 'object' && !Array.isArray(extra[key])) {
      out[key] = camborderDeepMerge(base[key] || {}, extra[key]);
    } else {
      out[key] = extra[key];
    }
  }
  return out;
}

function camborderNormalize(raw) {
  return camborderDeepMerge(CAMBORDER_DEFAULTS, raw || {});
}

function camborderLoadLocal() {
  try {
    const raw = localStorage.getItem(CAMBORDER_STORAGE_KEY);
    return raw ? camborderNormalize(JSON.parse(raw)) : camborderNormalize({});
  } catch (e) {
    return camborderNormalize({});
  }
}

function camborderSaveLocal(settings) {
  try { localStorage.setItem(CAMBORDER_STORAGE_KEY, JSON.stringify(settings)); } catch (e) {}
}

let camborderCurrent = camborderLoadLocal();
const camborderListeners = [];

function camborderNotify(settings) {
  camborderCurrent = settings;
  camborderListeners.forEach((cb) => cb(settings));
}

function camborderSubscribeLocalStorageFallback() {
  window.addEventListener('storage', (e) => {
    if (e.key === CAMBORDER_STORAGE_KEY) camborderNotify(camborderLoadLocal());
  });
  let last = localStorage.getItem(CAMBORDER_STORAGE_KEY);
  setInterval(() => {
    const current = localStorage.getItem(CAMBORDER_STORAGE_KEY);
    if (current !== last) {
      last = current;
      camborderNotify(camborderLoadLocal());
    }
  }, 400);
}

// Loads current settings, invokes callback immediately (and again whenever
// settings change, from any source: this tab, the server, or another client).
function camborderInit(callback) {
  camborderListeners.push(callback);

  if (!CAMBORDER_USE_SERVER) {
    callback(camborderCurrent);
    camborderSubscribeLocalStorageFallback();
    return;
  }

  fetch('/api/settings')
    .then((r) => r.json())
    .then((data) => camborderNotify(camborderNormalize(data)))
    .catch(() => callback(camborderCurrent));

  try {
    const es = new EventSource('/api/settings/stream');
    es.onmessage = (e) => {
      try { camborderNotify(camborderNormalize(JSON.parse(e.data))); } catch (err) {}
    };
  } catch (e) {}
}

function camborderSubscribe(callback) {
  camborderListeners.push(callback);
}

function camborderSaveSettings(settings) {
  camborderCurrent = settings;
  camborderSaveLocal(settings);
  if (CAMBORDER_USE_SERVER) {
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    }).catch(() => {});
  }
}
