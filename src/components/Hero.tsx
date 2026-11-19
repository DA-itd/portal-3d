import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-6 pb-3 sm:pt-8 sm:pb-4 text-center px-4 max-w-4xl mx-auto z-10 pointer-events-none">
      {/* Pill status badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-teal-400/30 bg-slate-950/60 text-teal-300 font-rajdhani text-[11px] tracking-widest uppercase mb-3 backdrop-blur-sm shadow-sm">
        <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" />
        <span>Servicios en línea · Periodo Escolar 2026</span>
      </div>

      {/* Compact Main Title */}
      <h2 className="font-rajdhani text-3xl sm:text-5xl font-extrabold tracking-wide text-white leading-tight drop-shadow-md">
        Plataforma de{' '}
        <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
          Acceso a Servicios
        </span>
      </h2>
    </section>
  );
};
