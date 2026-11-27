import { useEffect, useState, useCallback, useRef } from 'react';
import { useTheme, BackgroundId } from '@/hooks/useTheme';

/** Data describing a single ambient background particle. */
interface Particle {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  glyph?: string;
  streamText?: string;
  color?: string;
  subType?: 'deep' | 'twinkle' | 'hero';
}

/**
 * CelebType controls what visual form a celebration particle takes:
 *   streak   – diagonal shooting-star streak (stars / dark)
 *   rise     – particle floats straight upward from the bottom (hearts, sakura, embers, emerald, bloodmoon)
 *   fall     – glyph column falls top→bottom fast (matrix)
 *   burst    – radial starburst radiating from centre (gold, nebula, synthwave, arcade, clouds)
 */
type CelebType = 'streak' | 'rise' | 'fall' | 'burst';

/** Data describing a single particle in the celebratory level-up shower. */
interface ShowerStar {
  id: number;
  top: number;
  left: number;
  length: number;
  thickness: number;
  delay: number;
  duration: number;
  color: string;
  angle: number;      // used by streak & burst (burst: radial angle from centre)
  distance: number;
  celebType: CelebType;
  glyph?: string;     // used by rise / fall types
}

const HEART_COUNT = 34; // Multi-layered drifting hearts & sparkles
const STAR_COUNT = 68; // Layered celestial starfield
const CLOUD_COUNT = 18;
const EMBER_COUNT = 24;
const MATRIX_COUNT = 22;
const SYNTH_COUNT = 20;
const GOLD_COUNT = 24;
const SAKURA_COUNT = 24;
const ARCADE_COUNT = 22;
const NEBULA_COUNT = 26;
const EMERALD_COUNT = 24;
const BLOODMOON_COUNT = 24;

const SHOWER_STAR_COUNT = 38; // Heavy meteor shower on level-up

const MATRIX_GLYPHS = [
  '日', 'ﾊ', 'ﾐ', 'ﾋ', 'ｰ', 'ｳ', 'ｼ', 'ﾅ', 'ﾓ', 'ｸ', 'ﾘ',
  'ｱ', 'ｶ', 'ｻ', 'ﾀ', '龍', '電', '道', '気', '夢', '星',
];
const CLOUD_GLYPHS = ['+', '·', '°', '~', '·'];
const CYBER_GLYPHS = ['◆', '▲', '■', '::', '◆'];
const SYNTH_GLYPHS = ['◇', '△', '◇', '+'];
const GOLD_GLYPHS = ['+', '*', '·', '✦'];
const SAKURA_GLYPHS = ['·', '°', '•', '❀', '·'];
const ARCADE_GLYPHS = ['▲', '■', '●', '◆', '+', 'x'];
const NEBULA_GLYPHS = ['·', '⋆', '•', '+', '·'];
const EMERALD_GLYPHS = ['·', '°', '•', '𖡡', '᠅'];
const BLOODMOON_GLYPHS = ['◆', '▲', '·', '•', '◆'];

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

const HEART_DEEP_GLYPHS = ['♡', '·', '✧'];
const HEART_MID_GLYPHS = ['♡', '♥', '❥', '♡'];
const HEART_HERO_GLYPHS = ['♥', '♡', '✿'];
const HEART_COLORS = ['#ec4899', '#f472b6', '#db2777', '#fb7185', '#f43f5e'];

