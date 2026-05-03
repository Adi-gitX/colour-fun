import { useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import styles from './ToolPage.module.css';

const TAILWIND_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

function parseHex(hex: string): RGB | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;
  const max = Math.max(rN, gN, bN);
  const min = Math.min(rN, gN, bN);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rN:
        h = (gN - bN) / d + (gN < bN ? 6 : 0);
        break;
      case gN:
        h = (bN - rN) / d + 2;
        break;
      case bN:
        h = (rN - gN) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

function hslToHex({ h, s, l }: HSL): string {
  const hN = h / 360;
  const sN = s / 100;
  const lN = l / 100;
  const a = sN * Math.min(lN, 1 - lN);
  const f = (n: number) => {
    const k = (n + hN * 12) % 12;
    const c = lN - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/** Step → target lightness (Tailwind-shaped curve). */
const STEP_LIGHTNESS: Record<number, number> = {
  50: 97,
  100: 94,
  200: 86,
  300: 77,
  400: 66,
  500: 53,
  600: 44,
  700: 36,
  800: 28,
  900: 20,
  950: 13,
};

function generateScale(hex: string): { step: number; hex: string }[] {
  const rgb = parseHex(hex);
  if (!rgb) return [];
  const hsl = rgbToHsl(rgb);
  return TAILWIND_STEPS.map((step) => ({
    step,
    hex: hslToHex({ h: hsl.h, s: Math.max(20, hsl.s), l: STEP_LIGHTNESS[step] }),
  }));
}

export const PaletteGenerator = () => {
  const [base, setBase] = useState('#3B82F6');
  const [copied, setCopied] = useState(false);

  const scale = useMemo(() => generateScale(base), [base]);

  const tailwindConfig = useMemo(() => {
    if (scale.length === 0) return '';
    const entries = scale.map((s) => `      ${s.step}: '${s.hex}',`).join('\n');
    return `colors: {\n  brand: {\n${entries}\n  }\n}`;
  }, [scale]);

  const copy = async () => {
    if (!tailwindConfig) return;
    try {
      await navigator.clipboard.writeText(tailwindConfig);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <span className={styles.eyebrow}>Toolbox</span>
        <h1 className={styles.title}>Palette Generator</h1>
        <p className={styles.description}>
          Pick a brand color and Atlas generates the full Tailwind-style 50&ndash;950 scale around
          it. Copy the config straight into <code>tailwind.config.js</code>.
        </p>
      </header>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="palette-base">
          Brand color
        </label>
        <input
          id="palette-base"
          type="text"
          value={base}
          onChange={(e) => setBase(e.target.value)}
          className={styles.input}
          placeholder="#3B82F6"
        />
      </div>

      {scale.length > 0 && (
        <>
          <div className={styles.paletteGrid}>
            {scale.map((s) => (
              <div key={s.step}>
                <div
                  className={styles.paletteCell}
                  style={{ background: s.hex }}
                  title={`${s.step} · ${s.hex}`}
                />
                <div className={styles.paletteLabel}>{s.step}</div>
              </div>
            ))}
          </div>

          <div className={styles.codeBlock}>
            {tailwindConfig}
            <button className={styles.copyBtn} onClick={copy} aria-label="Copy Tailwind config">
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
