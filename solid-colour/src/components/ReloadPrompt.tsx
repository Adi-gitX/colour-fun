import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ReloadPrompt.module.css';

export const ReloadPrompt = () => {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r: ServiceWorkerRegistration | undefined) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error: Error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    return (
        <AnimatePresence>
            {(offlineReady || needRefresh) && (
                <motion.div
                    className={styles.prompt}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                >
                    <div className={styles.message}>
                        {offlineReady ? (
                            <span>App ready to work offline</span>
                        ) : (
                            <span>New content available, click on reload button to update.</span>
                        )}
                    </div>
                    {needRefresh && (
                        <button className={styles.reloadBtn} onClick={() => updateServiceWorker(true)}>
                            Reload
                        </button>
                    )}
                    <button className={styles.closeBtn} onClick={close}>
                        Close
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
