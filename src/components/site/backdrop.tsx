/**
 * Site-wide background artwork: a glowing "neural network" of connected
 * nodes in cerulean and neon rose, a visual metaphor for talent connecting
 * with opportunity. Generated in code (deterministic, so server and browser
 * draw the same picture), fixed behind every page and hidden from screen readers.
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
const rand = rng(20261116);
const nodes = Array.from({ length: 70 }, () => ({
  x: rand() * W,
  y: rand() * H,
  r: 1.2 + rand() * 2.6,
  rose: rand() < 0.28,
}));
// Connect each node to its nearest neighbours.
const links: [number, number, number][] = [];
nodes.forEach((a, i) => {
  nodes
    .map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
    .filter((n) => n.j > i && n.d < 210)
    .sort((p, q) => p.d - q.d)
    .slice(0, 3)
    .forEach((n) => links.push([i, n.j, n.d]));
});

export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      {/* Colour fields */}
      <div className="absolute -left-40 -top-40 h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(closest-side,rgb(10_139_208/0.28),transparent)] blur-2xl" />
      <div className="absolute -right-48 top-1/3 h-[38rem] w-[38rem] animate-glow rounded-full bg-[radial-gradient(closest-side,rgb(255_46_136/0.18),transparent)] blur-2xl" />
      <div className="absolute -bottom-56 left-1/4 h-[34rem] w-[46rem] rounded-full bg-[radial-gradient(closest-side,rgb(10_139_208/0.16),transparent)] blur-2xl" />
      {/* Neural network */}
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full opacity-70">
        <defs>
          <linearGradient id="bd-link" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0a8bd0" />
            <stop offset="1" stopColor="#ff2e88" />
          </linearGradient>
          <filter id="bd-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g stroke="url(#bd-link)" strokeWidth="0.8" fill="none">
          {links.map(([i, j, d]) => (
            <line key={`${i}-${j}`} x1={nodes[i]!.x} y1={nodes[i]!.y} x2={nodes[j]!.x} y2={nodes[j]!.y} strokeOpacity={0.35 - d / 900} />
          ))}
        </g>
        <g filter="url(#bd-glow)">
          {nodes.map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={n.rose ? "#ff2e88" : "#38b6f0"} fillOpacity={0.85} />
          ))}
        </g>
      </svg>
      {/* Fade toward the bottom so long pages stay readable */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgb(10_10_11/0.35)_60%,rgb(10_10_11/0.75)_100%)]" />
    </div>
  );
}