function makeHearts(): Particle[] {
  return Array.from({ length: HEART_COUNT }, (_, i) => {
    const roll = Math.random();
    let subType: 'deep' | 'twinkle' | 'hero' = 'twinkle';
    let glyph = HEART_MID_GLYPHS[i % HEART_MID_GLYPHS.length];
    let size = rand(1.05, 1.85);
    let duration = rand(10, 16);
    let opacity = rand(0.45, 0.78);
    let color = HEART_COLORS[i % HEART_COLORS.length];

    if (roll < 0.35) {
      subType = 'deep';
      glyph = HEART_DEEP_GLYPHS[i % HEART_DEEP_GLYPHS.length];
      size = rand(0.65, 1.1);
      duration = rand(14, 22);
      opacity = rand(0.22, 0.42);
      color = '#f9a8d4';
    } else if (roll > 0.85) {
      subType = 'hero';
      glyph = HEART_HERO_GLYPHS[i % HEART_HERO_GLYPHS.length];
      size = rand(1.85, 2.55);
      duration = rand(9, 14);
      opacity = rand(0.65, 0.9);
      color = '#db2777';
    }

    return {
      id: i,
      left: rand(2, 98),
      top: 0,
      size,
      delay: rand(0, 14),
      duration,
      opacity,
      glyph,
      color,
      subType,
    };
  });
}

const DEEP_STAR_GLYPHS = ['·', '•', '⋆'];
const TWINKLE_STAR_GLYPHS = ['✧', '✦', '⋆', '★'];
const HERO_STAR_GLYPHS = ['✦', '✧', '✷'];

const CELESTIAL_COLORS = [
  '#ffffff', // Diamond white
  '#e0f2fe', // Ice blue
  '#bae6fd', // Sky blue
  '#fef08a', // Stellar gold
  '#fef9c3', // Soft starlight
  '#e9d5ff', // Cosmic violet
];

function makeStars(): Particle[] {
  return Array.from({ length: STAR_COUNT }, (_, i) => {
    // 35% deep distant stars, 50% medium twinkling stars, 15% hero cross stars
    const roll = Math.random();
    let subType: 'deep' | 'twinkle' | 'hero' = 'twinkle';
    let glyph = TWINKLE_STAR_GLYPHS[Math.floor(Math.random() * TWINKLE_STAR_GLYPHS.length)];
    let size = rand(0.7, 1.25);
    let duration = rand(2.5, 6);
    let opacity = rand(0.55, 0.9);
    let color = CELESTIAL_COLORS[Math.floor(Math.random() * CELESTIAL_COLORS.length)];

    if (roll < 0.35) {
      subType = 'deep';
      glyph = DEEP_STAR_GLYPHS[Math.floor(Math.random() * DEEP_STAR_GLYPHS.length)];
      size = rand(0.35, 0.65);
      duration = rand(3, 7.5);
      opacity = rand(0.25, 0.55);
      color = '#cbd5e1';
    } else if (roll > 0.85) {
      subType = 'hero';
      glyph = HERO_STAR_GLYPHS[Math.floor(Math.random() * HERO_STAR_GLYPHS.length)];
      size = rand(1.2, 1.85);
      duration = rand(3.5, 8);
      opacity = rand(0.8, 1);
      color = Math.random() > 0.4 ? '#ffffff' : '#bae6fd';
    }

    return {
      id: i,
      left: rand(1, 99),
      top: rand(1, 95),
      size,
      delay: rand(0, 8),
      duration,
      opacity,
      glyph,
      color,
      subType,
    };
  });
}

function makeClouds(): Particle[] {
  return Array.from({ length: CLOUD_COUNT }, (_, i) => ({
    id: i,
    left: rand(3, 96),
    top: rand(4, 88),
    size: rand(1.1, 2.4),
    delay: rand(0, 12),
    duration: rand(12, 22),
    opacity: rand(0.25, 0.55),
    glyph: CLOUD_GLYPHS[i % CLOUD_GLYPHS.length],
  }));
}

function makeEmbers(): Particle[] {
  return Array.from({ length: EMBER_COUNT }, (_, i) => ({
    id: i,
    left: rand(2, 98),
    top: 0,
    size: rand(0.8, 1.8),
    delay: rand(0, 10),
    duration: rand(6, 13),
    opacity: rand(0.45, 0.85),
    glyph: CYBER_GLYPHS[i % CYBER_GLYPHS.length],
  }));
}

