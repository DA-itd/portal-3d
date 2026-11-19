import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../utils/audio.ts';
import {
  GraduationCap,
  FileText,
  Users,
  BarChart3,
  BookOpen,
  ArrowRight,
  Lock,
  Compass,
  Award,
  FileCheck,
  UserCheck,
  HeartHandshake,
  ShieldCheck,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play
} from 'lucide-react';

interface CardsSectionProps {
  searchQuery: string;
  onFocus3DNode: (nodeId: string) => void;
  onActiveCardChange?: (nodeId: string) => void;
}

type CardId = 'tutorias' | 'actualizacion' | 'siape';

const CARD_ORDER: { id: CardId; label: string; planet: string; dotColor: string }[] = [
  { id: 'tutorias', label: 'Programa de Tutorías', planet: 'La Tierra', dotColor: '#38bdf8' },
  { id: 'actualizacion', label: 'Actualización Docente', planet: 'Marte', dotColor: '#f97316' },
  { id: 'siape', label: 'SIAPE-ITD', planet: 'Venus', dotColor: '#8eb695' }
];

const ROTATION_DURATION_MS = 7000;

export const CardsSection: React.FC<CardsSectionProps> = ({
  searchQuery,
  onFocus3DNode,
  onActiveCardChange
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);

  const activeCard = CARD_ORDER[activeIndex];
  const query = searchQuery.toLowerCase().trim();

  // Notify parent so the 3D planet highlights in sync
  useEffect(() => {
    onActiveCardChange?.(activeCard.id);
  }, [activeCard.id, onActiveCardChange]);

  // Jump automatically to matching card if user types in Search
  useEffect(() => {
    if (!query) return;
    if (
      query.includes('tutor') ||
      query.includes('coordinador') ||
      query.includes('04-03') ||
      query.includes('04-02') ||
      query.includes('estadística')
    ) {
      setActiveIndex(0);
      setProgress(0);
    } else if (
      query.includes('actualiz') ||
      query.includes('docente') ||
      query.includes('curso') ||
      query.includes('constancia')
    ) {
      setActiveIndex(1);
      setProgress(0);
    } else if (
      query.includes('siape') ||
      query.includes('psico') ||
      query.includes('atención')
    ) {
      setActiveIndex(2);
      setProgress(0);
    }
  }, [query]);

  // Auto-rotation timer (pauses cleanly on hover or search)
  const isPaused = !isAutoPlaying || isHovered || Boolean(query);

  useEffect(() => {
    if (isPaused) return;

    const stepMs = 100;
    const increment = (stepMs / ROTATION_DURATION_MS) * 100;

    const timer = window.setInterval(() => {
      setProgress((prev) => {
        if (prev + increment >= 100) {
          setDirection(1);
          setActiveIndex((idx) => (idx + 1) % CARD_ORDER.length);
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  const goToIndex = (index: number) => {
    sound.playHover();
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    setProgress(0);
  };

  const handlePrev = () => {
    sound.playHover();
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + CARD_ORDER.length) % CARD_ORDER.length);
    setProgress(0);
  };

  const handleNext = () => {
    sound.playHover();
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % CARD_ORDER.length);
    setProgress(0);
  };

  const cardVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 48 : -48,
      rotateY: dir > 0 ? 10 : -10,
      scale: 0.97
    }),
    center: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      scale: 1
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -48 : 48,
      rotateY: dir > 0 ? -10 : 10,
      scale: 0.97
    })
  };

  return (
    <section
      id="cards-section"
      className="max-w-xl w-full mx-auto px-4 sm:px-6 mt-auto pt-36 sm:pt-44 pb-16 relative z-20 pointer-events-auto"
    >
      {/* Selector superior de tarjetas + control de giro */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {CARD_ORDER.map((item, idx) => {
            const selected = idx === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => goToIndex(idx)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-rajdhani font-bold tracking-wider uppercase flex items-center gap-2 border transition-all cursor-pointer ${
                  selected
                    ? 'bg-slate-900/95 border-cyan-400/70 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.dotColor }}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Controles de rotación */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrev}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Tarjeta anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playHover();
              setIsAutoPlaying((prev) => !prev);
            }}
            className="px-2.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            title={isAutoPlaying ? 'Pausar rotación automática' : 'Reanudar rotación automática'}
          >
            {isAutoPlaying ? (
              <Pause className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <Play className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="hidden sm:inline font-medium">
              {isPaused ? 'Pausado' : 'Auto'}
            </span>
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Siguiente tarjeta"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contenedor con perspectiva para presentación una a una */}
      <div
        style={{ perspective: '1200px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence mode="wait" custom={direction}>
          {/* TARJETA 1: PROGRAMA DE TUTORÍAS */}
          {activeCard.id === 'tutorias' && (
            <motion.div
              key="tutorias"
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl p-6 sm:p-8 bg-slate-900/85 border border-cyan-500/30 backdrop-blur-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500" />

              {/* Header visual */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-500/10">
                    <GraduationCap className="w-7 h-7 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-rajdhani text-2xl sm:text-3xl font-bold text-white tracking-wide leading-tight">
                      Programa de Tutorías
                    </h3>
                    <span className="text-xs text-cyan-300/80 font-medium">
                      La Tierra · Seguimiento académico ITD
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sound.playSelect();
                      onFocus3DNode('tutorias');
                    }}
                    className="px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 hover:bg-cyan-900 transition-colors cursor-pointer"
                    title="Ver planeta Tierra en 3D"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>3D</span>
                  </button>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold font-rajdhani tracking-wider uppercase bg-teal-500/15 text-teal-300 border border-teal-500/30">
                    Activo
                  </span>
                </div>
              </div>

              {/* Enlaces directos */}
              <div className="flex flex-col gap-3">
                <a
                  href="https://da-itd.github.io/C/ITD-AC-PO-04-03-app.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playSelect()}
                  className="group w-full text-left flex items-center justify-between p-4 rounded-2xl bg-slate-950/65 border border-cyan-500/20 hover:border-cyan-400/60 hover:bg-cyan-950/40 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-rajdhani text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                        Coordinador de Tutoría
                      </div>
                      <span className="inline-block text-[11px] font-mono text-cyan-300/80 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/20 mt-0.5">
                        ITD-AC-PO-04-03
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all" />
                </a>

                <a
                  href="https://da-itd.github.io/C/tutor.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playSelect()}
                  className="group w-full text-left flex items-center justify-between p-4 rounded-2xl bg-slate-950/65 border border-teal-500/20 hover:border-teal-400/60 hover:bg-teal-950/35 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/25 text-teal-400 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-rajdhani text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                        Tutor Académico
                      </div>
                      <span className="inline-block text-[11px] font-mono text-teal-300/80 bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-500/20 mt-0.5">
                        ITD-AC-PO-04-02
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-teal-300 group-hover:translate-x-1 transition-all" />
                </a>

                <a
                  href="https://da-itd.github.io/C/reportes.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playSelect()}
                  className="group w-full text-left flex items-center justify-between p-4 rounded-2xl bg-slate-950/65 border border-amber-500/20 hover:border-amber-400/60 hover:bg-amber-950/25 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-rajdhani text-lg font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                        <span>Reporte Estadísticas</span>
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <span className="inline-block text-[11px] text-amber-300/80 mt-0.5">
                        Acceso restringido
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-300 group-hover:translate-x-1 transition-all" />
                </a>
              </div>

              {/* Barra de tiempo */}
              <div className="mt-6 h-1 w-full bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </motion.div>
          )}

          {/* TARJETA 2: ACTUALIZACIÓN DOCENTE */}
          {activeCard.id === 'actualizacion' && (
            <motion.div
              key="actualizacion"
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl p-6 sm:p-8 bg-slate-900/85 border border-orange-500/30 backdrop-blur-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-blue-500" />

              {/* Header visual */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-300 shadow-lg shadow-orange-500/10">
                    <BookOpen className="w-7 h-7 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-rajdhani text-2xl sm:text-3xl font-bold text-white tracking-wide leading-tight">
                      Actualización Docente
                    </h3>
                    <span className="text-xs text-orange-300/80 font-medium">
                      Marte · Formación continua TecNM
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sound.playSelect();
                      onFocus3DNode('actualizacion');
                    }}
                    className="px-2.5 py-1 rounded-full bg-orange-950/80 border border-orange-500/30 text-orange-300 text-xs font-semibold flex items-center gap-1 hover:bg-orange-900 transition-colors cursor-pointer"
                    title="Ver planeta Marte en 3D"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>3D</span>
                  </button>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold font-rajdhani tracking-wider uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Cursos
                  </span>
                </div>
              </div>

              {/* Tiles visuales minimalistas */}
              <div className="grid grid-cols-3 gap-3 mb-7">
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-blue-500/20 flex flex-col items-center justify-center text-center gap-2.5">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="font-rajdhani text-base font-bold text-white tracking-wide">
                    Cursos
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/60 border border-amber-500/20 flex flex-col items-center justify-center text-center gap-2.5">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <span className="font-rajdhani text-base font-bold text-white tracking-wide">
                    Constancias
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/60 border border-emerald-500/20 flex flex-col items-center justify-center text-center gap-2.5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <span className="font-rajdhani text-base font-bold text-white tracking-wide">
                    Registro
                  </span>
                </div>
              </div>

              <a
                href="https://act-doc-itd.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playSelect()}
                className="inline-flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 hover:from-orange-400 hover:via-amber-300 hover:to-yellow-300 text-slate-950 font-rajdhani text-lg font-bold tracking-wider uppercase transition-all shadow-xl hover:shadow-orange-500/25 group cursor-pointer"
              >
                <span>Acceder al sistema</span>
                <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1.5 transition-transform" />
              </a>

              {/* Barra de tiempo */}
              <div className="mt-6 h-1 w-full bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </motion.div>
          )}

          {/* TARJETA 3: SIAPE-ITD */}
          {activeCard.id === 'siape' && (
            <motion.div
              key="siape"
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900/90 via-[#0e1f19]/90 to-slate-900/90 border border-emerald-500/35 backdrop-blur-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8eb695] via-emerald-400 to-[#4a6b53]" />

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#8eb695]/20 border border-[#8eb695]/40 flex items-center justify-center text-emerald-300 shadow-lg shadow-emerald-500/10 flex-shrink-0">
                    <HeartHandshake className="w-8 h-8 text-[#9ec7a5]" />
                  </div>
                  <div>
                    <h3 className="font-rajdhani text-2xl sm:text-3xl font-bold text-white tracking-wide leading-tight">
                      SIAPE-ITD
                    </h3>
                    <span className="text-xs text-emerald-300/85 font-medium">
                      Venus · Oficina de Psicología ITD
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sound.playSelect();
                      onFocus3DNode('siape');
                    }}
                    className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1 hover:bg-emerald-900 transition-colors cursor-pointer"
                    title="Ver planeta Venus en 3D"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>3D</span>
                  </button>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold font-rajdhani tracking-wider uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Bienestar
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/55 border border-emerald-500/20 mb-7 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-base sm:text-lg text-emerald-50 font-semibold">
                    Sistema Integral de Atención Psicológica Estudiantil
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-xs text-emerald-300/90 mt-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Espacio seguro · Acceso con Google</span>
                  </div>
                </div>
              </div>

              <a
                href="https://siape-itd.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playSelect()}
                className="w-full inline-flex items-center justify-center gap-3 py-4 px-8 rounded-2xl bg-gradient-to-r from-[#8eb695] to-emerald-400 hover:from-[#9fc9a6] hover:to-emerald-300 text-slate-950 font-rajdhani text-lg font-bold tracking-wider uppercase transition-all shadow-xl hover:shadow-emerald-500/25 group cursor-pointer"
              >
                <span>Ingresar a SIAPE-ITD</span>
                <ExternalLink className="w-5 h-5 text-slate-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              {/* Barra de tiempo */}
              <div className="mt-6 h-1 w-full bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#8eb695] to-emerald-400 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Indicador sutil de pausa al pasar cursor */}
      <div className="mt-3 text-center text-[11px] text-slate-400">
        {isHovered
          ? 'Rotación pausada mientras el cursor está sobre la tarjeta'
          : isAutoPlaying
          ? 'Cambia automáticamente cada 7 segundos · Pasa el cursor para pausar'
          : 'Rotación en pausa · Selecciona una pestaña o flecha para cambiar'}
      </div>
    </section>
  );
};
