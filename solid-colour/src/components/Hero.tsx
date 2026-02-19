import { motion } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import styles from './Hero.module.css';
import { Search } from 'lucide-react';

export const Hero = () => {
    const { openPicker, setSearchQuery, searchQuery } = useAppStore();

    return (
        <section className={styles.hero}>
            <motion.div
                className={styles.content}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
                <h1 className={styles.title}>
                    Find your perfect color.
                </h1>

                <p className={styles.subtitle}>
                    Premium solid backgrounds for digital creators.
                </p>

                <div className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search by name, hex, or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                    <div className={styles.shortcut}>⌘K</div>
                </div>

                <div className={styles.actions}>
                    <button onClick={openPicker} className={styles.textLink}>
                        Open Generator <span className={styles.arrow}>→</span>
                    </button>
                </div>
            </motion.div>
        </section>
    );
};