function makeMatrixStreams(): Particle[] {
  return Array.from({ length: MATRIX_COUNT }, (_, i) => {
    const streamLen = Math.floor(rand(5, 10));
    const streamText = Array.from({ length: streamLen }, () =>
      MATRIX_GLYPHS[Math.floor(Math.random() * MATRIX_GLYPHS.length)]
    ).join('');
    return {
      id: i,
      left: rand(2, 98),
      top: 0,
      size: rand(0.85, 1.3),
      delay: rand(0, 7),
      duration: rand(4, 9),
      opacity: rand(0.65, 0.95),
      streamText,
    };
  });
}

function makeSynthwave(): Particle[] {
  return Array.from({ length: SYNTH_COUNT }, (_, i) => ({
    id: i,
    left: rand(3, 97),
    top: 0,
    size: rand(0.9, 2.0),
    delay: rand(0, 11),
    duration: rand(7, 15),
    opacity: rand(0.4, 0.8),
    glyph: SYNTH_GLYPHS[i % SYNTH_GLYPHS.length],
  }));
}

function makeGoldStars(): Particle[] {
  return Array.from({ length: GOLD_COUNT }, (_, i) => ({
    id: i,
    left: rand(2, 98),
    top: rand(3, 90),
    size: rand(0.8, 1.9),
    delay: rand(0, 6),
    duration: rand(3, 7),
    opacity: rand(0.4, 0.9),
    glyph: GOLD_GLYPHS[i % GOLD_GLYPHS.length],
  }));
}

function makeSakura(): Particle[] {
  return Array.from({ length: SAKURA_COUNT }, (_, i) => ({
    id: i,
    left: rand(2, 98),
    top: 0,
    size: rand(1.0, 2.2),
    delay: rand(0, 12),
    duration: rand(8, 16),
    opacity: rand(0.4, 0.8),
    glyph: SAKURA_GLYPHS[i % SAKURA_GLYPHS.length],
  }));
}

function makeArcade(): Particle[] {
  return Array.from({ length: ARCADE_COUNT }, (_, i) => ({
    id: i,
    left: rand(3, 97),
    top: 0,
    size: rand(0.85, 1.8),
    delay: rand(0, 10),
    duration: rand(7, 14),
    opacity: rand(0.4, 0.85),
    glyph: ARCADE_GLYPHS[i % ARCADE_GLYPHS.length],
  }));
}

function makeNebula(): Particle[] {
  return Array.from({ length: NEBULA_COUNT }, (_, i) => ({
    id: i,
    left: rand(2, 98),
    top: rand(2, 92),
    size: rand(0.7, 1.9),
    delay: rand(0, 8),
    duration: rand(4, 9),
    opacity: rand(0.4, 0.9),
    glyph: NEBULA_GLYPHS[i % NEBULA_GLYPHS.length],
  }));
}

function makeEmerald(): Particle[] {
  return Array.from({ length: EMERALD_COUNT }, (_, i) => ({
    id: i,
    left: rand(2, 98),
    top: 0,
    size: rand(0.9, 2.1),
    delay: rand(0, 12),
    duration: rand(8, 17),
    opacity: rand(0.4, 0.85),
    glyph: EMERALD_GLYPHS[i % EMERALD_GLYPHS.length],
  }));
}

function makeBloodmoon(): Particle[] {
  return Array.from({ length: BLOODMOON_COUNT }, (_, i) => ({
    id: i,
    left: rand(2, 98),
    top: 0,
    size: rand(0.95, 2.2),
    delay: rand(0, 12),
    duration: rand(7, 15),
    opacity: rand(0.45, 0.85),
    glyph: BLOODMOON_GLYPHS[i % BLOODMOON_GLYPHS.length],
  }));
}

// ---------------------------------------------------------------------------
// Per-background celebration shower factories
// ---------------------------------------------------------------------------

/** Pick a colour from the palette array, cycling with a safe fallback. */
function pickColor(colors: string[], i: number): string {
  return colors[i % colors.length] || '#ffffff';
}
/** Pick a glyph from the glyph array, cycling with a safe fallback. */
function pickGlyph(glyphs: string[], i: number): string {
  return glyphs[i % glyphs.length] || '';
}

