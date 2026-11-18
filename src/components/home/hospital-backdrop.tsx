/** Decorative hospital-facade backdrop: bright sky and windowed towers. */
export function HospitalBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200/90 via-slate-100 to-slate-200/95" />
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.95) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 80% 20%, rgba(186,230,253,0.5) 0%, transparent 50%)",
        }}
      />

      <svg
        className="absolute bottom-0 left-1/2 h-[min(72vh,640px)] w-[min(160%,1200px)] -translate-x-1/2 text-slate-400/90"
        viewBox="0 0 1200 520"
        preserveAspectRatio="xMidYMax slice"
        fill="currentColor"
      >
        <defs>
          <linearGradient id="towerFace" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <pattern id="windows" width="28" height="22" patternUnits="userSpaceOnUse">
            <rect width="20" height="14" x="4" y="4" rx="1.5" fill="#fef9c3" opacity="0.85" />
            <rect width="20" height="14" x="4" y="4" rx="1.5" fill="#fff" opacity="0.35" />
          </pattern>
          <pattern id="windowsDim" width="28" height="22" patternUnits="userSpaceOnUse">
            <rect width="18" height="12" x="5" y="5" rx="1" fill="#e0f2fe" opacity="0.7" />
          </pattern>
        </defs>

        {/* distant wing */}
        <rect x="40" y="180" width="220" height="340" fill="url(#towerFace)" opacity="0.55" />
        <rect x="48" y="190" width="204" height="320" fill="url(#windowsDim)" />

        {/* central hospital tower */}
        <rect x="320" y="60" width="280" height="460" fill="url(#towerFace)" />
        <rect x="332" y="72" width="256" height="436" fill="url(#windows)" />

        {/* glass atrium */}
        <rect x="620" y="120" width="200" height="380" fill="#e2e8f0" opacity="0.95" />
        <rect x="632" y="132" width="176" height="356" fill="url(#windows)" opacity="0.9" />

        {/* right clinical wing */}
        <rect x="860" y="140" width="300" height="360" fill="url(#towerFace)" opacity="0.75" />
        <rect x="872" y="152" width="276" height="336" fill="url(#windows)" />

        {/* roofline / helipad hint */}
        <rect x="400" y="48" width="120" height="8" rx="2" fill="#64748b" opacity="0.5" />
      </svg>

      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-100/90 to-transparent" />
    </div>
  );
}