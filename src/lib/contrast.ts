// Auto-contrast: sellers can pick any text + card color combo (e.g. light
// text for a dark page background with white cards), which can leave text
// unreadable on card surfaces. This picks a readable color for text that
// sits on top of a card background.

function luminance(hex: string): number | null {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return null;
  const rgb = [0, 2, 4].map((i) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

export function contrastRatio(a: string, b: string): number | null {
  const la = luminance(a);
  const lb = luminance(b);
  if (la == null || lb == null) return null;
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// Returns the preferred color when readable on the background, otherwise
// falls back to near-black on light surfaces or white on dark ones.
export function readableTextOn(bgHex: string, preferredHex: string, minRatio = 3): string {
  const ratio = contrastRatio(bgHex, preferredHex);
  if (ratio != null && ratio >= minRatio) return preferredHex;
  const dark = contrastRatio(bgHex, "#1a1a1a") || 0;
  const light = contrastRatio(bgHex, "#ffffff") || 0;
  return dark >= light ? "#1a1a1a" : "#ffffff";
}
