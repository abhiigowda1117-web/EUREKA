/**
 * Site-wide background artwork with a technology theme: circuit-board traces,
 * chips and solder pads in cerulean and neon rose, with faint lines of code.
 * Generated in code (deterministic, so server and browser draw the same
 * picture), fixed behind every page and hidden from screen readers.
 */

// Small seeded random generator so the pattern is identical on every render.
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const W = 1600;
const H = 1000;
const GRID = 40;
const rand = rng(20261116);
const snap = (v: number) => Math.round(v / GRID) * GRID;

// Circuit traces: each runs straight, then turns 45° or 90° once or twice, ending in a pad.
type Trace = { d: string; end: [number, number]; rose: boolean };
const traces: Trace[] = Array.from({ length: 46 }, () => {
  let x = snap(rand() * W);
  let y = snap(rand() * H);
  let d = `M${x} ${y}`;
  const segments = 2 + Math.floor(rand() * 3);
  let horizontal = rand() < 0.5;
  for (let s = 0; s < segments; s++) {
    const len = GRID * (2 + Math.floor(rand() * 6)) * (rand() < 0.5 ? -1 : 1);
    if (rand() < 0.3) {
      x += len; y += len; // diagonal jog
    } else if (horizontal) {
      x += len;
    } else {
      y += len;
    }
    horizontal = !horizontal;
    d += ` L${x} ${y}`;
  }
  return { d, end: [x, y], rose: rand() < 0.25 };
});

// Chips: rectangles with pins along two sides.
const chips = Array.from({ length: 7 }, () => ({
  x: snap(rand() * (W - 160)),
  y: snap(rand() * (H - 120)),
  w: GRID * (2 + Math.floor(rand() * 2)),
  h: GRID * (1 + Math.floor(rand() * 2)),
  rose: rand() < 0.3,
}));

const codeLines = [
  "const project = await eureka.post({ budget: 12000 })",
  "if (skills.match(project)) proposal.send()",
  "git commit -m \"first freelance project\"",
  "SELECT * FROM opportunities WHERE open = true;",
  "def build(idea): return ship(idea)",
  "npm run dev  ▸ ready on localhost:3000",
  "<Talent meets={opportunity} />",
  "while (learning) { build(); grow(); }",
];
const code = codeLines.map((text, i) => ({
  text,
  x: 40 + rand() * (W - 600),
  y: 70 + i * (H / codeLines.length),
}));

const CERULEAN = "#38b6f0";
const ROSE = "#ff2e88";

export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      {/* Colour fields */}
      <div className="absolute -left-40 -top-40 h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(closest-side,rgb(10_139_208/0.26),transparent)] blur-2xl" />
      <div className="absolute -right-48 top-1/3 h-[38rem] w-[38rem] animate-glow rounded-full bg-[radial-gradient(closest-side,rgb(255_46_136/0.16),transparent)] blur-2xl" />

      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id="bd-dots" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill={CERULEAN} fillOpacity="0.12" />
          </pattern>
          <filter id="bd-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* PCB dot grid */}
        <rect width={W} height={H} fill="url(#bd-dots)" />

        {/* Faint code */}
        <g fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="15">
          {code.map((c, i) => (
            <text key={i} x={c.x} y={c.y} fill={i % 3 === 0 ? ROSE : CERULEAN} fillOpacity="0.13">{c.text}</text>
          ))}
        </g>

        {/* Traces */}
        <g fill="none" strokeWidth="1.4" strokeLinejoin="round" filter="url(#bd-glow)">
          {traces.map((t, i) => (
            <path key={i} d={t.d} stroke={t.rose ? ROSE : CERULEAN} strokeOpacity={t.rose ? 0.4 : 0.32} />
          ))}
        </g>
        {/* Solder pads at trace ends */}
        <g filter="url(#bd-glow)">
          {traces.map((t, i) => (
            <circle key={i} cx={t.end[0]} cy={t.end[1]} r="3.4" fill="#0a0a0b" stroke={t.rose ? ROSE : CERULEAN} strokeWidth="1.6" strokeOpacity="0.7" />
          ))}
        </g>

        {/* Chips */}
        {chips.map((c, i) => {
          const color = c.rose ? ROSE : CERULEAN;
          const pins = Math.floor(c.w / 14);
          return (
            <g key={i} opacity="0.55">
              {Array.from({ length: pins }, (_, p) => {
                const px = c.x + 10 + p * 14;
                return (
                  <g key={p} stroke={color} strokeWidth="1.4" strokeOpacity="0.6">
                    <line x1={px} y1={c.y - 8} x2={px} y2={c.y} />
                    <line x1={px} y1={c.y + c.h} x2={px} y2={c.y + c.h + 8} />
                  </g>
                );
              })}
              <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="4" fill="#111114" stroke={color} strokeOpacity="0.55" />
              <circle cx={c.x + 8} cy={c.y + 8} r="2" fill={color} fillOpacity="0.6" />
            </g>
          );
        })}
      </svg>

      {/* Fade toward the bottom so long pages stay readable */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(10_10_11/0.1)_0%,rgb(10_10_11/0.45)_60%,rgb(10_10_11/0.8)_100%)]" />
    </div>
  );
}
