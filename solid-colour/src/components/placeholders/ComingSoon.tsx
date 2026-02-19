import { motion } from 'framer-motion';

interface ComingSoonProps {
    title: string;
    icon: string;
    description: string;
}

export const ComingSoon = ({ title, icon, description }: ComingSoonProps) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            padding: '40px',
            color: 'var(--text-secondary)'
        }}>
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{ fontSize: '64px', marginBottom: '24px' }}
            >
                {icon}
            </motion.div>
            <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ fontSize: '32px', color: 'var(--text-primary)', marginBottom: '16px' }}
            >
                {title}
            </motion.h2>
            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{ fontSize: '18px', maxWidth: '400px' }}
            >
                {description}
            </motion.p>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                    marginTop: '32px',
                    padding: '8px 16px',
                    background: 'var(--bg-card)',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--accent-primary)',
                    border: '1px solid var(--border-light)'
                }}
            >
                COMING SOON
            </motion.div>
        </div>
    );
};
