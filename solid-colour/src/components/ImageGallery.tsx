import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { imageUrls } from '../data/images';
import styles from './ImageGallery.module.css';

export const ImageGallery = () => {
  const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);

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
            <div className={styles.overlay}>
              <button
                className={styles.downloadBtn}
                onClick={() => handleDownload(url, index)}
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
    </div>
  );
};
