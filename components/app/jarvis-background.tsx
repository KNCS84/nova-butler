export function JarvisBackground() {
  const PARTICLES = [
    { left: '10%', top: '20%', delay: '0s', size: '3px' },
    { left: '25%', top: '65%', delay: '2s', size: '4px' },
    { left: '75%', top: '15%', delay: '1s', size: '3px' },
    { left: '85%', top: '70%', delay: '3s', size: '5px' },
    { left: '45%', top: '85%', delay: '4s', size: '2px' },
    { left: '60%', top: '35%', delay: '2.5s', size: '4px' },
    { left: '15%', top: '80%', delay: '1.5s', size: '3px' },
  ];

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none bg-slate-950"
      aria-hidden="true"
    >
      {/* 1. Deep Obsidian Base with KNCS Royal Blue Ambient Glows */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#050b18] to-[#01040a]" />

      {/* 2. Top-Left & Center-Right Royal Blue Atmospheric Orbs */}
      <div className="absolute -top-[20%] -left-[10%] h-[70vw] w-[70vw] max-w-[850px] rounded-full bg-blue-900/15 blur-[120px]" />
      <div className="absolute top-[40%] -right-[15%] h-[60vw] w-[60vw] max-w-[750px] rounded-full bg-indigo-900/15 blur-[140px]" />
      <div className="absolute -bottom-[20%] left-[25%] h-[50vw] w-[50vw] max-w-[650px] rounded-full bg-blue-950/25 blur-[100px]" />

      {/* 3. Subtle Luxury Obsidian Glass Grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(59, 130, 246, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.4) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
        }}
      />

      {/* 4. Soft Floating Luminous Particles */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-blue-400/40 shadow-[0_0_10px_rgba(96,165,250,0.6)] animate-pulse"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: '4s',
          }}
        />
      ))}

      {/* 5. Center Vignette to make voice visualizer pop */}
      <div className="absolute inset-0 bg-radial-vignette opacity-80" />
    </div>
  );
}
