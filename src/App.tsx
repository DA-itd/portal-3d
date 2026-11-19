/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ViewMode, ColorTheme, Node3DData } from './types.ts';
import { ThreeCanvas } from './components/ThreeCanvas.tsx';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { CardsSection } from './components/CardsSection.tsx';
import { BottomControlDock } from './components/BottomControlDock.tsx';
import { Footer } from './components/Footer.tsx';
import { sound } from './utils/audio.ts';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('portal');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('tecnm');
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>('tutorias');
  const [isRotating, setIsRotating] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sound.enabled = nextState;
  };

  const handleSelect3DNode = (node: Node3DData | null) => {
    if (node) {
      setActiveNodeId(node.id);
      if (viewMode === 'portal') {
        setViewMode('space3d');
      }
    } else {
      setActiveNodeId(null);
    }
  };

  const handleFocus3DNodeFromCard = (nodeId: string) => {
    setActiveNodeId(nodeId);
    setViewMode('space3d');
    sound.playWarp();
  };

  return (
    <div className="relative min-h-screen bg-[#05080f] text-slate-100 flex flex-col overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950">
      {/* Interactive Three.js 3D Solar System Canvas */}
      <ThreeCanvas
        viewMode={viewMode}
        colorTheme={colorTheme}
        activeNodeId={activeNodeId}
        highlightedNodeId={highlightedNodeId}
        onSelectNode={handleSelect3DNode}
        isRotating={isRotating}
      />

      {/* Glowing ambient radial orbs */}
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-blue-900/20 blur-3xl pointer-events-none z-0" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 rounded-full bg-amber-900/15 blur-3xl pointer-events-none z-0" />

      {/* App Content Layer */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Header */}
        <Header
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* View Mode: PORTAL (Hero + Rotating Cards) */}
        {viewMode === 'portal' && (
          <main className="flex-1 flex flex-col">
            <Hero />

            <CardsSection
              searchQuery={searchQuery}
              onFocus3DNode={handleFocus3DNodeFromCard}
              onActiveCardChange={setHighlightedNodeId}
            />

            <Footer />
          </main>
        )}

        {/* View Mode: SPACE 3D (Full-screen Solar System explorer) */}
        {viewMode === 'space3d' && (
          <div className="flex-1 relative pointer-events-none">
            <div className="absolute top-3 left-3 z-30 pointer-events-auto">
              <div className="px-3 py-2 rounded-xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md shadow-xl text-xs max-w-[230px]">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="font-rajdhani font-bold text-white text-xs tracking-wider uppercase">
                    Sistema Solar 3D · ITD
                  </span>
                </div>
                <p className="text-slate-400 text-[10px] leading-snug">
                  Arrastra para girar · Toca un planeta para ver su servicio.
                </p>
              </div>
            </div>

            <div className="absolute top-4 right-4 z-30 pointer-events-auto">
              <button
                onClick={() => {
                  sound.playSelect();
                  setViewMode('portal');
                }}
                className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-bold font-rajdhani tracking-wider uppercase transition-all shadow-xl backdrop-blur-md cursor-pointer flex items-center gap-2"
              >
                <span>Volver al Portal Web</span>
              </button>
            </div>
          </div>
        )}

        {/* Collapsible Bottom Control Dock */}
        <BottomControlDock
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          colorTheme={colorTheme}
          onChangeColorTheme={setColorTheme}
          activeNodeId={activeNodeId}
          onSelectNodeId={setActiveNodeId}
          isRotating={isRotating}
          onToggleRotating={() => setIsRotating(!isRotating)}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      </div>
    </div>
  );
}
