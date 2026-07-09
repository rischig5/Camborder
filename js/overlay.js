const SVG_NS = 'http://www.w3.org/2000/svg';

const svg = document.getElementById('frame-svg');
const wrap = document.getElementById('border-shape-wrap');
const gradient = document.getElementById('border-gradient');
const gradStop1 = document.getElementById('grad-stop-1');
const gradStop2 = document.getElementById('grad-stop-2');
const labelEl = document.getElementById('camborder-label');

let shapeEl = null;
let currentSettings = null;
let animFrameId = null;

function buildCutPath(w, h, t, cut) {
  const inset = t / 2;
  const x0 = inset, y0 = inset, x1 = w - inset, y1 = h - inset;
  const maxCut = Math.max(0, Math.min((x1 - x0) / 2, (y1 - y0) / 2));
  const c = Math.max(0, Math.min(cut, maxCut));
  return [
    `M ${x0 + c} ${y0}`,
    `L ${x1 - c} ${y0}`,
    `L ${x1} ${y0 + c}`,
    `L ${x1} ${y1 - c}`,
    `L ${x1 - c} ${y1}`,
    `L ${x0 + c} ${y1}`,
    `L ${x0} ${y1 - c}`,
    `L ${x0} ${y0 + c}`,
    'Z',
  ].join(' ');
}

function rebuildShape(settings) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const t = settings.thickness;

  wrap.innerHTML = '';
  if (settings.cornerStyle === 'cut') {
    shapeEl = document.createElementNS(SVG_NS, 'path');
    shapeEl.setAttribute('d', buildCutPath(w, h, t, settings.cornerRadius));
  } else {
    shapeEl = document.createElementNS(SVG_NS, 'rect');
    const inset = t / 2;
    shapeEl.setAttribute('x', inset);
    shapeEl.setAttribute('y', inset);
    shapeEl.setAttribute('width', Math.max(0, w - t));
    shapeEl.setAttribute('height', Math.max(0, h - t));
    shapeEl.setAttribute('rx', settings.cornerStyle === 'square' ? 0 : settings.cornerRadius);
    shapeEl.setAttribute('ry', settings.cornerStyle === 'square' ? 0 : settings.cornerRadius);
  }
  shapeEl.id = 'border-shape';
  shapeEl.setAttribute('stroke-width', t);
  wrap.appendChild(shapeEl);
}

function applySettings(settings) {
  currentSettings = settings;
  rebuildShape(settings);

  gradStop1.setAttribute('stop-color', settings.primaryColor);
  gradStop2.setAttribute('stop-color', settings.useGradient ? settings.secondaryColor : settings.primaryColor);
  shapeEl.setAttribute('stroke', settings.useGradient ? 'url(#border-gradient)' : settings.primaryColor);

  svg.style.filter = settings.glow
    ? `drop-shadow(0 0 ${settings.glowIntensity}px ${settings.glowColor})`
    : 'none';

  if (settings.label.show && settings.label.text.trim() !== '') {
    labelEl.style.display = 'block';
    labelEl.textContent = settings.label.text;
    labelEl.style.fontSize = settings.label.fontSize + 'px';
    labelEl.style.color = settings.label.textColor;
    labelEl.style.background = settings.label.bgColor;
    labelEl.className = 'camborder-label pos-' + settings.label.position;
  } else {
    labelEl.style.display = 'none';
  }

  if (settings.animated && !animFrameId) {
    startAnimation();
  } else if (!settings.animated && animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
    gradient.setAttribute('gradientTransform', '');
  }
}

function startAnimation() {
  const tick = (ts) => {
    if (!currentSettings.animated) { animFrameId = null; return; }
    const speed = Math.max(0.5, currentSettings.animationSpeed);
    const angle = (ts / 1000) * (360 / speed) % 360;
    gradient.setAttribute('gradientTransform', `rotate(${angle} 0.5 0.5)`);
    animFrameId = requestAnimationFrame(tick);
  };
  animFrameId = requestAnimationFrame(tick);
}

window.addEventListener('resize', () => {
  if (currentSettings) applySettings(currentSettings);
});
camborderInit(applySettings);
