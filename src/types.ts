export enum GameMode {
  SNAKE = 'SNAKE',
  BRICK_BREAKER = 'BRICK_BREAKER',
  SPACE_DODGE = 'SPACE_DODGE',
}

export interface HighScore {
  gameMode: GameMode;
  score: number;
  playerName: string;
  date: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
}

// Snake types
export interface SnakeSegment {
  x: number;
  y: number;
}

export interface SnakeFood {
  x: number;
  y: number;
  isGolden: boolean;
  pulseTimer: number;
}

// Brick Breaker types
export interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  hitsRequired: number;
  hitsLeft: number;
  isExplosive?: boolean;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export enum PowerUpType {
  EXPAND = 'EXPAND',      // Larger paddle
  STICKY = 'STICKY',      // Catch ball
  MULTI_BALL = 'MULTI_BALL', // Extra balls
  LASER = 'LASER',        // Paddle shoots laser
}

export interface PowerUp {
  x: number;
  y: number;
  type: PowerUpType;
  radius: number;
  speed: number;
}

export interface LaserBeam {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
}

// Space Dodge types
export interface PlayerShip {
  x: number;
  y: number;
  width: number;
  height: number;
  shield: number;
  laserCooldown: number;
}

export interface Asteroid {
  x: number;
  y: number;
  radius: number;
  speed: number;
  angle: number;
  spin: number;
  maxHits: number;
  hitsLeft: number;
}

export interface SpaceLaser {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface SpaceCollectable {
  x: number;
  y: number;
  type: 'SHIELD' | 'AMMO' | 'SCORE_MULTIPLIER';
  radius: number;
  pulseTimer: number;
}
