import React, { useState, useEffect } from 'react';
import { GameMode } from './types';
import ArcadeMonitor from './components/ArcadeMonitor';
import ControlsPanel from './components/ControlsPanel';
import StatsPanel from './components/StatsPanel';
import { toggleSound, isSoundEnabled } from './utils/audio';
import { Trophy, Gamepad2, Info, ArrowRight, Github } from 'lucide-react';

export default function App() {
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.BRICK_BREAKER); // default to Option B!
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER' | 'PAUSED'>('START');
  const [score, setScore] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [highScoresChanged, setHighScoresChanged] = useState<boolean>(false);

  // Initialize sound settings
  useEffect(() => {
    setSoundEnabled(isSoundEnabled());
  }, []);

  const handleToggleSound = () => {
    const nextState = toggleSound();
    setSoundEnabled(nextState);
  };

  const handleResetGame = () => {
    setGameState('START');
    setScore(0);
  };

  return (
    <div className="min-h-screen bg-[#070514] text-white flex flex-col justify-between selection:bg-[#ff0055] selection:text-white">
      
      {/* Decorative cyber ambient top glow line */}
      <div className="w-full h-1 bg-gradient-to-r from-[#ff0055] via-[#bd00ff] to-[#00f6ff] shadow-[0_3px_20px_#bd00ff]" />

      {/* Header bar */}
      <header className="bg-[#0c091f]/80 backdrop-blur-md border-b border-[#1e1a3e] py-4 px-6 md:px-12 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#ff0055] to-[#bd00ff] rounded-xl shadow-[0_0_15px_rgba(255,0,85,0.4)]">
            <Gamepad2 className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-extrabold tracking-wider bg-gradient-to-r from-[#ff0055] via-white to-[#00f6ff] bg-clip-text text-transparent font-sans">
              ARCADE MULTIJUEGOS G-RAMOS
            </h1>
            <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
              Clonado y Mejorado • Opción B Seleccionada
            </span>
          </div>
        </div>

        {/* Subtle top indicator badges */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 py-1 px-3 bg-[#171333] border border-[#2a2654] rounded-full text-xs">
            <span className="w-2 h-2 rounded-full bg-[#39ff14] animate-ping" />
            <span className="text-gray-300 font-medium">Terminal Online</span>
          </div>
          <div className="flex items-center gap-2 py-1 px-3 bg-[#1e173e] border border-[#3c336e] rounded-full text-xs text-yellow-400 font-semibold shadow-[0_0_10px_rgba(234,179,8,0.15)]">
            <Trophy className="w-3.5 h-3.5" />
            <span>High Scores</span>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col justify-center">
        
        {/* Proportional Grid layout (Responsive 3 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
          
          {/* Panel 1: Leaderboard & Stats (Left Column) */}
          <div className="lg:col-span-1 flex flex-col justify-between h-full gap-6 order-2 lg:order-1">
            <StatsPanel 
              score={score} 
              gameMode={gameMode} 
              highScoresChanged={highScoresChanged}
            />
          </div>

          {/* Panel 2: Arcade Monitor Screen (Center 2 Columns) */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center order-1 lg:order-2 h-full">
            <div className="w-full flex-1 flex flex-col items-center justify-center bg-[#0d0a21]/40 border border-[#221e42]/60 rounded-3xl p-4 md:p-6 shadow-[0_15px_50px_rgba(0,0,0,0.5)]">
              
              {/* Game state badge / prompt headers */}
              <div className="flex items-center justify-between w-full mb-4 px-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#ff0055] tracking-widest uppercase font-mono">
                    Sistema de Video CRT
                  </span>
                  <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    {gameMode === GameMode.BRICK_BREAKER ? 'Rompe Ladrillos' : gameMode === GameMode.SNAKE ? 'La Serpiente' : 'Esquiva Espacial'}
                  </h2>
                </div>
                
                {/* Active state pills */}
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-[10px] font-extrabold tracking-widest uppercase rounded-md ${
                    gameState === 'PLAYING' 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                      : gameState === 'PAUSED'
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                      : 'bg-[#ff0055]/10 text-[#ff0055] border border-[#ff0055]/30'
                  }`}>
                    {gameState === 'PLAYING' ? 'EN JUEGO' : gameState === 'PAUSED' ? 'PAUSADO' : 'CRT LISTO'}
                  </span>
                </div>
              </div>

              {/* The interactive CRT simulator monitor component */}
              <ArcadeMonitor
                gameMode={gameMode}
                gameState={gameState}
                setGameState={setGameState}
                score={score}
                setScore={setScore}
                setHighScoresChanged={setHighScoresChanged}
                difficulty={difficulty}
              />

              {/* Prompt helper on bottom monitor */}
              <div className="flex items-center gap-2 mt-4 text-[11px] text-gray-400">
                <Info className="w-3.5 h-3.5 text-[#00f6ff]" />
                <span className="font-sans">
                  {gameState === 'PLAYING' 
                    ? 'Tip: Presiona "P" para pausar el juego en cualquier momento.' 
                    : 'Selecciona dificultad o cambia de modo a la derecha antes de iniciar.'}
                </span>
              </div>

            </div>
          </div>

          {/* Panel 3: Controls, Game Toggles & Guide (Right Column) */}
          <div className="lg:col-span-1 flex flex-col justify-between h-full gap-6 order-3">
            <ControlsPanel
              gameMode={gameMode}
              setGameMode={setGameMode}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              soundEnabled={soundEnabled}
              onToggleSound={handleToggleSound}
              gameState={gameState}
              onReset={handleResetGame}
            />
          </div>

        </div>

      </main>

      {/* Footer bar */}
      <footer className="bg-[#070514] border-t border-[#1a1631] py-5 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 z-10 gap-3">
        <div className="flex items-center gap-1.5 font-sans">
          <span>Desarrollado para la comunidad con un diseño premium por</span>
          <span className="font-bold text-gray-400 uppercase">Guillermo Ramos Chang</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-[#ff0055]/70 font-semibold uppercase tracking-wider text-[10px]">
            © 2026 ARCADE EMULATOR • CLONE AND IMPROVE
          </span>
        </div>
      </footer>

    </div>
  );
}
