import React, { useEffect, useState } from 'react';
import { GameMode, HighScore } from '../types';
import { Trophy, Star, Calendar, User, Zap } from 'lucide-react';

interface StatsPanelProps {
  score: number;
  gameMode: GameMode;
  highScoresChanged: boolean;
}

export default function StatsPanel({
  score,
  gameMode,
  highScoresChanged
}: StatsPanelProps) {
  const [highScores, setHighScores] = useState<HighScore[]>([]);

  // Load high scores from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('arcade_highscores');
      if (saved) {
        setHighScores(JSON.parse(saved));
      } else {
        // Seed initial mock scores for high quality retro feel
        const initialMock: HighScore[] = [
          { gameMode: GameMode.BRICK_BREAKER, score: 2500, playerName: 'G-RAMOS', date: '23/06/26' },
          { gameMode: GameMode.SNAKE, score: 850, playerName: 'CHAMP', date: '21/06/26' },
          { gameMode: GameMode.SPACE_DODGE, score: 1800, playerName: 'PILOTO', date: '22/06/26' },
          { gameMode: GameMode.BRICK_BREAKER, score: 1200, playerName: 'GEMINI', date: '23/06/26' },
        ];
        localStorage.setItem('arcade_highscores', JSON.stringify(initialMock));
        setHighScores(initialMock);
      }
    } catch (e) {
      console.error(e);
    }
  }, [highScoresChanged]);

  const getGameModeLabel = (mode: GameMode) => {
    if (mode === GameMode.SNAKE) return 'Serpiente';
    if (mode === GameMode.BRICK_BREAKER) return 'Ladrillos';
    if (mode === GameMode.SPACE_DODGE) return 'Espacial';
    return '';
  };

  const getGameModeColor = (mode: GameMode) => {
    if (mode === GameMode.SNAKE) return 'text-[#39ff14]';
    if (mode === GameMode.BRICK_BREAKER) return 'text-[#00f6ff]';
    if (mode === GameMode.SPACE_DODGE) return 'text-[#bd00ff]';
    return 'text-white';
  };

  return (
    <div className="flex flex-col gap-5 w-full bg-[#110e24] border border-[#2a2654] rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
      
      {/* Active scoreboard display */}
      <div className="flex flex-col gap-1.5 p-4 bg-[#1e173e] border border-[#3e3470] rounded-xl text-center shadow-[inset_0_0_15px_rgba(0,0,0,0.4)]">
        <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase font-sans">
          Puntuación Actual
        </span>
        <div className="flex items-center justify-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
          <span className="text-3xl font-extrabold text-yellow-400 font-mono tracking-wider drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">
            {String(score).padStart(5, '0')}
          </span>
        </div>
      </div>

      {/* Leaderboard/High score list */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <h3 className="text-xs font-bold tracking-wider text-gray-200 uppercase font-sans">
            Tabla de Clasificación
          </h3>
        </div>

        <div className="flex flex-col gap-2.5 max-h-[280px] overflow-y-auto pr-1">
          {highScores.length === 0 ? (
            <p className="text-xs text-gray-500 italic text-center py-4 font-sans">
              Sin récords registrados aún.
            </p>
          ) : (
            highScores.map((scoreItem, idx) => (
              <div 
                key={idx}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all ${
                  idx === 0 
                    ? 'bg-yellow-500/5 border-yellow-500/30' 
                    : idx === 1 
                    ? 'bg-gray-400/5 border-gray-400/20'
                    : 'bg-[#171333]/40 border-[#221e42]/60'
                }`}
              >
                {/* Left: Player + Rank */}
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-bold w-4 text-center ${
                    idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    #{idx + 1}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-200 uppercase tracking-wide">
                      {scoreItem.playerName}
                    </span>
                    <span className={`text-[10px] font-medium uppercase font-sans ${getGameModeColor(scoreItem.gameMode)}`}>
                      {getGameModeLabel(scoreItem.gameMode)}
                    </span>
                  </div>
                </div>

                {/* Right: Score + Date */}
                <div className="flex flex-col items-end">
                  <span className="font-mono font-bold text-gray-200">
                    {scoreItem.score} pts
                  </span>
                  <span className="text-[9px] text-gray-500">
                    {scoreItem.date}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Retro player profile customize */}
      <div className="border-t border-[#2a2654] pt-4 mt-1">
        <h3 className="text-[10px] font-bold tracking-wider text-gray-500 mb-2 uppercase font-sans">
          Perfil de Piloto
        </h3>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#1e173e] border border-[#3c336e] rounded-lg text-yellow-400">
            <User className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <input
              id="input-player-name"
              type="text"
              maxLength={10}
              placeholder="G-RAMOS"
              defaultValue={localStorage.getItem('arcade_player') || 'G-RAMOS'}
              onChange={(e) => {
                const name = e.target.value.toUpperCase() || 'G-RAMOS';
                localStorage.setItem('arcade_player', name);
              }}
              className="bg-[#171330] border border-[#2e295e] rounded-lg px-2.5 py-1 text-xs text-white font-mono uppercase focus:outline-none focus:border-[#ff0055] transition-all w-28"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
