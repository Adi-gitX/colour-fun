import { useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import styles from './ToolPage.module.css';

const STEPS = [-2, -1, 0, 1, 2, 3, 4, 5, 6];
const STEP_NAMES: Record<number, string> = {
  [-2]: 'xs',
  [-1]: 'sm',
  [0]: 'base',
  [1]: 'lg',
  [2]: 'xl',
  [3]: '2xl',
  [4]: '3xl',
  [5]: '4xl',
  [6]: '5xl',
};

const RATIO_PRESETS = [
  { value: 1.067, label: 'Minor 2nd · 1.067' },
  { value: 1.125, label: 'Major 2nd · 1.125' },
  { value: 1.2, label: 'Minor 3rd · 1.200' },
  { value: 1.25, label: 'Major 3rd · 1.250' },
  { value: 1.333, label: 'Perfect 4th · 1.333' },
  { value: 1.414, label: 'Augmented 4th · 1.414' },
  { value: 1.5, label: 'Perfect 5th · 1.500' },
  { value: 1.618, label: 'Golden ratio · 1.618' },
];

export const TypeScale = () => {
  const [base, setBase] = useState(16);
  const [ratio, setRatio] = useState(1.25);
  const [copied, setCopied] = useState(false);

  const scale = useMemo(() => {
    return STEPS.map((step) => {
      const px = base * Math.pow(ratio, step);
      const rem = px / 16;
      return { step, name: STEP_NAMES[step], px, rem };
    });
  }, [base, ratio]);

  const cssOutput = useMemo(() => {
    const tokens = scale.map((s) => `  --text-${s.name}: ${s.rem.toFixed(4)}rem;`).join('\n');
    return `:root {\n${tokens}\n}`;
  }, [scale]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cssOutput);
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
        <h1 className={styles.title}>Type Scale</h1>
        <p className={styles.description}>
          Build a modular type scale from a base size and a musical ratio. Live-preview every step
          and copy the CSS custom properties straight into your stylesheet.
        </p>
      </header>

      <div className={styles.controls}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="ts-base">
            Base size · {base}px
          </label>
          <input
            id="ts-base"
            type="range"
            min={12}
            max={24}
            step={1}
            value={base}
            onChange={(e) => setBase(Number(e.target.value))}
            className={styles.range}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="ts-ratio">
            Ratio
          </label>
          <select
            id="ts-ratio"
            className={styles.input}
            value={ratio}
            onChange={(e) => setRatio(Number(e.target.value))}
          >
            {RATIO_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.scaleList}>
        {scale.map((s) => (
          <div key={s.step} className={styles.scaleRow}>
            <span className={styles.scaleStep}>{s.name}</span>
            <span className={styles.scaleSample} style={{ fontSize: `${s.px}px` }}>
              The quick brown fox
            </span>
            <span className={styles.scaleSize}>
              {s.px.toFixed(1)}px · {s.rem.toFixed(3)}rem
            </span>
          </div>
        ))}
      </div>

      <div className={styles.codeBlock}>
        {cssOutput}
        <button className={styles.copyBtn} onClick={copy} aria-label="Copy CSS custom properties">
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
};