/** Meteor shower — diagonal streaks (stars / dark / default) */
function makeStreakShower(colors: string[]): ShowerStar[] {
  return Array.from({ length: SHOWER_STAR_COUNT }, (_, i) => ({
    id: i,
    celebType: 'streak' as CelebType,
    top: rand(-12, 60),
    left: rand(20, 115),
    length: Math.round(rand(120, 260)),
    thickness: rand(2.2, 3.8),
    delay: rand(0, 2.2),
    duration: rand(0.65, 1.15),
    color: pickColor(colors, i),
    angle: rand(-35, -42),
    distance: Math.round(rand(620, 950)),
  }));
}

/** Rising-particle burst — symbols float from bottom upward (hearts, sakura, embers, emerald, bloodmoon) */
function makeRiseShower(colors: string[], glyphs: string[]): ShowerStar[] {
  return Array.from({ length: SHOWER_STAR_COUNT }, (_, i) => ({
    id: i,
    celebType: 'rise' as CelebType,
    top: rand(80, 110),
    left: rand(1, 99),
    length: 0,
    thickness: rand(1.0, 2.2),
    delay: rand(0, 2.6),
    duration: rand(1.1, 2.1),
    color: pickColor(colors, i),
    angle: rand(-18, 18),
    distance: Math.round(rand(380, 700)),
    glyph: pickGlyph(glyphs, i),
  }));
}

/** Matrix cascade — dense fast-falling glyphs top→bottom */
function makeFallShower(colors: string[], glyphs: string[]): ShowerStar[] {
  return Array.from({ length: SHOWER_STAR_COUNT }, (_, i) => ({
    id: i,
    celebType: 'fall' as CelebType,
    top: rand(-10, 5),
    left: rand(1, 99),
    length: 0,
    thickness: rand(1.0, 1.6),
    delay: rand(0, 1.8),
    duration: rand(0.5, 1.0),
    color: pickColor(colors, i),
    angle: 0,
    distance: Math.round(rand(500, 950)),
    glyph: pickGlyph(glyphs, i),
  }));
}

