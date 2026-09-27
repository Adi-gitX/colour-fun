import styles from './DotMark.module.css';

/**
 * The Garden mark: a 5×5 dot matrix with the letter G lit. `animate` runs a slow sweep across
 * the lit dots, used on the home hero and as a loading pulse; the static version is the logo.
 */
const G = [
  [0, 1, 1, 1, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 1, 1, 0],
  [1, 0, 0, 1, 0],
  [0, 1, 1, 1, 0],
];

interface Props {
  size?: number;
  animate?: boolean;
  /** Renders inside a rounded tile like an app icon. */
  tile?: boolean;
  className?: string;
  title?: string;
}

export function DotMark({
  size = 28,
  animate = false,
  tile = false,
  className = '',
  title = 'Garden',
}: Props) {
  const gap = size / 5;
  const r = gap * 0.34;
  return (
    <span
      className={`${styles.mark} ${tile ? styles.tile : ''} ${animate ? styles.animate : ''} ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={title}
    >
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden>
        {G.flatMap((row, y) =>
          row.map((on, x) => (
            <circle
              key={`${x}-${y}`}
              cx={gap * x + gap / 2}
              cy={gap * y + gap / 2}
              r={r}
              className={on ? styles.on : styles.off}
              style={{ animationDelay: `${(x + y) * 70}ms` }}
            />
          ))
        )}
      </svg>
    </span>
  );
}
