// material-ui
import { alpha } from '@mui/material/styles';

// ==============================|| CUSTOM FUNCTION - WITH ALPHA ||============================== //

/**
 * Converts a hex color string to an RGB channel string ("r g b").
 *
 * @param hex - The hex color string (e.g. "#C8FAD6", "#FFF", "#FF00FFAA").
 * @returns The RGB channel string (e.g. "200 250 214").
 * @throws {Error} If the input is not a valid hex color.
 */
export function hexToRgbChannel(hex: string): string {
  let cleaned = hex.replace(/^#/, '');

  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (cleaned.length === 4) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  }

  if (cleaned.length !== 6 && cleaned.length !== 8) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);

  return `${r} ${g} ${b}`;
}

export function extendPaletteWithChannels(palette: any): any {
  const result = { ...palette };

  Object.entries(palette).forEach(([k, v]) => {
    if (typeof v === 'string' && v.startsWith('#')) {
      result[`${k}Channel`] = hexToRgbChannel(v);
    } else if (typeof v === 'object' && v !== null) {
      result[k] = extendPaletteWithChannels(v);
    }
  });

  return result;
}

export function withAlpha(color: string, opacity: number): string {
  // Case 1: normal color (hex, rgb, hsl…)
  if (/^#|rgb|hsl|color/i.test(color)) {
    return alpha(color, opacity);
  }

  // Case 2: CSS Var: var(--mui-palette-xxx) or var(--palette-xxx, #hex)
  if (color.startsWith('var(')) {
    // inject "Channel" *before the closing parenthesis of the var name only*
    return color.replace(/(--[a-zA-Z0-9-]+)(.*)\)/, `$1Channel$2)`).replace(/^var\((.+)\)$/, `rgba(var($1) / ${opacity})`);
  }

  // Fallback
  return color;
}

/**
 * Converts hex color to HSL
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let cleaned = hex.replace(/^#/, '');

  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  }

  const r = parseInt(cleaned.substring(0, 2), 16) / 255;
  const g = parseInt(cleaned.substring(2, 4), 16) / 255;
  const b = parseInt(cleaned.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Converts HSL to hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Generates color tones from a base color
 * Creates lighter and darker variations
 */
export function generateColorTones(baseColor: string, count: number): string[] {
  const hsl = hexToHsl(baseColor);
  const tones: string[] = [];

  for (let i = 0; i < count; i++) {
    const ratio = i / (count - 1 || 1);
    // 밝은 색(70-85%)에서 어두운 색(40-55%)으로 그라데이션
    const lightness = 85 - (ratio * 35); // 85% ~ 50%
    const saturation = Math.max(60, hsl.s - (ratio * 20)); // 채도 약간 조절

    tones.push(hslToHex(hsl.h, saturation, lightness));
  }

  return tones;
}
