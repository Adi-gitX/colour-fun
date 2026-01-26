import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import styles from './Toast.module.css';

export const ToastContainer = () => {
    const { toasts, removeToast } = useAppStore();

    return (
        <div className={styles.container}>
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className={`${styles.toast} ${styles[toast.type || 'success']}`}
                    >
                        <div className={styles.icon}>
                            {toast.type === 'error' ? <AlertCircle size={18} /> :
                                toast.type === 'info' ? <Info size={18} /> :
                                    <CheckCircle size={18} />}
                        </div>
                        <p className={styles.message}>{toast.message}</p>
                        <button
                            className={styles.closeBtn}
                            onClick={() => removeToast(toast.id)}
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
