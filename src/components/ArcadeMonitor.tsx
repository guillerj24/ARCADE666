import React, { useRef, useEffect, useState } from 'react';
import { 
  GameMode, Particle, SnakeSegment, SnakeFood, 
  Brick, Ball, PowerUp, PowerUpType, LaserBeam,
  PlayerShip, Asteroid, SpaceLaser, SpaceCollectable 
} from '../types';
import { 
  playLaser, playHit, playPowerUp, 
  playExplosion, playGameOver, playVictory 
} from '../utils/audio';

interface ArcadeMonitorProps {
  gameMode: GameMode;
  gameState: 'START' | 'PLAYING' | 'GAMEOVER' | 'PAUSED';
  setGameState: (state: 'START' | 'PLAYING' | 'GAMEOVER' | 'PAUSED') => void;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setHighScoresChanged: React.Dispatch<React.SetStateAction<boolean>>;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

const VIRTUAL_WIDTH = 800;
const VIRTUAL_HEIGHT = 600;

export default function ArcadeMonitor({
  gameMode,
  gameState,
  setGameState,
  score,
  setScore,
  setHighScoresChanged,
  difficulty
}: ArcadeMonitorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Game loop controls
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const touchControlsRef = useRef<{ left: boolean; right: boolean; up: boolean; down: boolean; action: boolean }>({
    left: false, right: false, up: false, down: false, action: false
  });

  // Keys pressed
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Virtual size scaling
  const [scale, setScale] = useState<number>(1);

  // --- GENERAL STATE & PARTICLES ---
  const particles = useRef<Particle[]>([]);
  const combo = useRef<number>(1);
  const comboTimer = useRef<number>(0);

  // --- SNAKE GAME STATE ---
  const snake = useRef<SnakeSegment[]>([]);
  const snakeDir = useRef<{ x: number; y: number }>({ x: 1, y: 0 });
  const snakeNextDir = useRef<{ x: number; y: number }>({ x: 1, y: 0 });
  const snakeFood = useRef<SnakeFood | null>(null);
  const snakeMoveTimer = useRef<number>(0);

  // --- BRICK BREAKER STATE ---
  const paddle = useRef<{ x: number; y: number; width: number; height: number }>({ x: 340, y: 550, width: 120, height: 15 });
  const balls = useRef<Ball[]>([]);
  const bricks = useRef<Brick[]>([]);
  const powerUps = useRef<PowerUp[]>([]);
  const laserBeams = useRef<LaserBeam[]>([]);
  const activePowerUps = useRef<{ [key in PowerUpType]?: number }>({});
  const stickyBallAttached = useRef<boolean>(true);

  // --- SPACE DODGE STATE ---
  const playerShip = useRef<PlayerShip>({ x: 375, y: 500, width: 50, height: 40, shield: 100, laserCooldown: 0 });
  const asteroids = useRef<Asteroid[]>([]);
  const spaceLasers = useRef<SpaceLaser[]>([]);
  const spaceCollectables = useRef<SpaceCollectable[]>([]);
  const spaceTime = useRef<number>(0);
  const spaceLaserStock = useRef<number>(50);

  // Trigger high score saving
  const checkAndSaveHighScore = (finalScore: number) => {
    try {
      const saved = localStorage.getItem('arcade_highscores');
      const scores = saved ? JSON.parse(saved) : [];
      
      const newScore = {
        gameMode,
        score: finalScore,
        playerName: localStorage.getItem('arcade_player') || 'G-RAMOS',
        date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
      };

      scores.push(newScore);
      // Sort descending and keep top 10
      scores.sort((a: any, b: any) => b.score - a.score);
      localStorage.setItem('arcade_highscores', JSON.stringify(scores.slice(0, 10)));
      setHighScoresChanged(prev => !prev);
    } catch (e) {
      console.error(e);
    }
  };

  // --- AUDIO HELPER WRAPPER ---
  const triggerHit = () => playHit();
  const triggerLaser = () => playLaser();
  const triggerExplosion = () => playExplosion();
  const triggerPowerUp = () => playPowerUp();

  // Create explosion particles
  const spawnExplosion = (x: number, y: number, color: string, count = 15, force = 6) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * force + 1;
      const life = Math.random() * 20 + 20;
      particles.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        radius: Math.random() * 4 + 2,
        alpha: 1,
        life,
        maxLife: life
      });
    }
  };

  // --- RENDER TEXT HELPER (Retro Pixel Art Feel) ---
  const drawRetroText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, fontSize = 24, color = '#00f6ff', align: 'left' | 'center' | 'right' = 'center') => {
    ctx.font = `${fontSize}px 'Orbitron', 'JetBrains Mono', monospace`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0; // reset
  };

  // Handle ResizeObserver to scale canvas
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // Keep aspect ratio of 4:3
        const scaleW = width / VIRTUAL_WIDTH;
        const scaleH = height / VIRTUAL_HEIGHT;
        const finalScale = Math.min(scaleW, scaleH, 1.2); // cap max scale slightly for clarity
        setScale(finalScale);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Sync virtual dimension attributes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = VIRTUAL_WIDTH;
    canvas.height = VIRTUAL_HEIGHT;
  }, []);

  // Event Listeners for Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
      
      // Stop scrolling keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      // Handle pause toggling via key
      if (e.code === 'KeyP') {
        if (gameState === 'PLAYING') setGameState('PAUSED');
        else if (gameState === 'PAUSED') setGameState('PLAYING');
      }

      // Handle single-press event triggers
      if (gameState === 'START' && (e.code === 'Space' || e.code === 'Enter')) {
        startGame();
      }
      if (gameState === 'GAMEOVER' && (e.code === 'Space' || e.code === 'Enter')) {
        startGame();
      }

      // --- SNAKE CONTROLS ---
      if (gameMode === GameMode.SNAKE && gameState === 'PLAYING') {
        const currDir = snakeDir.current;
        if ((e.code === 'ArrowUp' || e.code === 'KeyW') && currDir.y === 0) {
          snakeNextDir.current = { x: 0, y: -1 };
        } else if ((e.code === 'ArrowDown' || e.code === 'KeyS') && currDir.y === 0) {
          snakeNextDir.current = { x: 0, y: 1 };
        } else if ((e.code === 'ArrowLeft' || e.code === 'KeyA') && currDir.x === 0) {
          snakeNextDir.current = { x: -1, y: 0 };
        } else if ((e.code === 'ArrowRight' || e.code === 'KeyD') && currDir.x === 0) {
          snakeNextDir.current = { x: 1, y: 0 };
        }
      }

      // --- BRICK BREAKER LAUNCH ---
      if (gameMode === GameMode.BRICK_BREAKER && gameState === 'PLAYING') {
        if (e.code === 'Space' && stickyBallAttached.current) {
          stickyBallAttached.current = false;
          // give a nice initial upward velocity
          balls.current.forEach(b => {
            if (b.vy === 0) {
              const speed = getSpeedMultiplier() * 5 + 4;
              b.vx = (Math.random() * 4 - 2);
              b.vy = -speed;
            }
          });
          triggerHit();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameMode, gameState]);

  // Virtual speed difficulty modifiers
  const getSpeedMultiplier = () => {
    if (difficulty === 'EASY') return 0.85;
    if (difficulty === 'HARD') return 1.25;
    return 1.0;
  };

  // --- INITIALIZE GAMES ---
  const startGame = () => {
    setScore(0);
    setGameState('PLAYING');
    particles.current = [];
    activePowerUps.current = {};
    combo.current = 1;
    comboTimer.current = 0;

    if (gameMode === GameMode.SNAKE) {
      // Init Snake in the center
      snake.current = [
        { x: 16, y: 12 },
        { x: 15, y: 12 },
        { x: 14, y: 12 }
      ];
      snakeDir.current = { x: 1, y: 0 };
      snakeNextDir.current = { x: 1, y: 0 };
      spawnSnakeFood();
      snakeMoveTimer.current = 0;
    } 
    else if (gameMode === GameMode.BRICK_BREAKER) {
      // Init Paddle & Ball
      paddle.current = { x: 340, y: 550, width: 120, height: 15 };
      balls.current = [{
        x: 400,
        y: 535,
        vx: 0,
        vy: 0,
        radius: 8
      }];
      stickyBallAttached.current = true;
      powerUps.current = [];
      laserBeams.current = [];

      // Generate Bricks Grid
      bricks.current = [];
      const rows = 5;
      const cols = 9;
      const bW = 74;
      const bH = 25;
      const startX = 60;
      const startY = 80;

      const colors = ['#ff0055', '#ff9f00', '#00f6ff', '#39ff14', '#bd00ff'];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Special explosive brick 10% chance
          const isExplosive = Math.random() < 0.12;
          bricks.current.push({
            x: startX + c * (bW + 8),
            y: startY + r * (bH + 8),
            width: bW,
            height: bH,
            color: isExplosive ? '#ffff00' : colors[r % colors.length],
            hitsRequired: isExplosive ? 1 : (r === 0 ? 3 : r < 3 ? 2 : 1),
            hitsLeft: isExplosive ? 1 : (r === 0 ? 3 : r < 3 ? 2 : 1),
            isExplosive
          });
        }
      }
    } 
    else if (gameMode === GameMode.SPACE_DODGE) {
      // Init Spaceship
      playerShip.current = {
        x: 375,
        y: 500,
        width: 50,
        height: 40,
        shield: 100,
        laserCooldown: 0
      };
      asteroids.current = [];
      spaceLasers.current = [];
      spaceCollectables.current = [];
      spaceTime.current = 0;
      spaceLaserStock.current = 100;
    }
  };

  // --- FOOD GENERATION (SNAKE) ---
  const spawnSnakeFood = () => {
    // Generate food at random cell avoiding snake segments
    let valid = false;
    let rx = 0;
    let ry = 0;
    while (!valid) {
      rx = Math.floor(Math.random() * 32);
      ry = Math.floor(Math.random() * 24);
      valid = !snake.current.some(seg => seg.x === rx && seg.y === ry);
    }
    const isGolden = Math.random() < 0.18; // 18% golden food chance
    snakeFood.current = {
      x: rx,
      y: ry,
      isGolden,
      pulseTimer: 0
    };
  };

  // --- GAME UPDATE ENGINE ---
  const updateGame = (dt: number) => {
    if (gameState !== 'PLAYING') return;

    // Tick down combo multiplier timer
    if (comboTimer.current > 0) {
      comboTimer.current -= dt;
      if (comboTimer.current <= 0) {
        combo.current = 1;
      }
    }

    // Update Particles
    particles.current.forEach((p, index) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        particles.current.splice(index, 1);
      }
    });

    if (gameMode === GameMode.SNAKE) {
      updateSnake(dt);
    } else if (gameMode === GameMode.BRICK_BREAKER) {
      updateBrickBreaker(dt);
    } else if (gameMode === GameMode.SPACE_DODGE) {
      updateSpaceDodge(dt);
    }
  };

  // --- UPDATE SNAKE GAME ---
  const updateSnake = (dt: number) => {
    // Determine movement tick based on score and difficulty
    const baseInterval = difficulty === 'EASY' ? 140 : difficulty === 'HARD' ? 70 : 100;
    // slightly speed up snake as score increases (caps at 40ms)
    const currentInterval = Math.max(40, baseInterval - Math.floor(score / 5) * 4);
    
    snakeMoveTimer.current += dt * 1000; // convert to ms

    // Pulse golden food
    if (snakeFood.current) {
      snakeFood.current.pulseTimer += dt * 5;
    }

    if (snakeMoveTimer.current >= currentInterval) {
      snakeMoveTimer.current = 0;

      // Update actual direction from buffer
      snakeDir.current = snakeNextDir.current;

      // Calculate head position
      const head = snake.current[0];
      let newHead = {
        x: head.x + snakeDir.current.x,
        y: head.y + snakeDir.current.y
      };

      // Border checking (wrap or collision depending on difficulty)
      if (difficulty === 'HARD') {
        // hard wall death
        if (newHead.x < 0 || newHead.x >= 32 || newHead.y < 0 || newHead.y >= 24) {
          triggerGameOver();
          return;
        }
      } else {
        // wrap borders
        if (newHead.x < 0) newHead.x = 31;
        if (newHead.x >= 32) newHead.x = 0;
        if (newHead.y < 0) newHead.y = 23;
        if (newHead.y >= 24) newHead.y = 0;
      }

      // Check self-collision
      const hitSelf = snake.current.some((seg, idx) => idx > 0 && seg.x === newHead.x && seg.y === newHead.y);
      if (hitSelf) {
        triggerGameOver();
        return;
      }

      // Insert new head segment
      snake.current.unshift(newHead);

      // Eat food check
      if (snakeFood.current && newHead.x === snakeFood.current.x && newHead.y === snakeFood.current.y) {
        const addedPoints = snakeFood.current.isGolden ? 30 : 10;
        setScore(prev => prev + addedPoints);
        
        if (snakeFood.current.isGolden) {
          triggerPowerUp();
          spawnExplosion(newHead.x * 25 + 12, newHead.y * 25 + 12, '#ffff00', 12, 4);
        } else {
          triggerHit();
          spawnExplosion(newHead.x * 25 + 12, newHead.y * 25 + 12, '#39ff14', 6, 2);
        }

        spawnSnakeFood();
      } else {
        // pop tail if didn't eat
        snake.current.pop();
      }
    }
  };

  // --- UPDATE BRICK BREAKER ---
  const updateBrickBreaker = (dt: number) => {
    const pad = paddle.current;
    const speedMult = getSpeedMultiplier();

    // 1. Move Paddle
    const pSpeed = 10 * speedMult;
    if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA'] || touchControlsRef.current.left) {
      pad.x = Math.max(0, pad.x - pSpeed);
    }
    if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD'] || touchControlsRef.current.right) {
      pad.x = Math.min(VIRTUAL_WIDTH - pad.width, pad.x + pSpeed);
    }

    // 2. Paddle lasers
    if (activePowerUps.current[PowerUpType.LASER]) {
      activePowerUps.current[PowerUpType.LASER]! -= dt;
      if (activePowerUps.current[PowerUpType.LASER]! <= 0) {
        delete activePowerUps.current[PowerUpType.LASER];
      } else {
        // Auto shoot lasers if holding space or touch
        if (Math.random() < 0.15) {
          laserBeams.current.push({
            x: pad.x + 15,
            y: pad.y,
            vx: 0,
            vy: -12,
            width: 4,
            height: 15
          });
          laserBeams.current.push({
            x: pad.x + pad.width - 15,
            y: pad.y,
            vx: 0,
            vy: -12,
            width: 4,
            height: 15
          });
          triggerLaser();
        }
      }
    }

    // 3. Move lasers and check collisions with bricks
    laserBeams.current.forEach((beam, bIdx) => {
      beam.y += beam.vy;
      // remove offscreen
      if (beam.y < 0) {
        laserBeams.current.splice(bIdx, 1);
        return;
      }

      // Hit bricks check
      bricks.current.forEach((br, rIdx) => {
        if (
          beam.x >= br.x && beam.x <= br.x + br.width &&
          beam.y >= br.y && beam.y <= br.y + br.height
        ) {
          // Hit brick!
          laserBeams.current.splice(bIdx, 1);
          damageBrick(rIdx);
        }
      });
    });

    // Handle Active Powerups Timers
    if (activePowerUps.current[PowerUpType.EXPAND]) {
      activePowerUps.current[PowerUpType.EXPAND]! -= dt;
      if (activePowerUps.current[PowerUpType.EXPAND]! <= 0) {
        delete activePowerUps.current[PowerUpType.EXPAND];
        pad.width = 120; // reset
      } else {
        pad.width = 180; // expanded size
      }
    }

    // 4. Update and move balls
    balls.current.forEach((b, ballIdx) => {
      if (stickyBallAttached.current) {
        // keep glued to center of paddle
        b.x = pad.x + pad.width / 2;
        b.y = pad.y - b.radius;
        return;
      }

      // Update position
      b.x += b.vx * speedMult;
      b.y += b.vy * speedMult;

      // Collide with left/right walls
      if (b.x - b.radius <= 0) {
        b.x = b.radius;
        b.vx = -b.vx;
        triggerHit();
      } else if (b.x + b.radius >= VIRTUAL_WIDTH) {
        b.x = VIRTUAL_WIDTH - b.radius;
        b.vx = -b.vx;
        triggerHit();
      }

      // Collide with ceiling
      if (b.y - b.radius <= 0) {
        b.y = b.radius;
        b.vy = -b.vy;
        triggerHit();
      }

      // Collide with Paddle
      if (
        b.y + b.radius >= pad.y &&
        b.y - b.radius <= pad.y + pad.height &&
        b.x >= pad.x &&
        b.x <= pad.x + pad.width
      ) {
        if (activePowerUps.current[PowerUpType.STICKY]) {
          stickyBallAttached.current = true;
          b.vx = 0;
          b.vy = 0;
        } else {
          // Bounce off paddle, factor angle by hit point
          const hitPoint = (b.x - pad.x) / pad.width; // 0 (left) to 1 (right)
          const bounceAngle = (hitPoint - 0.5) * (Math.PI / 2.5); // bounce spread
          const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
          b.vx = speed * Math.sin(bounceAngle);
          b.vy = -speed * Math.cos(bounceAngle);
          // adjust positioning to avoid multi-hitting
          b.y = pad.y - b.radius;
        }
        triggerHit();
        // combo restarts on paddle hit
        combo.current = 1;
      }

      // Collide with bricks
      bricks.current.forEach((br, brIdx) => {
        // AABB check with ball circle
        const closestX = Math.max(br.x, Math.min(b.x, br.x + br.width));
        const closestY = Math.max(br.y, Math.min(b.y, br.y + br.height));
        const distanceX = b.x - closestX;
        const distanceY = b.y - closestY;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;

        if (distanceSquared < b.radius * b.radius) {
          // Collision! Determine side of entry
          const overlapX = b.radius - Math.abs(distanceX);
          const overlapY = b.radius - Math.abs(distanceY);

          if (overlapX < overlapY) {
            b.vx = -b.vx;
            b.x += b.vx > 0 ? overlapX : -overlapX;
          } else {
            b.vy = -b.vy;
            b.y += b.vy > 0 ? overlapY : -overlapY;
          }

          damageBrick(brIdx);
        }
      });

      // Drop/loose ball if below bottom
      if (b.y - b.radius > VIRTUAL_HEIGHT) {
        balls.current.splice(ballIdx, 1);
      }
    });

    // Loose Game check if all balls lost
    if (balls.current.length === 0) {
      triggerGameOver();
      return;
    }

    // Win level check
    if (bricks.current.length === 0) {
      triggerVictory();
      return;
    }

    // 5. Update Falling Power-ups
    powerUps.current.forEach((p, pIdx) => {
      p.y += p.speed * speedMult;
      // remove offscreen
      if (p.y > VIRTUAL_HEIGHT) {
        powerUps.current.splice(pIdx, 1);
        return;
      }

      // Collect powerup check
      if (
        p.y + p.radius >= pad.y &&
        p.y - p.radius <= pad.y + pad.height &&
        p.x >= pad.x &&
        p.x <= pad.x + pad.width
      ) {
        powerUps.current.splice(pIdx, 1);
        applyPowerUp(p.type);
      }
    });
  };

  const damageBrick = (brIdx: number) => {
    const br = bricks.current[brIdx];
    br.hitsLeft--;
    
    // Add point
    const points = 10 * combo.current;
    setScore(prev => prev + points);
    
    // Increment combo
    combo.current++;
    comboTimer.current = 2.0; // 2 seconds to keep combo

    if (br.hitsLeft <= 0) {
      bricks.current.splice(brIdx, 1);
      triggerExplosion();
      spawnExplosion(br.x + br.width / 2, br.y + br.height / 2, br.color, 12, 4);

      // Handle explosive brick blast
      if (br.isExplosive) {
        const boomRadius = 120;
        const cX = br.x + br.width / 2;
        const cY = br.y + br.height / 2;
        
        // Destroy adjacent bricks in range
        bricks.current.forEach((otherBr, oIdx) => {
          const otherX = otherBr.x + otherBr.width / 2;
          const otherY = otherBr.y + otherBr.height / 2;
          const dist = Math.hypot(cX - otherX, cY - otherY);
          if (dist <= boomRadius) {
            // instant destroy
            setScore(prev => prev + 15 * combo.current);
            bricks.current.splice(oIdx, 1);
            spawnExplosion(otherX, otherY, otherBr.color, 8, 3);
          }
        });
      }

      // Maybe drop powerup (25% chance)
      if (Math.random() < 0.25) {
        const types = [PowerUpType.EXPAND, PowerUpType.STICKY, PowerUpType.MULTI_BALL, PowerUpType.LASER];
        const randomType = types[Math.floor(Math.random() * types.length)];
        powerUps.current.push({
          x: br.x + br.width / 2,
          y: br.y + br.height,
          type: randomType,
          radius: 12,
          speed: 3
        });
      }
    } else {
      triggerHit();
      // change color slightly on hit
      br.color = adjustColorBrightness(br.color, -30);
    }
  };

  const applyPowerUp = (type: PowerUpType) => {
    triggerPowerUp();
    spawnExplosion(paddle.current.x + paddle.current.width / 2, paddle.current.y, '#ffffff', 15, 5);

    if (type === PowerUpType.EXPAND) {
      activePowerUps.current[PowerUpType.EXPAND] = 12; // 12 seconds
    } else if (type === PowerUpType.STICKY) {
      activePowerUps.current[PowerUpType.STICKY] = 10; // 10 seconds
    } else if (type === PowerUpType.LASER) {
      activePowerUps.current[PowerUpType.LASER] = 8; // 8 seconds
    } else if (type === PowerUpType.MULTI_BALL) {
      // Spawn two more balls from the current ball's positions
      const currentBall = balls.current[0] || { x: 400, y: 300, vx: 2, vy: -4, radius: 8 };
      balls.current.push({
        x: currentBall.x,
        y: currentBall.y,
        vx: currentBall.vx + 2,
        vy: -Math.abs(currentBall.vy),
        radius: 8
      });
      balls.current.push({
        x: currentBall.x,
        y: currentBall.y,
        vx: currentBall.vx - 2,
        vy: -Math.abs(currentBall.vy),
        radius: 8
      });
    }
  };

  const adjustColorBrightness = (col: string, amt: number) => {
    let usePound = false;
    if (col[0] === "#") {
      col = col.slice(1);
      usePound = true;
    }
    const num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
  };

  // --- UPDATE SPACE DODGE ---
  const updateSpaceDodge = (dt: number) => {
    const ship = playerShip.current;
    const speedMult = getSpeedMultiplier();

    spaceTime.current += dt;

    // Tick laser cooldown
    if (ship.laserCooldown > 0) {
      ship.laserCooldown -= dt;
    }

    // 1. Move Spaceship left/right
    const shipSpeed = 9 * speedMult;
    if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA'] || touchControlsRef.current.left) {
      ship.x = Math.max(10, ship.x - shipSpeed);
    }
    if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD'] || touchControlsRef.current.right) {
      ship.x = Math.min(VIRTUAL_WIDTH - ship.width - 10, ship.x + shipSpeed);
    }

    // 2. Fire Laser beams
    if ((keysPressed.current['Space'] || touchControlsRef.current.action) && ship.laserCooldown <= 0 && spaceLaserStock.current > 0) {
      spaceLasers.current.push({
        x: ship.x + ship.width / 2,
        y: ship.y - 10,
        vx: 0,
        vy: -14
      });
      ship.laserCooldown = 0.15; // 150ms cooldown
      spaceLaserStock.current--;
      triggerLaser();
    }

    // 3. Spawning Asteroids & Collectables periodically
    // Spawn asteroid chance increases over survival time
    const spawnRate = Math.max(0.2, 1.2 - (spaceTime.current * 0.015)); // spawn more as time increases
    if (Math.random() < 0.05 / spawnRate) {
      // spawn asteroid
      const radius = Math.random() * 25 + 15;
      asteroids.current.push({
        x: Math.random() * (VIRTUAL_WIDTH - 60) + 30,
        y: -radius * 2,
        radius,
        speed: Math.random() * 4 + 2 + (spaceTime.current * 0.05),
        angle: Math.random() * Math.PI * 2,
        spin: Math.random() * 0.04 - 0.02,
        maxHits: radius > 30 ? 3 : radius > 20 ? 2 : 1,
        hitsLeft: radius > 30 ? 3 : radius > 20 ? 2 : 1,
      });
    }

    // Spawn collectable 2% chance per frame
    if (Math.random() < 0.015) {
      const types: Array<'SHIELD' | 'AMMO' | 'SCORE_MULTIPLIER'> = ['SHIELD', 'AMMO', 'SCORE_MULTIPLIER'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      spaceCollectables.current.push({
        x: Math.random() * (VIRTUAL_WIDTH - 40) + 20,
        y: -40,
        type: randomType,
        radius: 12,
        pulseTimer: 0
      });
    }

    // Pulse collectables animations
    spaceCollectables.current.forEach(col => {
      col.pulseTimer += dt * 5;
    });

    // 4. Move lasers and check asteroid hit
    spaceLasers.current.forEach((las, lIdx) => {
      las.y += las.vy;
      // remove offscreen
      if (las.y < 0) {
        spaceLasers.current.splice(lIdx, 1);
        return;
      }

      // collision with asteroid check
      asteroids.current.forEach((ast, aIdx) => {
        const dist = Math.hypot(las.x - ast.x, las.y - ast.y);
        if (dist <= ast.radius + 3) {
          // hit!
          spaceLasers.current.splice(lIdx, 1);
          ast.hitsLeft--;
          
          if (ast.hitsLeft <= 0) {
            // Asteroid destroyed
            asteroids.current.splice(aIdx, 1);
            triggerExplosion();
            spawnExplosion(ast.x, ast.y, '#9e9e9e', 12, 3);
            setScore(prev => prev + Math.floor(ast.radius) * combo.current);
            combo.current++;
            comboTimer.current = 3.0; // keep combo
          } else {
            triggerHit();
            spawnExplosion(las.x, las.y, '#e0e0e0', 3, 1.5);
          }
        }
      });
    });

    // 5. Move space collectables and collect them
    spaceCollectables.current.forEach((col, cIdx) => {
      col.y += 3 * speedMult;
      if (col.y > VIRTUAL_HEIGHT + 40) {
        spaceCollectables.current.splice(cIdx, 1);
        return;
      }

      // Collect check
      const dist = Math.hypot(col.x - (ship.x + ship.width / 2), col.y - (ship.y + ship.height / 2));
      if (dist <= col.radius + 25) {
        spaceCollectables.current.splice(cIdx, 1);
        triggerPowerUp();
        spawnExplosion(col.x, col.y, '#ffffff', 10, 4);

        if (col.type === 'SHIELD') {
          ship.shield = Math.min(100, ship.shield + 25);
        } else if (col.type === 'AMMO') {
          spaceLaserStock.current = Math.min(150, spaceLaserStock.current + 30);
        } else if (col.type === 'SCORE_MULTIPLIER') {
          setScore(prev => prev + 100);
          combo.current += 2;
          comboTimer.current = 4.0;
        }
      }
    });

    // 6. Move Asteroids and check collision with ship
    asteroids.current.forEach((ast, aIdx) => {
      ast.y += ast.speed * speedMult;
      ast.angle += ast.spin;

      // remove offscreen
      if (ast.y > VIRTUAL_HEIGHT + 40) {
        asteroids.current.splice(aIdx, 1);
        // loose survival points slightly for letting asteroids pass
        return;
      }

      // Ship collision check
      const dist = Math.hypot(ast.x - (ship.x + ship.width / 2), ast.y - (ship.y + ship.height / 2));
      if (dist <= ast.radius + 20) {
        asteroids.current.splice(aIdx, 1);
        triggerExplosion();
        spawnExplosion(ast.x, ast.y, '#ff4500', 15, 5);
        
        // Damage shield
        const damage = ast.radius > 30 ? 40 : ast.radius > 20 ? 25 : 15;
        ship.shield -= damage;
        combo.current = 1; // reset combo

        if (ship.shield <= 0) {
          triggerGameOver();
        }
      }
    });

    // Passive survival points
    if (Math.random() < 0.03) {
      setScore(prev => prev + 1 * combo.current);
    }
  };

  // --- GAME OVER ENGINE ---
  const triggerGameOver = () => {
    setGameState('GAMEOVER');
    playGameOver();
    checkAndSaveHighScore(score);
  };

  // --- BRICK BREAKER LEVEL CLEARED ---
  const triggerVictory = () => {
    setGameState('GAMEOVER');
    playVictory();
    // Award level clear bonus
    const bonus = 1000;
    setScore(prev => prev + bonus);
    checkAndSaveHighScore(score + bonus);
  };

  // --- ANIMATION CONTROLLERS ---
  useEffect(() => {
    let lastTime = 0;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const gameLoop = (time: number) => {
      if (lastTime === 0) lastTime = time;
      const dt = (time - lastTime) / 1000; // convert to seconds
      lastTime = time;

      // Cap dt to avoid huge lag steps when tab is unfocused
      const cappedDt = Math.min(dt, 0.1);

      updateGame(cappedDt);
      renderGame(ctx);

      requestRef.current = requestAnimationFrame(gameLoop);
    };

    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, gameMode, difficulty, score]);

  // --- CANVAS RENDERING LOGIC ---
  const renderGame = (ctx: CanvasRenderingContext2D) => {
    // 1. Clear with retro black grid/space
    ctx.fillStyle = '#0a0915';
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    // Draw scanline grid overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
    for (let y = 0; y < VIRTUAL_HEIGHT; y += 4) {
      ctx.fillRect(0, y, VIRTUAL_WIDTH, 1.5);
    }

    // --- RENDER SNAKE GAME ---
    if (gameMode === GameMode.SNAKE && gameState !== 'START') {
      // Draw grid borders subtly
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      // Draw Food
      if (snakeFood.current) {
        const f = snakeFood.current;
        const radius = f.isGolden ? 12 + Math.sin(f.pulseTimer) * 2 : 10;
        ctx.beginPath();
        ctx.arc(f.x * 25 + 12.5, f.y * 25 + 12.5, radius, 0, Math.PI * 2);
        ctx.fillStyle = f.isGolden ? '#ffff00' : '#ff0055';
        ctx.shadowColor = f.isGolden ? '#ffff00' : '#ff0055';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw Snake segments
      snake.current.forEach((seg, idx) => {
        ctx.fillStyle = idx === 0 ? '#39ff14' : '#1d8a0c';
        ctx.strokeStyle = '#0a0915';
        ctx.lineWidth = 1.5;
        
        ctx.shadowColor = idx === 0 ? '#39ff14' : 'transparent';
        ctx.shadowBlur = idx === 0 ? 10 : 0;
        
        // rounded segment box
        const pad = 2;
        ctx.fillRect(seg.x * 25 + pad, seg.y * 25 + pad, 25 - pad*2, 25 - pad*2);
        ctx.strokeRect(seg.x * 25 + pad, seg.y * 25 + pad, 25 - pad*2, 25 - pad*2);
        
        ctx.shadowBlur = 0; // reset
      });
    }

    // --- RENDER BRICK BREAKER ---
    if (gameMode === GameMode.BRICK_BREAKER && gameState !== 'START') {
      const pad = paddle.current;

      // Draw Paddle
      ctx.fillStyle = '#00f6ff';
      ctx.shadowColor = '#00f6ff';
      ctx.shadowBlur = 10;
      ctx.fillRect(pad.x, pad.y, pad.width, pad.height);
      ctx.shadowBlur = 0;

      // Draw Laser indicators if loaded
      if (activePowerUps.current[PowerUpType.LASER]) {
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(pad.x + 8, pad.y - 6, 6, 6);
        ctx.fillRect(pad.x + pad.width - 14, pad.y - 6, 6, 6);
      }

      // Draw Laser Beams
      ctx.fillStyle = '#ff0055';
      laserBeams.current.forEach(beam => {
        ctx.fillRect(beam.x, beam.y, beam.width, beam.height);
      });

      // Draw Bricks
      bricks.current.forEach(br => {
        ctx.fillStyle = br.color;
        ctx.fillRect(br.x, br.y, br.width, br.height);
        
        // Draw inner outline for 3D look
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.strokeRect(br.x, br.y, br.width, br.height);

        // Render hits count inside if multiple hits
        if (br.hitsRequired > 1) {
          ctx.fillStyle = '#ffffff';
          ctx.font = "12px 'JetBrains Mono', monospace";
          ctx.textAlign = 'center';
          ctx.fillText(String(br.hitsLeft), br.x + br.width/2, br.y + br.height/2 + 4);
        }
      });

      // Draw Power-ups
      powerUps.current.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        
        let col = '#00f6ff';
        if (p.type === PowerUpType.STICKY) col = '#39ff14';
        if (p.type === PowerUpType.MULTI_BALL) col = '#bd00ff';
        if (p.type === PowerUpType.LASER) col = '#ff0055';

        ctx.fillStyle = col;
        ctx.shadowColor = col;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label initial
        ctx.fillStyle = '#0a0915';
        ctx.font = "bold 12px 'Orbitron', monospace";
        ctx.textAlign = 'center';
        ctx.fillText(p.type[0], p.x, p.y + 4);
      });

      // Draw Balls
      balls.current.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    }

    // --- RENDER SPACE DODGE ---
    if (gameMode === GameMode.SPACE_DODGE && gameState !== 'START') {
      const ship = playerShip.current;

      // Draw Ship (Cool triangle polygon)
      ctx.beginPath();
      ctx.moveTo(ship.x + ship.width / 2, ship.y);
      ctx.lineTo(ship.x + ship.width, ship.y + ship.height);
      ctx.lineTo(ship.x, ship.y + ship.height);
      ctx.closePath();
      
      ctx.fillStyle = '#39ff14';
      ctx.shadowColor = '#39ff14';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Ship details
      ctx.fillStyle = '#0a0915';
      ctx.fillRect(ship.x + ship.width / 2 - 2, ship.y + 15, 4, 15);

      // Draw Space Lasers
      ctx.fillStyle = '#00f6ff';
      ctx.shadowColor = '#00f6ff';
      ctx.shadowBlur = 8;
      spaceLasers.current.forEach(las => {
        ctx.fillRect(las.x - 2, las.y, 4, 15);
      });
      ctx.shadowBlur = 0;

      // Draw Asteroids
      asteroids.current.forEach(ast => {
        ctx.save();
        ctx.translate(ast.x, ast.y);
        ctx.rotate(ast.angle);
        
        ctx.beginPath();
        // jagged polygon drawing for asteroids
        ctx.fillStyle = '#7d7a8d';
        ctx.strokeStyle = '#3e3a47';
        ctx.lineWidth = 2;
        
        const points = 8;
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const factor = 0.8 + Math.sin(angle * 3) * 0.15; // rock texture variation
          const r = ast.radius * factor;
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });

      // Draw Space Collectables
      spaceCollectables.current.forEach(col => {
        const radius = col.radius + Math.sin(col.pulseTimer) * 2;
        ctx.beginPath();
        ctx.arc(col.x, col.y, radius, 0, Math.PI * 2);
        
        let fillStyle = '#39ff14'; // SHIELD
        if (col.type === 'AMMO') fillStyle = '#ffff00';
        if (col.type === 'SCORE_MULTIPLIER') fillStyle = '#bd00ff';

        ctx.fillStyle = fillStyle;
        ctx.shadowColor = fillStyle;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label letter
        ctx.fillStyle = '#0a0915';
        ctx.font = "bold 11px 'Orbitron', monospace";
        ctx.textAlign = 'center';
        ctx.fillText(col.type[0], col.x, col.y + 4);
      });

      // Render HUD in bottom screen
      // Shield bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(20, VIRTUAL_HEIGHT - 35, 150, 15);
      const shieldCol = ship.shield > 50 ? '#39ff14' : ship.shield > 20 ? '#ff9f00' : '#ff0055';
      ctx.fillStyle = shieldCol;
      ctx.fillRect(20, VIRTUAL_HEIGHT - 35, (ship.shield / 100) * 150, 15);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(20, VIRTUAL_HEIGHT - 35, 150, 15);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = "11px 'Orbitron', monospace";
      ctx.textAlign = 'left';
      ctx.fillText(`ESCUDO: ${Math.max(0, Math.floor(ship.shield))}%`, 20, VIRTUAL_HEIGHT - 42);

      // Ammo count
      ctx.textAlign = 'right';
      ctx.fillText(`LÁSER: ${spaceLaserStock.current}`, VIRTUAL_WIDTH - 20, VIRTUAL_HEIGHT - 25);
    }

    // --- DRAW GENERAL PARTICLES ---
    particles.current.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    });

    // --- DRAW COMBO FLOATER HUD ---
    if (combo.current > 1) {
      ctx.fillStyle = '#ffff00';
      ctx.font = "bold 16px 'Orbitron', monospace";
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 8;
      ctx.fillText(`COMBO x${combo.current}`, VIRTUAL_WIDTH / 2, 40);
      ctx.shadowBlur = 0;
    }

    // --- STATE SCREENS OVERLAYS (START, GAMEOVER, PAUSED) ---
    if (gameState === 'START') {
      // Blur overlay
      ctx.fillStyle = 'rgba(10, 9, 21, 0.85)';
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      drawRetroText(ctx, 'G-RAMOS RETRO ARCADE', VIRTUAL_WIDTH / 2, 180, 36, '#ff0055');
      drawRetroText(ctx, `JUEGO: ${getGameModeLabel()}`, VIRTUAL_WIDTH / 2, 240, 24, '#00f6ff');
      
      drawRetroText(ctx, `DIFICULTAD: ${difficulty}`, VIRTUAL_WIDTH / 2, 290, 18, '#39ff14');
      
      drawRetroText(ctx, 'PRESIONA ENTER O ESPACIO PARA INICIAR', VIRTUAL_WIDTH / 2, 380, 18, '#ffffff');
      drawRetroText(ctx, 'Controles: Teclas de dirección / WASD y Barra Espaciadora', VIRTUAL_WIDTH / 2, 440, 14, '#8a8897');
    } 
    else if (gameState === 'GAMEOVER') {
      ctx.fillStyle = 'rgba(10, 9, 21, 0.9)';
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      drawRetroText(ctx, 'FIN DEL JUEGO', VIRTUAL_WIDTH / 2, 200, 48, '#ff0055');
      drawRetroText(ctx, `PUNTUACIÓN FINAL: ${score}`, VIRTUAL_WIDTH / 2, 280, 28, '#ffff00');
      
      drawRetroText(ctx, 'PRESIONA ENTER O ESPACIO PARA VOLVER A JUGAR', VIRTUAL_WIDTH / 2, 380, 18, '#ffffff');
      drawRetroText(ctx, 'O cambia de modo de juego en el panel lateral', VIRTUAL_WIDTH / 2, 430, 14, '#8a8897');
    } 
    else if (gameState === 'PAUSED') {
      ctx.fillStyle = 'rgba(10, 9, 21, 0.75)';
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      drawRetroText(ctx, 'JUEGO EN PAUSA', VIRTUAL_WIDTH / 2, 260, 40, '#00f6ff');
      drawRetroText(ctx, 'PRESIONA "P" PARA CONTINUAR', VIRTUAL_WIDTH / 2, 330, 18, '#ffffff');
    }
  };

  const getGameModeLabel = () => {
    if (gameMode === GameMode.SNAKE) return 'LA SERPIENTE';
    if (gameMode === GameMode.BRICK_BREAKER) return 'ROMPE LADRILLOS (OPCIÓN B)';
    if (gameMode === GameMode.SPACE_DODGE) return 'ESQUIVA ESPACIAL';
    return '';
  };

  // virtual directional controls helper
  const handleTouchControl = (dir: 'left' | 'right' | 'up' | 'down' | 'action', active: boolean) => {
    touchControlsRef.current[dir] = active;

    // Trigger directional changes instantly for Snake on touch
    if (gameMode === GameMode.SNAKE && gameState === 'PLAYING' && active) {
      const currDir = snakeDir.current;
      if (dir === 'up' && currDir.y === 0) snakeNextDir.current = { x: 0, y: -1 };
      if (dir === 'down' && currDir.y === 0) snakeNextDir.current = { x: 0, y: 1 };
      if (dir === 'left' && currDir.x === 0) snakeNextDir.current = { x: -1, y: 0 };
      if (dir === 'right' && currDir.x === 0) snakeNextDir.current = { x: 1, y: 0 };
    }

    // Trigger actions on single touch start
    if (gameState === 'PLAYING') {
      if (gameMode === GameMode.BRICK_BREAKER && dir === 'action' && active && stickyBallAttached.current) {
        stickyBallAttached.current = false;
        balls.current.forEach(b => {
          if (b.vy === 0) {
            const speed = getSpeedMultiplier() * 5 + 4;
            b.vx = (Math.random() * 4 - 2);
            b.vy = -speed;
          }
        });
        triggerHit();
      }
    } else if (active && (gameState === 'START' || gameState === 'GAMEOVER')) {
      startGame();
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full justify-between">
      {/* Game Stage Area */}
      <div 
        ref={containerRef}
        className="relative flex items-center justify-center w-full h-full bg-[#05050d] rounded-2xl border-4 border-[#252345] shadow-[0_0_40px_rgba(37,35,69,0.5)] overflow-hidden"
        style={{ minHeight: '380px', maxHeight: '540px' }}
      >
        {/* Glow corner decorations */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#ff0055] opacity-80"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#ff0055] opacity-80"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#ff0055] opacity-80"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#ff0055] opacity-80"></div>

        {/* Real Dynamic Canvas */}
        <canvas
          id="arcade-canvas"
          ref={canvasRef}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.1s ease-out'
          }}
          className="bg-black shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]"
        />

        {/* Scanlines Screen Filter overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-rgba(255,255,255,0.015) to-transparent z-10 pointer-events-none" />
        {/* Subtle glass reflection overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/2 to-transparent z-10" />
      </div>

      {/* On-Screen Touch D-PAD & Buttons for Mobile Responsiveness */}
      <div className="grid grid-cols-2 gap-4 w-full px-4 py-2 mt-2 select-none md:hidden z-20">
        {/* Virtual Arrow D-PAD */}
        <div className="flex flex-col items-center justify-center">
          <div className="grid grid-cols-3 gap-1 w-28 h-28">
            <div />
            <button 
              onTouchStart={() => handleTouchControl('up', true)}
              onTouchEnd={() => handleTouchControl('up', false)}
              onMouseDown={() => handleTouchControl('up', true)}
              onMouseUp={() => handleTouchControl('up', false)}
              className="w-9 h-9 bg-[#1e1c3a] border border-[#ff0055] active:bg-[#ff0055] text-white flex items-center justify-center rounded-lg font-bold shadow-[0_0_10px_rgba(255,0,85,0.3)]"
            >
              ▲
            </button>
            <div />
            <button 
              onTouchStart={() => handleTouchControl('left', true)}
              onTouchEnd={() => handleTouchControl('left', false)}
              onMouseDown={() => handleTouchControl('left', true)}
              onMouseUp={() => handleTouchControl('left', false)}
              className="w-9 h-9 bg-[#1e1c3a] border border-[#ff0055] active:bg-[#ff0055] text-white flex items-center justify-center rounded-lg font-bold shadow-[0_0_10px_rgba(255,0,85,0.3)]"
            >
              ◀
            </button>
            <div className="w-9 h-9 bg-[#2a2654]/40 rounded-lg" />
            <button 
              onTouchStart={() => handleTouchControl('right', true)}
              onTouchEnd={() => handleTouchControl('right', false)}
              onMouseDown={() => handleTouchControl('right', true)}
              onMouseUp={() => handleTouchControl('right', false)}
              className="w-9 h-9 bg-[#1e1c3a] border border-[#ff0055] active:bg-[#ff0055] text-white flex items-center justify-center rounded-lg font-bold shadow-[0_0_10px_rgba(255,0,85,0.3)]"
            >
              ▶
            </button>
            <div />
            <button 
              onTouchStart={() => handleTouchControl('down', true)}
              onTouchEnd={() => handleTouchControl('down', false)}
              onMouseDown={() => handleTouchControl('down', true)}
              onMouseUp={() => handleTouchControl('down', false)}
              className="w-9 h-9 bg-[#1e1c3a] border border-[#ff0055] active:bg-[#ff0055] text-white flex items-center justify-center rounded-lg font-bold shadow-[0_0_10px_rgba(255,0,85,0.3)]"
            >
              ▼
            </button>
            <div />
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-center">
          <button 
            onTouchStart={() => handleTouchControl('action', true)}
            onTouchEnd={() => handleTouchControl('action', false)}
            onMouseDown={() => handleTouchControl('action', true)}
            onMouseUp={() => handleTouchControl('action', false)}
            className="w-20 h-20 bg-[#ff0055] border-2 border-white rounded-full active:bg-[#00f6ff] active:shadow-[0_0_30px_#00f6ff] text-white font-bold text-sm tracking-wider shadow-[0_0_20px_rgba(255,0,85,0.6)] flex items-center justify-center"
          >
            DISPARO
          </button>
        </div>
      </div>
    </div>
  );
}