/** Radial starburst — particles explode outward from screen centre (gold, nebula, synthwave, arcade, clouds) */
function makeBurstShower(colors: string[], glyphs: string[]): ShowerStar[] {
  return Array.from({ length: SHOWER_STAR_COUNT }, (_, i) => ({
    id: i,
    celebType: 'burst' as CelebType,
    top: 50,
    left: 50,
    length: Math.round(rand(6, 18)),
    thickness: rand(1.2, 2.6),
    delay: rand(0, 2.0),
    duration: rand(0.9, 1.8),
    color: pickColor(colors, i),
    angle: (360 / SHOWER_STAR_COUNT) * i + rand(-6, 6),
    distance: Math.round(rand(240, 580)),
    glyph: pickGlyph(glyphs, i),
  }));
}
/** Returns celebration shower particles tuned to the active background effect */
function makeShowerStars(effectiveBackground: BackgroundId): ShowerStar[] {
  switch (effectiveBackground) {
    // ── Diagonal meteor streaks ─────────────────────────────────────────────
    case 'stars':
      return makeStreakShower(['#38bdf8', '#60a5fa', '#93c5fd', '#e0f2fe', '#ffd700', '#ffffff']);

    // ── Upward rising particles ─────────────────────────────────────────────
    case 'hearts':
      return makeRiseShower(
        ['#f472b6', '#ec4899', '#fb7185', '#ffd1e3', '#ffffff'],
        ['♡', '♡', '♡', '·', '°'],
      );
    case 'sakura':
      return makeRiseShower(
        ['#f9a8d4', '#fda4af', '#fce7f3', '#fbcfe8', '#ffffff'],
        ['❀', '·', '°', '❀', '•'],
      );
    case 'embers':
      return makeRiseShower(
        ['#ff5577', '#ff003c', '#ffd700', '#ff9900', '#ffffff'],
        ['◆', '▲', '·', '◆', '::'],
      );
    case 'emerald':
      return makeRiseShower(
        ['#4ade80', '#22c55e', '#86efac', '#a7f3d0', '#ffffff'],
        ['·', '°', '•', '᠅', '·'],
      );
    case 'bloodmoon':
      return makeRiseShower(
        ['#ff3344', '#dc2626', '#f87171', '#fbbf24', '#7f1d1d'],
        ['◆', '▲', '·', '•', '◆'],
      );
    case 'clouds':
      return makeRiseShower(
        ['#bae6fd', '#7dd3fc', '#e0f2fe', '#f0f9ff', '#ffffff'],
        ['+', '·', '°', '~', '·'],
      );

    // ── Matrix — fast falling columns ───────────────────────────────────────
    case 'matrix':
      return makeFallShower(
        ['#00ff66', '#39ff14', '#00ffaa', '#00ff88', '#ffffff'],
        ['日', 'ﾊ', 'ﾐ', 'ﾋ', 'ｰ', 'ｳ', 'ｼ', 'ﾅ', '星', '電', '龍', '気'],
      );

    // ── Radial burst from centre ────────────────────────────────────────────
    case 'synthwave':
      return makeBurstShower(
        ['#00f0ff', '#ff007f', '#b942ff', '#05d9e8', '#fff700', '#ffffff'],
        ['◇', '△', '◆', '+'],
      );
    case 'gold':
      return makeBurstShower(
        ['#ffd700', '#f5c518', '#ffe4a0', '#fbbf24', '#ffffff'],
        ['+', '*', '·', '✦', '✧'],
      );
    case 'arcade':
      return makeBurstShower(
        ['#39ff14', '#00ffff', '#ff007f', '#ffff00', '#ff4500', '#ffffff'],
        ['▲', '■', '●', '◆', '+', 'x'],
      );
    case 'nebula':
      return makeBurstShower(
        ['#c084fc', '#a855f7', '#e879f9', '#38bdf8', '#818cf8', '#ffffff'],
        ['·', '⋆', '•', '+', '·'],
      );

    // ── Default fallback ────────────────────────────────────────────────────
    default:
      return makeStreakShower(['#38bdf8', '#60a5fa', '#93c5fd', '#e0f2fe', '#ffd700', '#ffffff']);
  }
}

interface ParticleLayer {
  bg: BackgroundId;
  particles: Particle[];
  key: number;
}

interface CelebrationBatch {
  id: number;
  stars: ShowerStar[];
}

function buildParticlesForBackground(bg: BackgroundId): Particle[] {
  switch (bg) {
    case 'clouds':
      return makeClouds();
    case 'stars':
      return makeStars();
    case 'hearts':
      return makeHearts();
    case 'embers':
      return makeEmbers();
    case 'matrix':
      return makeMatrixStreams();
    case 'synthwave':
      return makeSynthwave();
    case 'gold':
      return makeGoldStars();
    case 'sakura':
      return makeSakura();
    case 'arcade':
      return makeArcade();
    case 'nebula':
      return makeNebula();
    case 'emerald':
      return makeEmerald();
    case 'bloodmoon':
      return makeBloodmoon();
    default:
      return makeClouds();
  }
}

