import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-10 pb-6 sm:pt-12 sm:pb-8 text-center px-4 max-w-5xl mx-auto z-10 pointer-events-auto">
      {/* Pill status badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-400/30 bg-teal-500/10 text-teal-300 font-rajdhani text-xs tracking-widest uppercase mb-5 backdrop-blur-sm shadow-sm">
        <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" />
        <span>Servicios en línea disponibles · Periodo Escolar 2026</span>
      </div>

      {/* Main Title */}
      <h2 className="font-rajdhani text-4xl sm:text-6xl font-extrabold tracking-wide text-white leading-tight">
        Plataforma de <br className="hidden sm:inline" />
        <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
          Acceso a Servicios
        </span>
      </h2>

      {/* Highlights / Quick specs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mt-8 pt-6 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm text-left">
          <div className="text-[11px] text-slate-400 font-medium">ITD-AC-PO-04-03</div>
          <div className="text-sm font-bold text-cyan-300 font-rajdhani mt-0.5">Coordinación</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm text-left">
          <div className="text-[11px] text-slate-400 font-medium">ITD-AC-PO-04-02</div>
          <div className="text-sm font-bold text-teal-300 font-rajdhani mt-0.5">Tutor Académico</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm text-left">
          <div className="text-[11px] text-slate-400 font-medium">Formación Continua</div>
          <div className="text-sm font-bold text-amber-300 font-rajdhani mt-0.5">Actualización Docente</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/40 border border-emerald-800/40 backdrop-blur-sm text-left">
          <div className="text-[11px] text-slate-400 font-medium">Oficina de Psicología</div>
          <div className="text-sm font-bold text-emerald-300 font-rajdhani mt-0.5">SIAPE-ITD</div>
        </div>
      </div>
    </section>
  );
};
