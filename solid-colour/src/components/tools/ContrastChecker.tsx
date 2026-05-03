import { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import styles from './ToolPage.module.css';

/** Pure-color (no alpha) hex parser. Returns null on invalid input. */
function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}

/** Relative luminance per WCAG 2.1. */
function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const channel = (c: number) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(fg: string, bg: string): number | null {
  const f = parseHex(fg);
  const b = parseHex(bg);
  if (!f || !b) return null;
  const lf = relativeLuminance(f);
  const lb = relativeLuminance(b);
  const [hi, lo] = lf > lb ? [lf, lb] : [lb, lf];
  return (hi + 0.05) / (lo + 0.05);
}

export const ContrastChecker = () => {
  const [fg, setFg] = useState('#0F172A');
  const [bg, setBg] = useState('#F8FAFC');

  const ratio = useMemo(() => contrastRatio(fg, bg), [fg, bg]);

  const verdicts = useMemo(() => {
    if (ratio === null) return null;
    return {
      aaNormal: ratio >= 4.5,
      aaLarge: ratio >= 3,
      aaaNormal: ratio >= 7,
      aaaLarge: ratio >= 4.5,
    };
  }, [ratio]);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <span className={styles.eyebrow}>Toolbox</span>
        <h1 className={styles.title}>Contrast Checker</h1>
        <p className={styles.description}>
          Drop in two colors and see whether the contrast ratio passes WCAG 2.1 AA and AAA, for
          normal text and large text. Live preview updates as you type.
        </p>
      </header>

      <div className={styles.colorRow}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="contrast-fg">
            Foreground (text)
          </label>
          <input
            id="contrast-fg"
            type="text"
            value={fg}
            onChange={(e) => setFg(e.target.value)}
            className={styles.input}
            placeholder="#0F172A"
          />
          <div className={styles.swatch} style={{ background: fg }} />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="contrast-bg">
            Background
          </label>
          <input
            id="contrast-bg"
            type="text"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            className={styles.input}
            placeholder="#F8FAFC"
          />
          <div className={styles.swatch} style={{ background: bg }} />
        </div>
      </div>

      <div className={styles.resultBox}>
        <span className={styles.label}>Contrast ratio</span>
        <div className={styles.ratio}>{ratio === null ? '—' : `${ratio.toFixed(2)} : 1`}</div>
        {verdicts && (
          <div className={styles.verdictRow}>
            <span
              className={`${styles.verdict} ${verdicts.aaNormal ? styles.verdictPass : styles.verdictFail}`}
            >
              {verdicts.aaNormal ? <Check size={12} /> : <X size={12} />}
              AA · normal text
            </span>
            <span
              className={`${styles.verdict} ${verdicts.aaLarge ? styles.verdictPass : styles.verdictFail}`}
            >
              {verdicts.aaLarge ? <Check size={12} /> : <X size={12} />}
              AA · large text
            </span>
            <span
              className={`${styles.verdict} ${verdicts.aaaNormal ? styles.verdictPass : styles.verdictFail}`}
            >
              {verdicts.aaaNormal ? <Check size={12} /> : <X size={12} />}
              AAA · normal text
            </span>
            <span
              className={`${styles.verdict} ${verdicts.aaaLarge ? styles.verdictPass : styles.verdictFail}`}
            >
              {verdicts.aaaLarge ? <Check size={12} /> : <X size={12} />}
              AAA · large text
            </span>
          </div>
        )}
      </div>

      {ratio !== null && (
        <div className={styles.previewBox} style={{ background: bg, color: fg }}>
          The quick brown fox jumps over the lazy dog. Lorem ipsum dolor sit amet.
        </div>
      )}
    </div>
  );
};
