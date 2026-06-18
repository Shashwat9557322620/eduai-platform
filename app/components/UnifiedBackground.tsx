"use client";

export default function UnifiedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[#020203]" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(6,182,212,0.08), transparent),' +
            'radial-gradient(ellipse 60% 40% at 80% 50%, rgba(168,85,247,0.05), transparent),' +
            'radial-gradient(ellipse 60% 40% at 20% 80%, rgba(99,102,241,0.04), transparent)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, #020203 100%)',
        }}
      />
    </div>
  );
}