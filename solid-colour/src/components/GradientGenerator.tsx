import { useState } from 'react';
import { motion } from 'framer-motion';
import { HexColorInput } from 'react-colorful';
import { useAppStore } from '../store/appStore';
import { generateAndDownload } from '../utils/imageGenerator';
import styles from './GradientGenerator.module.css';
import { Copy, Download, RefreshCw } from 'lucide-react';

export const GradientGenerator = () => {
    const {
        selectedResolution,
        selectedFormat,
        useCustomSize,
        customWidth,
        customHeight,
        addRecentColor
    } = useAppStore();

    const [color1, setColor1] = useState('#FF512F');
    const [color2, setColor2] = useState('#DD2476');
    const [angle, setAngle] = useState(45);
    const [isDownloading, setIsDownloading] = useState(false);

    const gradientCSS = `linear-gradient(${angle}deg, ${color1}, ${color2})`;

    const handleRandomize = () => {
        const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        setColor1(randomColor().toUpperCase());
        setColor2(randomColor().toUpperCase());
        setAngle(Math.floor(Math.random() * 360));
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(`background: ${gradientCSS};`);
            // Could add toast here
        } catch (err) {
            console.error('Failed to copy', err);
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

            // Add colors to recent
            addRecentColor(color1);
            addRecentColor(color2);
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <section className={styles.container}>
            <div className={styles.header}>
                <motion.h2
                    className={styles.title}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Gradient Generator
                </motion.h2>
                <motion.p
                    className={styles.subtitle}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    Create beautiful, smooth gradients for your next project.
                </motion.p>
            </div>

            <div className={styles.workspace}>
                <motion.div
                    className={styles.controls}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className={styles.controlGroup}>
                        <label className={styles.label}>Colors</label>
                        <div className={styles.colorInputs}>
                            <div className={styles.colorRow}>
                                <div className={styles.colorPreview} style={{ background: color1 }}>
                                    <input
                                        type="color"
                                        value={color1}
                                        onChange={(e) => setColor1(e.target.value.toUpperCase())}
                                        className={styles.colorInput}
                                    />
                                </div>
                                <div className={styles.hexInput}>
                                    <HexColorInput color={color1} onChange={setColor1} prefixed />
                                </div>
                            </div>

                            <div className={styles.colorRow}>
                                <div className={styles.colorPreview} style={{ background: color2 }}>
                                    <input
                                        type="color"
                                        value={color2}
                                        onChange={(e) => setColor2(e.target.value.toUpperCase())}
                                        className={styles.colorInput}
                                    />
                                </div>
                                <div className={styles.hexInput}>
                                    <HexColorInput color={color2} onChange={setColor2} prefixed />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.controlGroup}>
                        <div className={styles.angleControl}>
                            <label className={styles.label}>Angle</label>
                            <span className={styles.angleValue}>{angle}°</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="360"
                            value={angle}
                            onChange={(e) => setAngle(Number(e.target.value))}
                            className={styles.angleSlider}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button onClick={handleRandomize} className={`${styles.actionBtn} ${styles.secondaryBtn}`}>
                            <RefreshCw size={18} /> Randomize
                        </button>
                        <button onClick={handleCopy} className={`${styles.actionBtn} ${styles.secondaryBtn}`}>
                            <Copy size={18} /> Copy CSS
                        </button>
                        <button onClick={handleDownload} className={`${styles.actionBtn} ${styles.primaryBtn}`}>
                            {isDownloading ? 'Exporting...' : <><Download size={18} /> Download Image</>}
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    className={styles.preview}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div
                        className={styles.previewGradient}
                        style={{ background: gradientCSS }}
                    />
                </motion.div>
            </div>
        </section>
    );
};
