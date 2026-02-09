import { motion, AnimatePresence } from 'framer-motion';
import {
    Palette,
    Sparkles,
    Image as ImageIcon,
    LayoutTemplate,
    Settings
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { categoryLabels, categoryColors } from '../data/colors';
import type { ColorCategory } from '../data/colors';
import styles from './Sidebar.module.css';
import { useState } from 'react';

const mainNavItems = [
    { id: 'solid-colors', label: 'Solid Colors', icon: Palette },
    { id: 'gradients', label: 'Gradients', icon: Sparkles },
    { id: 'images', label: 'Backgrounds', icon: ImageIcon },
    { id: 'ui-themes', label: 'UI Themes', icon: LayoutTemplate },
] as const;

export const Sidebar = () => {
    const {
        selectedCategory,
        setSelectedCategory,
        openPicker,
        customColor,
        currentSection,
        setCurrentSection,
        openSettings
    } = useAppStore();

    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.aside
            className={styles.sidebar}
            initial={{ width: 80 }}
            animate={{ width: isExpanded ? 280 : 80 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className={styles.logoContainer}>
                <div className={styles.logoIcon}>◆</div>
                <AnimatePresence>
                    {isExpanded && (
                        <motion.span
                            className={styles.logoText}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                        >
                            Colour&Fun
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <nav className={styles.nav}>
                <div className={styles.section}>
                    {mainNavItems.map((item) => (
                        <button
                            key={item.id}
                            className={`${styles.navItem} ${currentSection === item.id ? styles.active : ''}`}
                            onClick={() => setCurrentSection(item.id)}
                        >
                            <item.icon size={24} strokeWidth={1.5} />
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.span
                                        className={styles.navLabel}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            {currentSection === item.id && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className={styles.activeIndicator}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {currentSection === 'solid-colors' && (
                    <div className={styles.categoriesWrapper}>
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className={styles.categoriesHeader}
                                >
                                    FILTER
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className={styles.categoriesList}>
                            <button
                                className={`${styles.catItem} ${selectedCategory === 'all' ? styles.activeCat : ''}`}
                                onClick={() => setSelectedCategory('all')}
                                title="All Colors"
                            >
                                <div
                                    className={styles.catDot}
                                    style={{ background: 'linear-gradient(135deg, #fff, #999)' }}
                                />
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.span
                                            className={styles.catLabel}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            All Colors
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>

                            {(Object.keys(categoryLabels) as ColorCategory[]).map((cat) => (
                                <button
                                    key={cat}
                                    className={`${styles.catItem} ${selectedCategory === cat ? styles.activeCat : ''}`}
                                    onClick={() => setSelectedCategory(cat)}
                                    title={categoryLabels[cat]}
                                >
                                    <div
                                        className={styles.catDot}
                                        style={{ background: categoryColors[cat] }}
                                    />
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.span
                                                className={styles.catLabel}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                {categoryLabels[cat]}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            <div className={styles.footer}>
                <button className={styles.navItem} onClick={openPicker}>
                    <div
                        className={styles.pickerPreview}
                        style={{ background: customColor }}
                    />
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.span
                                className={styles.navLabel}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                            >
                                Custom
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>

                <button className={styles.navItem} onClick={openSettings}>
                    <Settings size={24} strokeWidth={1.5} />
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.span
                                className={styles.navLabel}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                            >
                                Settings
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.aside>
    );
};
