let settings = camborderLoadLocal();

const els = {
  useGradient: document.getElementById('useGradient'),
  primaryColor: document.getElementById('primaryColor'),
  secondaryColor: document.getElementById('secondaryColor'),
  secondaryRow: document.getElementById('secondaryRow'),
  thickness: document.getElementById('thickness'),
  cornerStyle: document.getElementById('cornerStyle'),
  cornerRadius: document.getElementById('cornerRadius'),
  radiusRow: document.getElementById('radiusRow'),
  glow: document.getElementById('glow'),
  glowColor: document.getElementById('glowColor'),
  glowIntensity: document.getElementById('glowIntensity'),
  animated: document.getElementById('animated'),
  animationSpeed: document.getElementById('animationSpeed'),
  labelShow: document.getElementById('labelShow'),
  labelText: document.getElementById('labelText'),
  labelPosition: document.getElementById('labelPosition'),
  labelFontSize: document.getElementById('labelFontSize'),
  labelTextColor: document.getElementById('labelTextColor'),
  labelBgColor: document.getElementById('labelBgColor'),
};

function syncUiFromSettings() {
  els.useGradient.checked = settings.useGradient;
  els.primaryColor.value = settings.primaryColor;
  els.secondaryColor.value = settings.secondaryColor;
  els.secondaryRow.style.display = settings.useGradient ? 'flex' : 'none';
  els.thickness.value = settings.thickness;
  document.getElementById('thickness-val').textContent = settings.thickness + 'px';
  els.cornerStyle.value = settings.cornerStyle;
  els.cornerRadius.value = settings.cornerRadius;
  document.getElementById('cornerRadius-val').textContent = settings.cornerRadius + 'px';
  els.radiusRow.style.display = settings.cornerStyle === 'square' ? 'none' : 'flex';
  els.glow.checked = settings.glow;
  els.glowColor.value = settings.glowColor;
  els.glowIntensity.value = settings.glowIntensity;
  document.getElementById('glowIntensity-val').textContent = settings.glowIntensity + 'px';
  els.animated.checked = settings.animated;
  els.animationSpeed.value = settings.animationSpeed;
  document.getElementById('animationSpeed-val').textContent = settings.animationSpeed + 's';
  els.labelShow.checked = settings.label.show;
  els.labelText.value = settings.label.text;
  els.labelPosition.value = settings.label.position;
  els.labelFontSize.value = settings.label.fontSize;
  document.getElementById('labelFontSize-val').textContent = settings.label.fontSize + 'px';
  els.labelTextColor.value = settings.label.textColor;
  els.labelBgColor.value = settings.label.bgColor;
}

function persist() {
  camborderSaveSettings(settings);
}

function bindSimple(el, path, transform) {
  el.addEventListener('input', () => {
    const value = transform ? transform(el) : el.value;
    const keys = path.split('.');
    if (keys.length === 1) {
      settings[keys[0]] = value;
    } else {
      settings[keys[0]][keys[1]] = value;
    }
    persist();
    syncUiFromSettings();
  });
}

bindSimple(els.useGradient, 'useGradient', (el) => el.checked);
bindSimple(els.primaryColor, 'primaryColor');
bindSimple(els.secondaryColor, 'secondaryColor');
bindSimple(els.thickness, 'thickness', (el) => Number(el.value));
bindSimple(els.cornerStyle, 'cornerStyle');
bindSimple(els.cornerRadius, 'cornerRadius', (el) => Number(el.value));
bindSimple(els.glow, 'glow', (el) => el.checked);
bindSimple(els.glowColor, 'glowColor');
bindSimple(els.glowIntensity, 'glowIntensity', (el) => Number(el.value));
bindSimple(els.animated, 'animated', (el) => el.checked);
bindSimple(els.animationSpeed, 'animationSpeed', (el) => Number(el.value));
bindSimple(els.labelShow, 'label.show', (el) => el.checked);
bindSimple(els.labelText, 'label.text');
bindSimple(els.labelPosition, 'label.position');
bindSimple(els.labelFontSize, 'label.fontSize', (el) => Number(el.value));
bindSimple(els.labelTextColor, 'label.textColor');
bindSimple(els.labelBgColor, 'label.bgColor');

const presetsWrap = document.getElementById('presets');
Object.keys(CAMBORDER_PRESETS).forEach((name) => {
  const btn = document.createElement('button');
  btn.className = 'preset-btn';
  btn.textContent = name;
  btn.addEventListener('click', () => {
    settings = camborderDeepMerge(settings, CAMBORDER_PRESETS[name]);
    persist();
    syncUiFromSettings();
  });
  presetsWrap.appendChild(btn);
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Reset all border settings to default?')) return;
  settings = { ...CAMBORDER_DEFAULTS, label: { ...CAMBORDER_DEFAULTS.label } };
  persist();
  syncUiFromSettings();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'camborder-settings.json';
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('importBtn').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        settings = camborderDeepMerge(CAMBORDER_DEFAULTS, parsed);
        persist();
        syncUiFromSettings();
      } catch (e) {
        alert('Invalid settings file.');
      }
    };
    reader.readAsText(file);
  });
  input.click();
});

camborderInit((s) => {
  settings = s;
  syncUiFromSettings();
});
