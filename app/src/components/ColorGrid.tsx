import { useMemo, useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { colors, getColorsByCategory, searchColors } from '../data/colors';
import type { Color } from '../data/colors';
import { getContrastColor } from '../utils/colorUtils';
import styles from './ColorGrid.module.css';

const ColorCard = ({ color, index }: { color: Color; index: number }) => {
    const { openDownloadModal, favorites, toggleFavorite } = useAppStore();
    const textColor = getContrastColor(color.hex);
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });
    const isFav = favorites.includes(color.hex);

    return (
        <motion.div
            ref={ref}
            className={styles.card}
            style={{ backgroundColor: color.hex }}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{
                duration: 0.4,
                delay: (index % 20) * 0.02,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            whileHover={{
                scale: 1.03,
                y: -5,
                transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openDownloadModal(color)}
        >
            <div className={styles.cardGlow} style={{ background: color.hex }} />

            <motion.button
                className={styles.favBtn}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: isFav ? 1 : 0, scale: isFav ? 1 : 0 }}
                whileHover={{ opacity: 1, scale: 1.1 }}
                onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(color.hex);
                }}
            >
                <svg viewBox="0 0 24 24" fill={isFav ? "white" : "none"} stroke="white" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
            </motion.button>

            <div className={styles.cardContent}>
                <span className={styles.colorName} style={{ color: textColor }}>{color.name}</span>
                <span className={styles.colorHex} style={{ color: textColor }}>{color.hex}</span>
            </div>
        </motion.div>
    );
};

export const ColorGrid = () => {
    const { searchQuery, selectedCategory } = useAppStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start']
    });

    const opacity = useTransform(scrollYProgress, [0, 0.2], [0.5, 1]);

    const filteredColors = useMemo(() => {
        let result: Color[] = colors;

        if (selectedCategory !== 'all') {
            result = getColorsByCategory(selectedCategory);
        }

        if (searchQuery.trim()) {
            const searched = searchColors(searchQuery);
            result = result.filter((c) => searched.some((s) => s.id === c.id));
        }

        return result;
    }, [searchQuery, selectedCategory]);

    if (filteredColors.length === 0) {
        return (
            <motion.div
                className={styles.empty}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <motion.div
                    className={styles.emptyIcon}
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    🎨
                </motion.div>
                <h3>No colors found</h3>
                <p>Try adjusting your search or use the custom color picker</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            ref={containerRef}
            className={styles.gridWrapper}
            style={{ opacity }}
        >
            <div className={styles.gridHeader}>
                <motion.h2
                    className={styles.gridTitle}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    {selectedCategory === 'all' ? 'All Colors' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                </motion.h2>
                <span className={styles.gridCount}>{filteredColors.length} colors</span>
            </div>
            <div className={styles.grid}>
                {filteredColors.map((color, index) => (
                    <ColorCard key={color.id} color={color} index={index} />
                ))}
            </div>
        </motion.div>
    );
};
