import { useMemo, useState } from 'react';
import { HexColorInput } from 'react-colorful';
import { Check, Copy, Download, Shuffle } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { generateAndDownload } from '../utils/imageGenerator';
import { gradients, gradientBuckets } from '../data/gradients';
import type { GradientPreset } from '../data/gradients';
import { DotmSquare2 } from './ui/dotm-square-2';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import styles from './GradientGenerator.module.css';

export const GradientGenerator = () => {
  const selectedResolution = useAppStore((s) => s.selectedResolution);
  const selectedFormat = useAppStore((s) => s.selectedFormat);
  const useCustomSize = useAppStore((s) => s.useCustomSize);
  const customWidth = useAppStore((s) => s.customWidth);
  const customHeight = useAppStore((s) => s.customHeight);
  const addRecentColor = useAppStore((s) => s.addRecentColor);
  const showToast = useAppStore((s) => s.showToast);

  const [color1, setColor1] = useState('#FF512F');
  const [color2, setColor2] = useState('#DD2476');
  const [angle, setAngle] = useState(45);
  const [bucket, setBucket] = useState<GradientPreset['bucket'] | 'all'>('all');
  const [presetId, setPresetId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const gradientCSS = `linear-gradient(${angle}deg, ${color1}, ${color2})`;

  const presets = useMemo(
    () => (bucket === 'all' ? gradients : gradients.filter((g) => g.bucket === bucket)),
    [bucket]
  );

  const applyPreset = (g: GradientPreset) => {
    setColor1(g.from.toUpperCase());
    setColor2(g.to.toUpperCase());
    setAngle(g.angle);
    setPresetId(g.id);
  };

  const handleRandomize = () => {
    const g = gradients[Math.floor(Math.random() * gradients.length)];
    applyPreset(g);
    setAngle(Math.floor(Math.random() * 360));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`background: ${gradientCSS};`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy', err);
      showToast('Could not copy to the clipboard', 'error');
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const finalWidth = useCustomSize ? customWidth : selectedResolution.width;
      const finalHeight = useCustomSize ? customHeight : selectedResolution.height;
      await generateAndDownload({
        gradient: { color1, color2, angle },
        width: finalWidth,
        height: finalHeight,
        format: selectedFormat,
        quality: 1.0,
        filename: `Gradient_${color1.replace('#', '')}_${color2.replace('#', '')}`,
      });
      addRecentColor(color1);
      addRecentColor(color2);
    } catch (error) {
      console.error('Download failed:', error);
      showToast('Export failed', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const pick = (setter: (v: string) => void) => (v: string) => {
    setter(v.toUpperCase());
    setPresetId(null);
  };

  return (
    <section className={styles.container}>
      <div className={styles.workspace}>
        <div className={styles.preview}>
          <div className={styles.previewGradient} style={{ background: gradientCSS }} />
          <code className={styles.previewCss}>{gradientCSS}</code>
        </div>

        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <span className="eyebrow">Stops</span>
            <div className={styles.colorInputs}>
              {[
                { value: color1, set: pick(setColor1), label: 'From' },
                { value: color2, set: pick(setColor2), label: 'To' },
              ].map((stop) => (
                <div className={styles.colorRow} key={stop.label}>
                  <div className={styles.colorPreview} style={{ background: stop.value }}>
                    <input
                      type="color"
                      value={stop.value}
                      onChange={(e) => stop.set(e.target.value)}
                      className={styles.colorInput}
                      aria-label={`${stop.label} colour`}
                    />
                  </div>
                  <div className={styles.hexInput}>
                    <span className={styles.hexLabel}>{stop.label}</span>
                    <HexColorInput color={stop.value} onChange={stop.set} prefixed />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.controlGroup}>
            <div className={styles.angleControl}>
              <span className="eyebrow">Angle</span>
              <span className={styles.angleValue}>{angle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className={styles.angleSlider}
              aria-label="Gradient angle"
            />
          </div>

          <div className={styles.actions}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRandomize}
              className={styles.btn}
            >
              <Shuffle /> Shuffle
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className={styles.btn}
            >
              {copied ? <Check /> : <Copy />}
              {copied ? 'Copied' : 'Copy CSS'}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleDownload}
              className={`${styles.btn} ${styles.primaryBtn}`}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <DotmSquare2 size={14} dotSize={2} ariaLabel="Exporting" /> Exporting
                </>
              ) : (
                <>
                  <Download /> Download
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.presets}>
        <div className={styles.presetHead}>
          <span className="eyebrow">Presets</span>
          <div className={styles.buckets}>
            <Badge
              asChild
              variant={bucket === 'all' ? 'default' : 'outline'}
              className={styles.bucket}
            >
              <button type="button" onClick={() => setBucket('all')}>
                All
              </button>
            </Badge>
            {gradientBuckets.map((b) => (
              <Badge
                key={b}
                asChild
                variant={bucket === b ? 'default' : 'outline'}
                className={styles.bucket}
              >
                <button type="button" onClick={() => setBucket(b)}>
                  {b}
                </button>
              </Badge>
            ))}
          </div>
        </div>
        <div className={styles.presetGrid}>
          {presets.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`${styles.preset} ${presetId === g.id ? styles.presetActive : ''}`}
              onClick={() => applyPreset(g)}
              title={`${g.name} · ${g.from} → ${g.to}`}
            >
              <span className={styles.presetSwatch} style={{ background: g.css }} />
              <span className={styles.presetName}>{g.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
