import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowRight, Mail } from 'lucide-react';

interface RoadmapItem {
  /** Short milestone name (e.g. "v1.1 · in progress"). */
  label: string;
  /** What's in scope for that milestone. */
  description: string;
}

interface ComingSoonProps {
  title: string;
  icon: string;
  description: string;
  /** Optional in-scope bullet list rendered above the roadmap. */
  scope?: string[];
  /** Optional roadmap milestones — what ships when. */
  roadmap?: RoadmapItem[];
  /** Optional mailto address — a "Notify me" capture rendered as a real
   *  mailto: form so the user's mail client opens with a pre-filled subject. */
  mailto?: string;
}

export const ComingSoon = ({
  title,
  icon,
  description,
  scope,
  roadmap,
  mailto,
}: ComingSoonProps) => {
  const [submitted, setSubmitted] = useState(false);
  const isRichLayout = (scope && scope.length > 0) || (roadmap && roadmap.length > 0) || mailto;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: isRichLayout ? 'auto' : '60vh',
        textAlign: 'center',
        padding: isRichLayout ? '64px 24px 80px' : '40px 24px',
        maxWidth: '720px',
        margin: '0 auto',
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
          fontSize: '22px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.018em',
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
          fontSize: '14px',
          color: 'var(--text-secondary)',
          maxWidth: '480px',
          lineHeight: 1.55,
          margin: '0 0 20px',
        }}
      >
        {description}
      </motion.p>

      {scope && scope.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          style={{
            width: '100%',
            maxWidth: '480px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: roadmap || mailto ? '14px' : '20px',
            textAlign: 'left',
          }}
        >
          <h3
            style={{
              margin: '0 0 10px',
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-tertiary)',
            }}
          >
            What's in scope
          </h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {scope.map((item, i) => (
              <li
                key={i}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  color: 'var(--text-secondary)',
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {roadmap && roadmap.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          style={{
            width: '100%',
            maxWidth: '480px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: mailto ? '14px' : '20px',
            textAlign: 'left',
          }}
        >
          <h3
            style={{
              margin: '0 0 10px',
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-tertiary)',
            }}
          >
            Roadmap
          </h3>
          <ol
            style={{
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              listStyle: 'none',
            }}
          >
            {roadmap.map((item, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span
                  style={{
                    flex: 'none',
                    width: '6px',
                    height: '6px',
                    marginTop: '8px',
                    borderRadius: '50%',
                    background: 'var(--text-tertiary)',
                  }}
                />
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12.5px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.005em',
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12.5px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.45,
                      marginTop: '2px',
                    }}
                  >
                    {item.description}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </motion.div>
      )}

      {mailto && (
        <motion.a
          href={`mailto:${mailto}?subject=${encodeURIComponent(`Notify me — ${title}`)}&body=${encodeURIComponent(`I'd like to be notified when Atlas's ${title} ships.`)}`}
          onClick={() => setSubmitted(true)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            background: 'var(--text-primary)',
            color: 'var(--bg-primary)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-sans)',
            fontSize: '12.5px',
            fontWeight: 500,
            textDecoration: 'none',
            marginTop: '4px',
          }}
        >
          {submitted ? (
            <>
              <Mail size={13} strokeWidth={2} />
              Email opened — drop me a note
            </>
          ) : (
            <>
              Notify me when it ships
              <ArrowRight size={13} strokeWidth={2} />
            </>
          )}
        </motion.a>
      )}

      {!isRichLayout && (
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
      )}
    </div>
  );
};
