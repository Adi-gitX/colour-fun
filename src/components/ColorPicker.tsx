import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { useAppStore } from '../store/appStore';
import { hexToRgb, rgbToHex, isValidHex } from '../utils/colorUtils';
import { generateAndDownload } from '../utils/imageGenerator';
import styles from './ColorPicker.module.css';

export const ColorPicker = () => {
    const {
        isPickerOpen,
        closePicker,
        customColor,
        setCustomColor,
        recentColors,
        addRecentColor,
        selectedRatio,
        selectedResolution,
        selectedFormat,
        useCustomSize,
        customWidth,
        customHeight,
    } = useAppStore();

    const [isDownloading, setIsDownloading] = useState(false);

    const rgb = hexToRgb(customColor);

    const handleRgbChange = useCallback(
        (channel: 'r' | 'g' | 'b', value: number) => {
            if (!rgb) return;
            const newRgb = { ...rgb, [channel]: Math.min(255, Math.max(0, value)) };
            setCustomColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
        },
        [rgb, setCustomColor]
    );

    const handleDownload = async () => {
        if (!isValidHex(customColor)) return;

        setIsDownloading(true);
        try {
            const finalWidth = useCustomSize ? customWidth : selectedResolution.width;
            const finalHeight = useCustomSize ? customHeight : selectedResolution.height;

            await generateAndDownload({
                color: customColor,
                width: finalWidth,
                height: finalHeight,
                format: selectedFormat,
                quality: 1.0,
                filename: `Custom_${customColor.replace('#', '')}_${finalWidth}x${finalHeight}.${selectedFormat}`,
            });
            addRecentColor(customColor);
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <AnimatePresence>
            {isPickerOpen && (
                <div className={styles.modal}>
                    <motion.div
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closePicker}
                    />
                    <motion.div
                        className={styles.content}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', duration: 0.4 }}
                    >
                        <button className={styles.closeBtn} onClick={closePicker}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>

                        <h2 className={styles.title}>Pick Your Perfect Color</h2>

                        <div className={styles.pickerContainer}>
                            <div className={styles.colorPickerWrapper}>
                                <HexColorPicker color={customColor} onChange={setCustomColor} />
                            </div>

                            <div
                                className={styles.previewLarge}
                                style={{ backgroundColor: customColor }}
                            />

                            <div className={styles.inputs}>
                                <div className={styles.hexInput}>
                                    <label>HEX</label>
                                    <HexColorInput
                                        color={customColor}
                                        onChange={setCustomColor}
                                        prefixed
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.rgbInputs}>
                                    <div className={styles.rgbInput}>
                                        <label>R</label>
                                        <input
                                            type="number"
                                            value={rgb?.r || 0}
                                            onChange={(e) => handleRgbChange('r', parseInt(e.target.value) || 0)}
                                            min={0}
                                            max={255}
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.rgbInput}>
                                        <label>G</label>
                                        <input
                                            type="number"
                                            value={rgb?.g || 0}
                                            onChange={(e) => handleRgbChange('g', parseInt(e.target.value) || 0)}
                                            min={0}
                                            max={255}
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.rgbInput}>
                                        <label>B</label>
                                        <input
                                            type="number"
                                            value={rgb?.b || 0}
                                            onChange={(e) => handleRgbChange('b', parseInt(e.target.value) || 0)}
                                            min={0}
                                            max={255}
                                            className={styles.input}
                                        />
                                    </div>
                                </div>
                            </div>

                            {recentColors.length > 0 && (
                                <div className={styles.recentColors}>
                                    <label>Recent Colors</label>
                                    <div className={styles.recentGrid}>
                                        {recentColors.map((color, i) => (
                                            <button
                                                key={`${color}-${i}`}
                                                className={styles.recentColor}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setCustomColor(color)}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.actions}>
                            <button className={styles.cancelBtn} onClick={closePicker}>
                                Cancel
                            </button>
                            <button
                                className={styles.downloadBtn}
                                onClick={handleDownload}
                                disabled={isDownloading}
                            >
                                {isDownloading ? (
                                    <span className={styles.spinner} />
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                    </svg>
                                )}
                                <span>Download This Color</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
