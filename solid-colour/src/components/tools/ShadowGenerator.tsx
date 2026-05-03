import { useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import styles from './ToolPage.module.css';

interface ShadowLayer {
  x: number;
  y: number;
  blur: number;
  spread: number;
  opacity: number;
}

const PRESETS: Record<string, ShadowLayer[]> = {
  Soft: [{ x: 0, y: 4, blur: 16, spread: 0, opacity: 0.08 }],
  Subtle: [
    { x: 0, y: 1, blur: 2, spread: 0, opacity: 0.06 },
    { x: 0, y: 1, blur: 3, spread: 0, opacity: 0.1 },
  ],
  Card: [
    { x: 0, y: 4, blur: 6, spread: -1, opacity: 0.1 },
    { x: 0, y: 2, blur: 4, spread: -2, opacity: 0.06 },
  ],
  Lifted: [
    { x: 0, y: 10, blur: 15, spread: -3, opacity: 0.1 },
    { x: 0, y: 4, blur: 6, spread: -4, opacity: 0.05 },
  ],
  Pop: [
    { x: 0, y: 25, blur: 50, spread: -12, opacity: 0.25 },
    { x: 0, y: 8, blur: 16, spread: -8, opacity: 0.1 },
  ],
};

function layerToCss(l: ShadowLayer): string {
  return `${l.x}px ${l.y}px ${l.blur}px ${l.spread}px rgb(0 0 0 / ${l.opacity.toFixed(2)})`;
}

export const ShadowGenerator = () => {
  const [layer, setLayer] = useState<ShadowLayer>(PRESETS.Card[0]);
  const [layer2, setLayer2] = useState<ShadowLayer | null>(PRESETS.Card[1]);
  const [copied, setCopied] = useState(false);

  const css = useMemo(() => {
    const layers = layer2 ? [layer, layer2].map(layerToCss).join(', ') : layerToCss(layer);
    return `box-shadow: ${layers};`;
  }, [layer, layer2]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(css);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const applyPreset = (name: string) => {
    const p = PRESETS[name];
    if (!p) return;
    setLayer(p[0]);
    setLayer2(p[1] ?? null);
  };

  const set = (key: keyof ShadowLayer, value: number) => setLayer((l) => ({ ...l, [key]: value }));

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <span className={styles.eyebrow}>Toolbox</span>
        <h1 className={styles.title}>Shadow Generator</h1>
        <p className={styles.description}>
          Tune a box-shadow layer-by-layer with live preview. Start from a preset or build your own,
          then copy the CSS straight into your stylesheet.
        </p>
      </header>

      <div className={styles.controls}>
        <div className={styles.field}>
          <label className={styles.label}>Preset</label>
          <select
            className={styles.input}
            onChange={(e) => applyPreset(e.target.value)}
            defaultValue="Card"
          >
            {Object.keys(PRESETS).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Second layer</label>
          <select
            className={styles.input}
            value={layer2 ? 'on' : 'off'}
            onChange={(e) =>
              setLayer2(
                e.target.value === 'on' ? { x: 0, y: 1, blur: 3, spread: 0, opacity: 0.06 } : null
              )
            }
          >
            <option value="off">Single layer</option>
            <option value="on">Stacked (two layers)</option>
          </select>
        </div>
      </div>

      <div className={styles.controls} style={{ marginTop: 16 }}>
        <div className={styles.field}>
          <label className={styles.label}>x · {layer.x}px</label>
          <input
            type="range"
            min={-30}
            max={30}
            value={layer.x}
            onChange={(e) => set('x', Number(e.target.value))}
            className={styles.range}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>y · {layer.y}px</label>
          <input
            type="range"
            min={-30}
            max={50}
            value={layer.y}
            onChange={(e) => set('y', Number(e.target.value))}
            className={styles.range}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>blur · {layer.blur}px</label>
          <input
            type="range"
            min={0}
            max={80}
            value={layer.blur}
            onChange={(e) => set('blur', Number(e.target.value))}
            className={styles.range}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>spread · {layer.spread}px</label>
          <input
            type="range"
            min={-30}
            max={30}
            value={layer.spread}
            onChange={(e) => set('spread', Number(e.target.value))}
            className={styles.range}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>opacity · {layer.opacity.toFixed(2)}</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={layer.opacity}
            onChange={(e) => set('opacity', Number(e.target.value))}
            className={styles.range}
          />
        </div>
      </div>

      <div className={styles.shadowPreview}>
        <div
          className={styles.shadowChip}
          style={{ boxShadow: css.replace('box-shadow: ', '').replace(';', '') }}
        />
      </div>

      <div className={styles.codeBlock}>
        {css}
        <button className={styles.copyBtn} onClick={copy} aria-label="Copy CSS">
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
};
