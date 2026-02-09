import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { generateAndDownload, aspectRatios, estimateFileSize } from '../utils/imageGenerator';
import { getContrastColor } from '../utils/colorUtils';
import styles from './DownloadModal.module.css';

const ratioButtons = ['16:9', '9:16', '1:1', '4:3', '3:2', '21:9', '4:5', '3:4'];
const formatButtons: Array<'png' | 'jpeg' | 'webp'> = ['png', 'jpeg', 'webp'];

export const DownloadModal = () => {
    const {
        selectedColor,
        isDownloadModalOpen,
        closeDownloadModal,
        selectedRatio,
        setSelectedRatio,
        selectedResolution,
        setSelectedResolution,
        selectedFormat,
        setSelectedFormat,
        useCustomSize,
        setUseCustomSize,
        customWidth,
        customHeight,
        setCustomWidth,
        setCustomHeight,
        addRecentColor,
    } = useAppStore();

    const [isDownloading, setIsDownloading] = useState(false);

    const currentAspectRatio = aspectRatios.find((ar) => ar.ratio === selectedRatio);
    const presets = currentAspectRatio?.presets || [];

    const finalWidth = useCustomSize ? customWidth : selectedResolution.width;
    const finalHeight = useCustomSize ? customHeight : selectedResolution.height;

    const handleRatioChange = useCallback(
        (ratio: string) => {
            setSelectedRatio(ratio);
            const ar = aspectRatios.find((a) => a.ratio === ratio);
            if (ar && ar.presets.length > 0) {
                // Select 4K by default, or the highest available
                const preset4k = ar.presets.find((p) => p.label.includes('4K'));
                const defaultPreset = preset4k || ar.presets[ar.presets.length - 1];
                setSelectedResolution({ width: defaultPreset.width, height: defaultPreset.height });
            }
        },
        [setSelectedRatio, setSelectedResolution]
    );

    const handleDownload = async () => {
        if (!selectedColor) return;

        setIsDownloading(true);
        try {
            await generateAndDownload({
                color: selectedColor.hex,
                width: finalWidth,
                height: finalHeight,
                format: selectedFormat,
                quality: 1.0,
                filename: `${selectedColor.name.replace(/\s+/g, '_')}_${finalWidth}x${finalHeight}.${selectedFormat}`,
            });
            addRecentColor(selectedColor.hex);
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    if (!selectedColor) return null;

    const textColor = getContrastColor(selectedColor.hex);

    return (
        <AnimatePresence>
            {isDownloadModalOpen && (
                <div className={styles.modal}>
                    <motion.div
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeDownloadModal}
                    />
                    <motion.div
                        className={styles.content}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', duration: 0.4 }}
                    >
                        <button className={styles.closeBtn} onClick={closeDownloadModal}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>

                        <div className={styles.preview} style={{ backgroundColor: selectedColor.hex }}>
                            <div className={styles.previewInfo} style={{ color: textColor }}>
                                <span className={styles.previewName}>{selectedColor.name}</span>
                                <span className={styles.previewHex}>{selectedColor.hex}</span>
                            </div>
                        </div>

                        <div className={styles.options}>
                            <div className={styles.optionGroup}>
                                <label className={styles.label}>Aspect Ratio</label>
                                <div className={styles.ratioGrid}>
                                    {ratioButtons.map((ratio) => (
                                        <button
                                            key={ratio}
                                            className={`${styles.ratioBtn} ${selectedRatio === ratio ? styles.active : ''}`}
                                            onClick={() => handleRatioChange(ratio)}
                                        >
                                            {ratio}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.optionGroup}>
                                <label className={styles.label}>Resolution</label>
                                <select
                                    className={styles.select}
                                    value={`${selectedResolution.width}x${selectedResolution.height}`}
                                    onChange={(e) => {
                                        const [w, h] = e.target.value.split('x').map(Number);
                                        setSelectedResolution({ width: w, height: h });
                                    }}
                                    disabled={useCustomSize}
                                >
                                    {presets.map((preset) => (
                                        <option key={preset.label} value={`${preset.width}x${preset.height}`}>
                                            {preset.label} ({preset.width}×{preset.height})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.optionGroup}>
                                <label className={styles.label}>Format</label>
                                <div className={styles.formatGrid}>
                                    {formatButtons.map((format) => (
                                        <button
                                            key={format}
                                            className={`${styles.formatBtn} ${selectedFormat === format ? styles.active : ''}`}
                                            onClick={() => setSelectedFormat(format)}
                                        >
                                            {format.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.optionGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={useCustomSize}
                                        onChange={(e) => setUseCustomSize(e.target.checked)}
                                    />
                                    <span>Custom Size</span>
                                </label>
                                {useCustomSize && (
                                    <div className={styles.customSizeInputs}>
                                        <div className={styles.sizeInput}>
                                            <label>Width</label>
                                            <input
                                                type="number"
                                                value={customWidth}
                                                onChange={(e) => setCustomWidth(Math.min(8192, Math.max(100, parseInt(e.target.value) || 100)))}
                                                min={100}
                                                max={8192}
                                            />
                                        </div>
                                        <span className={styles.sizeDivider}>×</span>
                                        <div className={styles.sizeInput}>
                                            <label>Height</label>
                                            <input
                                                type="number"
                                                value={customHeight}
                                                onChange={(e) => setCustomHeight(Math.min(8192, Math.max(100, parseInt(e.target.value) || 100)))}
                                                min={100}
                                                max={8192}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <div className={styles.downloadInfo}>
                                <span className={styles.downloadSize}>{finalWidth} × {finalHeight} px</span>
                                <span className={styles.downloadEst}>
                                    ~{estimateFileSize(finalWidth, finalHeight, selectedFormat)}
                                </span>
                            </div>
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
                                <span>{isDownloading ? 'Generating...' : 'Download'}</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
