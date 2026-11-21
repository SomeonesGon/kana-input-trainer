import { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

/** Data describing a single background particle. */
interface Particle {
  id: number;
  /** Horizontal position as a percentage of the viewport width. */
  left: number;
  /** Vertical position as a percentage of the viewport height (stars only). */
  top: number;
  /** Font size in rem. */
  size: number;
  /** Animation delay in seconds so particles start at staggered times. */
  delay: number;
  /** Full animation cycle duration in seconds. */
  duration: number;
  /** Peak opacity reached mid-animation. */
  opacity: number;
}

const HEART_COUNT = 18;
const STAR_COUNT  = 38;

/** Returns a random float between min (inclusive) and max (exclusive). */
function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function makeHearts(): Particle[] {
  return Array.from({ length: HEART_COUNT }, (_, i) => ({
    id: i,
    left:     rand(2, 98),
    top:      0, // hearts start from the bottom via CSS, top unused
    size:     rand(0.9, 2.3),
    delay:    rand(0, 14),
    duration: rand(9, 18),
    opacity:  rand(0.35, 0.72),
  }));
}

function makeStars(): Particle[] {
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    id: i,
    left:     rand(1, 99),
    top:      rand(2, 92),
    size:     rand(0.45, 1.5),
    delay:    rand(0, 7),
    duration: rand(2, 6),
    opacity:  rand(0.35, 0.90),
  }));
}

/**
 * BackgroundParticles
 *
 * Renders decorative animated particles behind the page content:
 * - Pink mode → ♥ hearts that float upward and fade.
 * - Dark mode  → ★ stars that twinkle in place.
 * - Light mode → nothing rendered.
 *
 * Mounted client-side only to avoid hydration mismatches (Math.random values).
 * Pointer-events are disabled so it never interferes with interaction.
 */
export default function BackgroundParticles() {
  const { theme } = useTheme();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted]     = useState(false);

  // Mark as mounted so we only render on the client
  useEffect(() => { setMounted(true); }, []);

  // Re-generate particles whenever the active theme changes
  useEffect(() => {
    if (!mounted) return;
    if (theme === 'pink')  setParticles(makeHearts());
    else if (theme === 'dark') setParticles(makeStars());
    else setParticles([]);
  }, [theme, mounted]);

  if (!mounted || particles.length === 0) return null;

  return (
    <div className="bg-particles" aria-hidden="true">
      {particles.map((p) =>
        theme === 'pink' ? (
          <span
            key={p.id}
            className="bg-particle bg-particle--heart"
            style={{
              left:              `${p.left}%`,
              fontSize:          `${p.size}rem`,
              animationDelay:    `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              '--particle-opacity': p.opacity,
            } as React.CSSProperties}
          >
            ♥
          </span>
        ) : (
          <span
            key={p.id}
            className="bg-particle bg-particle--star"
            style={{
              left:              `${p.left}%`,
              top:               `${p.top}%`,
              fontSize:          `${p.size}rem`,
              animationDelay:    `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              '--particle-opacity': p.opacity,
            } as React.CSSProperties}
          >
            ★
          </span>
        )
      )}
    </div>
  );
}
