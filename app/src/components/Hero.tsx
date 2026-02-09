import { motion, useScroll, useTransform } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import styles from './Hero.module.css';

export const Hero = () => {
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 500], [0, 150]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);
    const { openPicker } = useAppStore();

    return (
        <section className={styles.hero}>
            <motion.div
                className={styles.content}
                style={{ y, opacity }}
            >
                <motion.div
                    className={styles.badge}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className={styles.pulse} />
                    v1.0 Now Available
                </motion.div>

                <motion.h1
                    className={styles.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.2, 0.65, 0.3, 0.9] }}
                >
                    <span className={styles.line}>Download</span>
                    <span className={styles.gradientText}>Perfect Colors</span>
                    <span className={styles.line}>For Every Screen</span>
                </motion.h1>

                <motion.p
                    className={styles.subtitle}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    The most complete solid background collection. <b>8K resolution</b>,
                    custom hex picker, and instant export for any device.
                </motion.p>

                <motion.div
                    className={styles.actions}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <button
                        className={styles.primaryBtn}
                        onClick={() => document.getElementById('grid-start')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Browse Colors
                    </button>
                    <button
                        className={styles.secondaryBtn}
                        onClick={openPicker}
                    >
                        Create Custom
                    </button>
                </motion.div>

                <motion.div
                    className={styles.stats}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                >
                    <div className={styles.statItem}>
                        <span className={styles.statVal}>238+</span>
                        <span className={styles.statLabel}>Colors</span>
                    </div>
                    <div className={styles.statDivider} />
                    <div className={styles.statItem}>
                        <span className={styles.statVal}>8K</span>
                        <span className={styles.statLabel}>Support</span>
                    </div>
                    <div className={styles.statDivider} />
                    <div className={styles.statItem}>
                        <span className={styles.statVal}>Free</span>
                        <span className={styles.statLabel}>Forever</span>
                    </div>
                </motion.div>
            </motion.div>

            <div id="grid-start" />
        </section>
    );
};
