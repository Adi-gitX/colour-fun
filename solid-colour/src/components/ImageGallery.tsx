import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { imageUrls } from '../data/images';
import styles from './ImageGallery.module.css';

export const ImageGallery = () => {
  const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (previewIndex !== null) {
      setImageLoading(true);
    }
  }, [previewIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (previewIndex === null) return;
      if (e.key === 'ArrowRight') {
        setPreviewIndex((prev) => (prev !== null && prev < imageUrls.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft') {
        setPreviewIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Escape') {
        setPreviewIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewIndex]);

  const handleDownload = async (url: string, index: number) => {
    setDownloadingUrl(url);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok.');
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `lummi-background-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Failed to download image:', error);
      alert(
        'Failed to download image. The server might be blocking direct downloads from the browser. Please right-click the image and save.'
      );
    } finally {
      setDownloadingUrl(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Curated Backgrounds
        </motion.h2>
        <p className={styles.subtitle}>
          Premium high-resolution images powered by Lummi. Optimization powered by Imgix.
        </p>
      </div>

      <div className={styles.grid}>
        {imageUrls.map((url, index) => (
          <motion.div
            key={index}
            className={styles.card}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.min(index * 0.05, 0.5) }}
          >
            {/* Load 400px max width optimized webp via Imgix query args */}
            <img
              src={`${url}?w=400&fm=webp&q=80`}
              alt={`Curated Background ${index + 1}`}
              loading="lazy"
              className={styles.image}
            />
            <div className={styles.overlay} onClick={(e) => {
              e.stopPropagation();
              setPreviewIndex(index);
            }}>
              <button
                className={styles.downloadBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(url, index);
                }}
                disabled={downloadingUrl === url}
                aria-label={`Download high-res version of background ${index + 1}`}
              >
                {downloadingUrl === url ? (
                  <span className={styles.spinner} />
                ) : (
                  <>
                    <Download size={20} strokeWidth={2} />
                    <span>Download HD</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {previewIndex !== null && (
          <motion.div
            className={styles.previewModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.previewBackdrop} onClick={() => setPreviewIndex(null)} />

            <button
              className={styles.navBtnLeft}
              onClick={(e) => { e.stopPropagation(); setPreviewIndex(previewIndex > 0 ? previewIndex - 1 : previewIndex); }}
              disabled={previewIndex === 0}
            >
              <ChevronLeft size={32} />
            </button>
            <button
              className={styles.navBtnRight}
              onClick={(e) => { e.stopPropagation(); setPreviewIndex(previewIndex < imageUrls.length - 1 ? previewIndex + 1 : previewIndex); }}
              disabled={previewIndex === imageUrls.length - 1}
            >
              <ChevronRight size={32} />
            </button>

            <motion.div
              className={styles.previewContent}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <button className={styles.closeBtn} onClick={() => setPreviewIndex(null)}>
                <X size={24} />
              </button>

              {imageLoading && (
                <div className={styles.imageLoader}>
                  <span className={styles.spinnerLg} />
                </div>
              )}

              <img
                src={`${imageUrls[previewIndex]}?fm=webp&q=100`}
                alt="High Quality Preview"
                className={`${styles.previewImageFull} ${imageLoading ? styles.hidden : ''}`}
                onLoad={() => setImageLoading(false)}
              />
              <div className={styles.previewActions}>
                <button
                  className={styles.downloadBtnFull}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(imageUrls[previewIndex], previewIndex);
                  }}
                  disabled={downloadingUrl === imageUrls[previewIndex]}
                >
                  {downloadingUrl === imageUrls[previewIndex] ? (
                    <span className={styles.spinner} />
                  ) : (
                    <>
                      <Download size={20} /> Download High-Res
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
