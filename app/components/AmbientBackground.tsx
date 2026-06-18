"use client";

export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[#020203]" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(168,85,247,0.08), transparent),' +
            'radial-gradient(ellipse 60% 40% at 80% 60%, rgba(6,182,212,0.05), transparent)',
        }}
      />
    </div>
  );
}