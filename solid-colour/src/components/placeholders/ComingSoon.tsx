import { motion } from 'framer-motion';

interface ComingSoonProps {
  title: string;
  icon: string;
  description: string;
}

export const ComingSoon = ({ title, icon, description }: ComingSoonProps) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '40px 24px',
        color: 'var(--text-tertiary)',
      }}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
        style={{
          width: '52px',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          marginBottom: '16px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: '12px',
        }}
      >
        {icon}
      </motion.div>
      <motion.h2
        initial={{ y: 6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.06 }}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
          marginBottom: '6px',
        }}
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ y: 6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12 }}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13.5px',
          color: 'var(--text-secondary)',
          maxWidth: '380px',
          lineHeight: 1.5,
        }}
      >
        {description}
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          marginTop: '20px',
          padding: '2px 8px',
          background: 'var(--accent-blue-bg)',
          border: '1px solid var(--accent-blue-border)',
          borderRadius: '9999px',
          fontFamily: 'var(--font-sans)',
          fontSize: '10.5px',
          fontWeight: 500,
          color: 'var(--accent-blue)',
          letterSpacing: '0.02em',
        }}
      >
        Coming soon
      </motion.div>
    </div>
  );
};