function renderLayerParticles(layer: ParticleLayer, animClass: string) {
  const { bg, particles, key } = layer;
  return (
    <div key={key} className={`bg-particles-layer ${animClass}`}>
      {particles.map((p) => {
        if (bg === 'matrix') {
          return (
            <div
              key={p.id}
              className="bg-particle bg-particle--matrix-stream"
              style={
                {
                  left: `${p.left}%`,
                  fontSize: `${p.size}rem`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                  '--particle-opacity': p.opacity,
                } as React.CSSProperties
              }
            >
              {p.streamText}
            </div>
          );
        }

        let particleClass = 'bg-particle--cloud';
        if (bg === 'hearts') {
          particleClass = `bg-particle--heart bg-particle--heart-${p.subType ?? 'twinkle'}`;
        } else if (bg === 'stars') {
          particleClass = `bg-particle--star bg-particle--star-${p.subType ?? 'twinkle'}`;
        } else if (bg === 'embers') particleClass = 'bg-particle--ember';
        else if (bg === 'synthwave') particleClass = 'bg-particle--synth';
        else if (bg === 'gold') particleClass = 'bg-particle--gold';
        else if (bg === 'sakura') particleClass = 'bg-particle--sakura';
        else if (bg === 'arcade') particleClass = 'bg-particle--arcade';
        else if (bg === 'nebula') particleClass = 'bg-particle--nebula';
        else if (bg === 'emerald') particleClass = 'bg-particle--emerald';
        else if (bg === 'bloodmoon') particleClass = 'bg-particle--bloodmoon';

        const styleObj: Record<string, string | number> = {
          left: `${p.left}%`,
          fontSize: `${p.size}rem`,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.duration}s`,
          '--particle-opacity': p.opacity,
        };

        if (p.top > 0) {
          styleObj.top = `${p.top}%`;
        }

        if (p.color) {
          styleObj.color = p.color;
        }

        return (
          <span
            key={p.id}
            className={`bg-particle ${particleClass}`}
            style={styleObj as React.CSSProperties}
          >
            {p.glyph}
          </span>
        );
      })}

      {/* Occasional shooting stars in ambient star background */}
      {bg === 'stars' && (
        <>
          <div className="shooting-star shooting-star--1" />
          <div className="shooting-star shooting-star--2" />
          <div className="shooting-star shooting-star--3" />
          <div className="shooting-star shooting-star--4" />
        </>
      )}
    </div>
  );
}

/**
 * BackgroundParticles
 *
 * Renders dynamic ambient background animations according to effectiveBackground
 * and smoothly cross-morphs the previous background layer into the new one.
 * On Level-Up, triggers a celebratory shower streaking across the sky!
 */
export default function BackgroundParticles() {
  const { effectiveBackground, levelUpTick = 0 } = useTheme();
  const [activeLayer, setActiveLayer] = useState<ParticleLayer | null>(null);
  const [outgoingLayer, setOutgoingLayer] = useState<ParticleLayer | null>(null);
  const [isEntering, setIsEntering] = useState(false);
  const [celebrationBatches, setCelebrationBatches] = useState<CelebrationBatch[]>([]);
  const [mounted, setMounted] = useState(false);

  const layerSeqRef = useRef(0);
  const activeLayerRef = useRef<ParticleLayer | null>(null);
  const morphTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const effectiveBgRef = useRef<BackgroundId>(effectiveBackground);
  effectiveBgRef.current = effectiveBackground;
  const batchIdRef = useRef(0);
  const batchTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (morphTimerRef.current) clearTimeout(morphTimerRef.current);
      batchTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const prev = activeLayerRef.current;
    if (prev && prev.bg === effectiveBackground) return;

    const nextLayer: ParticleLayer = {
      bg: effectiveBackground,
      particles: buildParticlesForBackground(effectiveBackground),
      key: ++layerSeqRef.current,
    };
    activeLayerRef.current = nextLayer;

    if (prev) {
      // Cross-morph: keep the old particle layer alive and dissolve it into the new one
      setOutgoingLayer(prev);
      setIsEntering(true);
      setActiveLayer(nextLayer);

      if (morphTimerRef.current) clearTimeout(morphTimerRef.current);
      morphTimerRef.current = setTimeout(() => {
        setOutgoingLayer(null);
        setIsEntering(false);
        morphTimerRef.current = null;
      }, 1700);
    } else {
      setIsEntering(false);
      setActiveLayer(nextLayer);
    }
  }, [effectiveBackground, mounted]);

  // Spawn a new independent celebration batch on each level-up;
  // previous batches stay alive until their own 3.8s animation finishes, even if
  // the theme changes or another level-up triggers concurrently.
  useEffect(() => {
    if (!mounted || levelUpTick <= 0) return;

    const batchId = ++batchIdRef.current;
    const stars = makeShowerStars(effectiveBgRef.current);
    setCelebrationBatches((prev) => [...prev, { id: batchId, stars }]);

    const timer = setTimeout(() => {
      setCelebrationBatches((prev) => prev.filter((b) => b.id !== batchId));
      batchTimersRef.current = batchTimersRef.current.filter((t) => t !== timer);
    }, 3800);
    batchTimersRef.current.push(timer);
  }, [levelUpTick, mounted]);

  if (!mounted || !activeLayer) return null;

  return (
    <div className="bg-particles" aria-hidden="true">
      {outgoingLayer && renderLayerParticles(outgoingLayer, 'bg-particles-layer--leaving')}
      {renderLayerParticles(activeLayer, isEntering ? 'bg-particles-layer--entering' : '')}

      {/* Celebration Showers on Level-Up — each batch plays to completion independently */}
      {celebrationBatches.map((batch) => (
        <div key={`batch-${batch.id}`} className="shower-container" aria-hidden="true">
          <div
            className={`shower-sky-glow shower-sky-glow--${
              batch.stars[0]?.celebType ?? 'streak'
            }`}
          />
          {batch.stars.map((s) => {
            if (s.celebType === 'streak') {
              // Diagonal shooting-star streak (stars / dark)
              return (
                <div
                  key={`shower-${batch.id}-${s.id}`}
                  className="shower-star shower-star--streak"
                  style={
                    {
                      top: `${s.top}%`,
                      left: `${s.left}%`,
                      width: `${s.length}px`,
                      height: `${s.thickness}px`,
                      '--shower-color': s.color,
                      '--shower-delay': `${s.delay}s`,
                      '--shower-duration': `${s.duration}s`,
                      '--shower-angle': `${s.angle}deg`,
                      '--shower-distance': `${s.distance}px`,
                      '--shower-thickness': `${s.thickness}px`,
                    } as React.CSSProperties
                  }
                />
              );
            }

            if (s.celebType === 'rise') {
              // Symbol floats upward with slight horizontal drift
              return (
                <span
                  key={`shower-${batch.id}-${s.id}`}
                  className="shower-star shower-star--rise"
                  style={
                    {
                      top: `${s.top}%`,
                      left: `${s.left}%`,
                      fontSize: `${s.thickness}rem`,
                      '--shower-color': s.color,
                      '--shower-delay': `${s.delay}s`,
                      '--shower-duration': `${s.duration}s`,
                      '--shower-drift': `${s.angle}deg`,
                      '--shower-distance': `${s.distance}px`,
                    } as React.CSSProperties
                  }
                >
                  {s.glyph}
                </span>
              );
            }

            if (s.celebType === 'fall') {
              // Glyph drops fast top→bottom (matrix cascade)
              return (
                <span
                  key={`shower-${batch.id}-${s.id}`}
                  className="shower-star shower-star--fall"
                  style={
                    {
                      top: `${s.top}%`,
                      left: `${s.left}%`,
                      fontSize: `${s.thickness}rem`,
                      '--shower-color': s.color,
                      '--shower-delay': `${s.delay}s`,
                      '--shower-duration': `${s.duration}s`,
                      '--shower-distance': `${s.distance}px`,
                    } as React.CSSProperties
                  }
                >
                  {s.glyph}
                </span>
              );
            }

            if (s.celebType === 'burst') {
              // Particle radiates outward from screen centre
              return (
                <span
                  key={`shower-${batch.id}-${s.id}`}
                  className="shower-star shower-star--burst"
                  style={
                    {
                      top: `${s.top}%`,
                      left: `${s.left}%`,
                      fontSize: `${s.length}px`,
                      '--shower-color': s.color,
                      '--shower-delay': `${s.delay}s`,
                      '--shower-duration': `${s.duration}s`,
                      '--shower-angle': `${s.angle}deg`,
                      '--shower-distance': `${s.distance}px`,
                    } as React.CSSProperties
                  }
                >
                  {s.glyph}
                </span>
              );
            }

            return null;
          })}
        </div>
      ))}
    </div>
  );
}
