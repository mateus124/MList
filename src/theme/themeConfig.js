export const WALLPAPERS = [
  {
    id: 'tema-padrao',
    name: 'Padrao',
    url: '/icone.png',
    fallbackPalette: { base: { r: 33, g: 37, b: 49 }, accent: { r: 15, g: 239, b: 133 } },
  },
  {
    id: 'tema-sky',
    name: 'Sky Blue',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1400&q=80',
    fallbackPalette: { base: { r: 32, g: 45, b: 70 }, accent: { r: 83, g: 185, b: 255 } },
  },
  {
    id: 'tema-porsche-gt3-rs',
    name: 'Porsche GT3 RS',
    url: 'https://images.unsplash.com/photo-1634673970798-a15ae56f6c65?q=80&w=1228&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    fallbackPalette: { base: { r: 34, g: 37, b: 42 }, accent: { r: 243, g: 146, b: 32 } },
  },
];

export const DEFAULT_THEME_SETTINGS = { wallpaperId: WALLPAPERS[0].id };

const toRgba = (color, alpha) => `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;

const mixColors = (colorA, colorB, weight) => ({
  r: Math.round(colorA.r * (1 - weight) + colorB.r * weight),
  g: Math.round(colorA.g * (1 - weight) + colorB.g * weight),
  b: Math.round(colorA.b * (1 - weight) + colorB.b * weight),
});

const getLuminance = ({ r, g, b }) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

const getSaturationScore = ({ r, g, b }) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
};

const extractPaletteFromImage = (imageUrl, fallbackPalette) => new Promise((resolve) => {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.referrerPolicy = 'no-referrer';

  image.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });
      const size = 70;
      canvas.width = size;
      canvas.height = size;
      context.drawImage(image, 0, 0, size, size);

      const { data } = context.getImageData(0, 0, size, size);
      let totalR = 0;
      let totalG = 0;
      let totalB = 0;
      let count = 0;
      let accent = fallbackPalette.accent;
      let bestScore = -1;

      for (let index = 0; index < data.length; index += 16) {
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const alpha = data[index + 3];

        if (alpha < 100) continue;

        totalR += r;
        totalG += g;
        totalB += b;
        count += 1;

        const candidate = { r, g, b };
        const score = getSaturationScore(candidate) * (0.8 + getLuminance(candidate));
        if (score > bestScore) {
          bestScore = score;
          accent = candidate;
        }
      }

      if (!count) {
        resolve(fallbackPalette);
        return;
      }

      resolve({
        base: {
          r: Math.round(totalR / count),
          g: Math.round(totalG / count),
          b: Math.round(totalB / count),
        },
        accent,
      });
    } catch {
      resolve(fallbackPalette);
    }
  };

  image.onerror = () => resolve(fallbackPalette);
  image.src = imageUrl;
});

const applyDefaultTheme = () => {
  const root = document.documentElement;
  root.setAttribute('data-theme-mode', 'default');
  root.style.setProperty('--text-primary', '#B8C5D1');
  root.style.setProperty('--text-secondary', '#8F9AA7');
  root.style.setProperty('--text-muted', '#687380');
  root.style.setProperty('--surface-bg', 'rgba(41, 46, 61, 0.5)');
  root.style.setProperty('--surface-strong', 'rgba(47, 55, 73, 0.72)');
  root.style.setProperty('--surface-border', 'rgba(66, 77, 88, 0.92)');
  root.style.setProperty('--accent', '#0FEF85');
  root.style.setProperty('--accent-hover', '#24FF9A');
  root.style.setProperty('--danger', '#ff6273');
  root.style.setProperty('--danger-hover', '#ff8a97');
  root.style.setProperty('--app-overlay', 'rgba(0, 0, 0, 0)');
  root.style.setProperty('--app-bg-image', 'linear-gradient(#212531, #212531)');
};

export const applyThemeFromSettings = async (themeSettings, isCancelled = () => false) => {
  const wallpaper = WALLPAPERS.find((item) => item.id === themeSettings.wallpaperId) ?? WALLPAPERS[0];

  if (wallpaper.id === 'tema-padrao') {
    applyDefaultTheme();
    return;
  }

  const palette = await extractPaletteFromImage(wallpaper.url, wallpaper.fallbackPalette);
  if (isCancelled()) return;

  const root = document.documentElement;
  root.setAttribute('data-theme-mode', 'wallpaper');
  const base = mixColors(palette.base, { r: 14, g: 18, b: 28 }, 0.5);
  const accent = palette.accent;
  const accentHover = mixColors(accent, { r: 255, g: 255, b: 255 }, 0.14);
  const border = toRgba(mixColors(base, { r: 180, g: 196, b: 220 }, 0.2), 0.44);

  root.style.setProperty('--text-primary', '#d8e2ef');
  root.style.setProperty('--text-secondary', '#9eabbd');
  root.style.setProperty('--text-muted', '#6f7d91');
  root.style.setProperty('--surface-bg', toRgba(base, 0.45));
  root.style.setProperty('--surface-strong', toRgba(base, 0.66));
  root.style.setProperty('--surface-border', border);
  root.style.setProperty('--accent', `rgb(${accent.r}, ${accent.g}, ${accent.b})`);
  root.style.setProperty('--accent-hover', `rgb(${accentHover.r}, ${accentHover.g}, ${accentHover.b})`);
  root.style.setProperty('--danger', '#ff6273');
  root.style.setProperty('--danger-hover', '#ff8a97');
  root.style.setProperty('--app-overlay', 'rgba(11, 16, 27, 0.58)');
  root.style.setProperty('--app-bg-image', `url("${wallpaper.url}")`);
};
