import React from 'react';
import { GameMode } from '../types';
import { Volume2, VolumeX, Shield, Swords, Sparkles, Trophy } from 'lucide-react';

interface ControlsPanelProps {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  setDifficulty: (diff: 'EASY' | 'MEDIUM' | 'HARD') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  gameState: 'START' | 'PLAYING' | 'GAMEOVER' | 'PAUSED';
  onReset: () => void;
}

export default function ControlsPanel({
  gameMode,
  setGameMode,
  difficulty,
  setDifficulty,
  soundEnabled,
  onToggleSound,
  gameState,
  onReset
}: ControlsPanelProps) {
  
  const getGameDescription = () => {
    if (gameMode === GameMode.SNAKE) {
      return {
        title: 'La Serpiente',
        icon: <Sparkles className="w-5 h-5 text-[#39ff14]" />,
        text: 'Mueve la serpiente por la pantalla comiendo manzanas rojas y doradas. ¡Evita chocar contra las paredes (en modo difícil) y tu propia cola!',
        controls: 'WASD / Teclas Dirección para moverse.'
      };
    }
    if (gameMode === GameMode.BRICK_BREAKER) {
      return {
        title: 'Rompe Ladrillos (Opción B)',
        icon: <Swords className="w-5 h-5 text-[#00f6ff]" />,
        text: 'Utiliza la pala para desviar la bola y romper los ladrillos de colores. Recoge power-ups que caen como ampliación de pala, multi-bola y disparador láser.',
        controls: 'A/D o Flechas para moverte. BARRA ESPACIADORA para lanzar la bola/disparar láser.'
      };
    }
    if (gameMode === GameMode.SPACE_DODGE) {
      return {
        title: 'Esquiva Espacial',
        icon: <Shield className="w-5 h-5 text-[#bd00ff]" />,
        text: 'Navega por un cinturón de asteroides. Dispara láseres para destruir asteroides, recolecta escudos y munición para sobrevivir al máximo tiempo posible.',
        controls: 'A/D o Flechas para moverte. BARRA ESPACIADORA para disparar láseres.'
      };
    }
    return { title: '', icon: null, text: '', controls: '' };
  };

  const desc = getGameDescription();

  return (
    <div className="flex flex-col gap-5 w-full bg-[#110e24] border border-[#2a2654] rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
      
      {/* Game Mode Selector */}
      <div>
        <h3 className="text-xs font-semibold tracking-wider text-gray-400 mb-3 uppercase font-sans">
          Seleccionar Juego
        </h3>
        <div className="flex flex-col gap-2">
          {[
            { mode: GameMode.BRICK_BREAKER, label: 'Rompe Ladrillos (Opción B)', color: 'border-[#00f6ff] text-[#00f6ff] hover:bg-[#00f6ff]/10 bg-[#00f6ff]/5' },
            { mode: GameMode.SNAKE, label: 'Juego de la Serpiente', color: 'border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14]/10 bg-[#39ff14]/5' },
            { mode: GameMode.SPACE_DODGE, label: 'Esquiva Espacial (Acción)', color: 'border-[#bd00ff] text-[#bd00ff] hover:bg-[#bd00ff]/10 bg-[#bd00ff]/5' }
          ].map((item) => {
            const isSelected = gameMode === item.mode;
            return (
              <button
                key={item.mode}
                id={`btn-gamemode-${item.mode.toLowerCase()}`}
                disabled={gameState === 'PLAYING'}
                onClick={() => setGameMode(item.mode)}
                className={`w-full text-left py-3 px-4 border rounded-xl font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSelected 
                    ? `font-bold shadow-[0_0_15px_rgba(0,246,255,0.15)] bg-[#1e1a3e] ${item.color}` 
                    : 'border-[#2a2654] text-gray-400 hover:text-white hover:border-gray-500 hover:bg-[#1c1836]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm tracking-wide">{item.label}</span>
                  {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse"></span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty Selector */}
      <div>
        <h3 className="text-xs font-semibold tracking-wider text-gray-400 mb-3 uppercase font-sans">
          Dificultad
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {(['EASY', 'MEDIUM', 'HARD'] as const).map((diff) => {
            const isSelected = difficulty === diff;
            const diffLabels = { EASY: 'Fácil', MEDIUM: 'Medio', HARD: 'Difícil' };
            const diffColors = { EASY: 'text-green-400 border-green-500/30', MEDIUM: 'text-yellow-400 border-yellow-500/30', HARD: 'text-red-400 border-red-500/30' };
            return (
              <button
                key={diff}
                id={`btn-diff-${diff.toLowerCase()}`}
                disabled={gameState === 'PLAYING'}
                onClick={() => setDifficulty(diff)}
                className={`py-2 text-xs font-medium tracking-wider uppercase border rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSelected 
                    ? `bg-[#1e1a3e] border-[#ff0055] text-[#ff0055] font-bold shadow-[0_0_10px_rgba(255,0,85,0.2)]` 
                    : `border-[#2a2654] text-gray-400 hover:text-white hover:bg-[#1a1631] ${diffColors[diff]}`
                }`}
              >
                {diffLabels[diff]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Audio / Utilities Toggles */}
      <div className="flex items-center justify-between border-t border-[#2a2654] pt-4">
        <button
          id="btn-toggle-sound"
          onClick={onToggleSound}
          className="flex items-center gap-2 py-2 px-3 bg-[#1c1836] hover:bg-[#252047] text-gray-300 hover:text-white rounded-xl border border-[#2a2654] transition-all cursor-pointer text-xs"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-green-400" />
              <span>Sonido Activo</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-red-400" />
              <span>Sonido Silenciado</span>
            </>
          )}
        </button>

        <button
          id="btn-reset-game"
          onClick={onReset}
          className="py-2 px-4 bg-[#ff0055] hover:bg-[#ff2b70] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(255,0,85,0.3)] active:scale-95"
        >
          Reiniciar Juego
        </button>
      </div>

      {/* Active Game Guide Info */}
      <div className="border-t border-[#2a2654] pt-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-1">
          {desc.icon}
          <h4 className="text-sm font-semibold text-white tracking-wide font-sans">{desc.title}</h4>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed font-sans">{desc.text}</p>
        <div className="bg-[#1c1836]/40 p-2.5 rounded-lg border border-[#2a2654]/60 mt-1">
          <p className="text-[11px] font-mono text-[#00f6ff]">
            <strong className="text-gray-300">Teclado:</strong> {desc.controls}
          </p>
        </div>
      </div>

    </div>
  );
}
