import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shuffle, Copy, Download, ArrowUpRight } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import styles from './GradientGenerator.module.css';

const getRandomHex = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export const GradientGenerator = () => {
    const { showToast } = useAppStore();
    const [color1, setColor1] = useState('#FF6B6B');
    const [color2, setColor2] = useState('#4ECDC4');
    const [degree, setDegree] = useState(135);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const gradientStyle = {
        background: `linear-gradient(${degree}deg, ${color1}, ${color2})`,
    };

    const handleRandomize = () => {
        setColor1(getRandomHex());
        setColor2(getRandomHex());
        setDegree(Math.floor(Math.random() * 360));
    };

    const handleCopyCSS = () => {
        const css = `background: linear-gradient(${degree}deg, ${color1}, ${color2});`;
        navigator.clipboard.writeText(css);
        showToast('CSS copied to clipboard!', 'success');
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 3840;
        canvas.height = 2160;

        // Calculate vector for gradient direction (rough approx for linear gradient angle)
        // For simplicity efficiently mapping current angle to canvas coordinates is complex, 
        // so we'll use a diagonal fallback or simple linear interpolation logic if needed.
        // However, createLinearGradient takes coords. 
        // Let's simplified it: standard diagonal 135deg is mostly top-left to bottom-right.
        // For true angle support we need proper trig.

        const rad = (degree * Math.PI) / 180;
        const x1 = canvas.width / 2 - Math.cos(rad) * canvas.width / 2;
        const y1 = canvas.height / 2 + Math.sin(rad) * canvas.height / 2;
        const x2 = canvas.width / 2 + Math.cos(rad) * canvas.width / 2;
        const y2 = canvas.height / 2 - Math.sin(rad) * canvas.height / 2;

        const grd = ctx.createLinearGradient(x1, y1, x2, y2);
        grd.addColorStop(0, color1);
        grd.addColorStop(1, color2);

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const link = document.createElement('a');
        link.download = `gradient-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('Gradient downloaded successfully!', 'success');
    };

    return (
        <div className={styles.container}>
            <motion.div
                className={styles.preview}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className={styles.gradientDisplay} style={gradientStyle}>
                    <div className={styles.controlsOverlay}>
                        <button className={styles.actionBtn} onClick={handleRandomize} title="Randomize">
                            <Shuffle size={20} />
                        </button>
                        <button className={styles.actionBtn} onClick={handleCopyCSS} title="Copy CSS">
                            <Copy size={20} />
                        </button>
                        <button className={styles.actionBtn} onClick={handleDownload} title="Download 4K">
                            <Download size={20} />
                        </button>
                    </div>
                </div>
            </motion.div>

            <div className={styles.controls}>
                <div className={styles.colorInputs}>
                    <div className={styles.inputGroup}>
                        <label>Color 1</label>
                        <div className={styles.colorPickerWrapper}>
                            <input
                                type="color"
                                value={color1}
                                onChange={(e) => setColor1(e.target.value)}
                                className={styles.colorInput}
                            />
                            <span className={styles.colorHex}>{color1}</span>
                        </div>
                    </div>

                    <div className={styles.swapBtn} onClick={() => {
                        const temp = color1;
                        setColor1(color2);
                        setColor2(temp);
                    }}>
                        <ArrowUpRight size={20} />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Color 2</label>
                        <div className={styles.colorPickerWrapper}>
                            <input
                                type="color"
                                value={color2}
                                onChange={(e) => setColor2(e.target.value)}
                                className={styles.colorInput}
                            />
                            <span className={styles.colorHex}>{color2}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.angleControl}>
                    <label>Angle: {degree}°</label>
                    <input
                        type="range"
                        min="0"
                        max="360"
                        value={degree}
                        onChange={(e) => setDegree(Number(e.target.value))}
                        className={styles.rangeInput}
                    />
                </div>
            </div>

            {/* Hidden canvas for export */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};
