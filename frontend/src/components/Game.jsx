import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BananaMath from './BananaMath';
import { scoresAPI } from '../services/api';

// --- GAME CONSTANTS ---
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const BASKET_WIDTH = 180;
const BASKET_HEIGHT = 80;
const ITEM_SIZE = 40;
const INITIAL_FALL_SPEED = 2;
const BASKET_SPEED = 3;
const INITIAL_SPAWN_RATE = 2000;
const SPEED_INCREASE_INTERVAL = 20000; // 20 seconds

// --- FIX 1 & 2: GAMEPLAY FAIRNESS CONSTANTS ---
const HORIZONTAL_SPAWN_PADDING = 30;
const BASKET_HITBOX_INSET = 40;

// --- STYLING OBJECT ---
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: `${GAME_WIDTH}px`,
    marginBottom: '20px',
    background: 'rgba(255, 255, 255, 0.95)',
    padding: '15px 25px',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  },
  statsContainer: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  stat: {
    textAlign: 'center',
  },
  statLabel: {
    fontSize: '12px',
    color: '#95A5A6',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  lives: {
    fontSize: '28px',
  },
  gameCanvas: {
    border: '5px solid white',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    background: 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%)',
    position: 'relative',
    cursor: 'none',
  },
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '15px',
    zIndex: 100,
  },
  pauseTitle: {
    fontSize: '48px',
    color: 'white',
    marginBottom: '30px',
    textShadow: '0 3px 5px rgba(0,0,0,0.5)',
  },
  gameOverOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  gameOverModal: {
    background: 'white',
    borderRadius: '25px',
    padding: '40px',
    textAlign: 'center',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  },
  gameOverTitle: {
    fontSize: '48px',
    marginBottom: '20px',
    color: '#0c0c0cff',
  },
  finalScore: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#313130ff',
    marginBottom: '30px',
  },
  gameOverStats: {
    background: '#f1f1f1',
    padding: '20px',
    borderRadius: '15px',
    marginBottom: '30px',
    color: '#080808ff',
  },
  gameOverStat: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    fontSize: '16px',
  },
  gameButton: {
    padding: '12px 20px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    textShadow: '0 1px 1px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  greenButton: { background: '#58B464', boxShadow: '0 5px 0 #3E8E41' },
  redButton: { background: '#FF6B6B', boxShadow: '0 5px 0 #E55353' },
  yellowButton: { background: '#FFD93D', boxShadow: '0 5px 0 #F7C00D', color: '#333' },
  blueButton: { background: '#4A90E2', boxShadow: '0 5px 0 #357ABD' },
  modalButtonsContainer: { display: 'flex', gap: '15px' },
  pauseButtonsContainer: { display: 'flex', flexDirection: 'column', gap: '15px', width: '250px' },
};

function Game({ user }) {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [bananasCollected, setBananasCollected] = useState(0);
  const [missedBananas, setMissedBananas] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showMath, setShowMath] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  
  const gameStateRef = useRef({
    basketX: GAME_WIDTH / 2 - BASKET_WIDTH / 2,
    fallingItems: [],
    keys: {},
    fallSpeed: INITIAL_FALL_SPEED,
    spawnRate: INITIAL_SPAWN_RATE,
    lastSpawn: 0,
    animationId: null,
    startTime: Date.now(),
  });

  const ITEM_TYPES = {
    BANANA: { emoji: '🍌', points: 10, isBad: false },
    BOMB: { emoji: '💣', points: 0, isBad: true },
    ROCK: { emoji: '🪨', points: 0, isBad: true },
  };

  const spawnItem = useCallback(() => {
    const random = Math.random();
    const type = random < 0.7 ? 'BANANA' : random < 0.85 ? 'BOMB' : 'ROCK';
    const spawnAreaWidth = GAME_WIDTH - ITEM_SIZE - (2 * HORIZONTAL_SPAWN_PADDING);
    
    gameStateRef.current.fallingItems.push({
      id: Date.now() + Math.random(),
      type,
      x: HORIZONTAL_SPAWN_PADDING + Math.random() * spawnAreaWidth,
      y: -ITEM_SIZE,
      speed: gameStateRef.current.fallSpeed + (Math.random() * 2 - 1),
    });
  }, []);

  const checkCollision = useCallback((item) => {
    const basketX = gameStateRef.current.basketX;
    const basketY = GAME_HEIGHT - BASKET_HEIGHT - 10;
    const effectiveBasketX = basketX + BASKET_HITBOX_INSET;
    const effectiveBasketWidth = BASKET_WIDTH - (2 * BASKET_HITBOX_INSET);

    return (
      item.x < effectiveBasketX + effectiveBasketWidth &&
      item.x + ITEM_SIZE > effectiveBasketX &&
      item.y < basketY + BASKET_HEIGHT &&
      item.y + ITEM_SIZE > basketY
    );
  }, []);

  const handleItemCaught = useCallback((item) => {
    if (ITEM_TYPES[item.type].isBad) {
      setShowMath(true);
      setIsPaused(true);
    } else {
      setScore(prev => prev + ITEM_TYPES[item.type].points + (level * 2));
      setBananasCollected(prev => prev + 1);
    }
  }, [level]);

  const handleMissedBanana = useCallback(() => {
    setMissedBananas(prev => prev + 1);
    setLives(currentLives => {
      const newLives = currentLives - 1;
      if (newLives <= 0) setGameOver(true);
      return newLives;
    });
  }, []);

  const gameLoop = useCallback(() => {
    if (isPaused || gameOver) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, GAME_HEIGHT - 20, GAME_WIDTH, 20);
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, GAME_HEIGHT - 25, GAME_WIDTH, 5);

    if (gameStateRef.current.keys['ArrowLeft'] || gameStateRef.current.keys['a']) {
      gameStateRef.current.basketX = Math.max(0, gameStateRef.current.basketX - BASKET_SPEED);
    }
    if (gameStateRef.current.keys['ArrowRight'] || gameStateRef.current.keys['d']) {
      gameStateRef.current.basketX = Math.min(GAME_WIDTH - BASKET_WIDTH, gameStateRef.current.basketX + BASKET_SPEED);
    }

    ctx.font = `${BASKET_HEIGHT}px Arial`;
    ctx.fillText('🧺', gameStateRef.current.basketX, GAME_HEIGHT - 10);

    const now = Date.now();
    if (now - gameStateRef.current.lastSpawn > gameStateRef.current.spawnRate) {
      spawnItem();
      gameStateRef.current.lastSpawn = now;
    }

    gameStateRef.current.fallingItems = gameStateRef.current.fallingItems.filter(item => {
      item.y += item.speed;
      if (checkCollision(item)) {
        handleItemCaught(item);
        return false;
      }
      if (item.y > GAME_HEIGHT) {
        if (item.type === 'BANANA') handleMissedBanana();
        return false;
      }
      ctx.font = `${ITEM_SIZE}px Arial`;
      ctx.fillText(ITEM_TYPES[item.type].emoji, item.x, item.y + ITEM_SIZE);
      return true;
    });

    gameStateRef.current.animationId = requestAnimationFrame(gameLoop);
  }, [isPaused, gameOver, spawnItem, checkCollision, handleItemCaught, handleMissedBanana]);

  useEffect(() => {
    const handleKey = (e, isDown) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key)) {
        e.preventDefault();
        gameStateRef.current.keys[e.key] = isDown;
      }
    };
    const handleKeyDown = (e) => {
      handleKey(e, true);
      if (e.key.toLowerCase() === 'p' && !showMath) setIsPaused(p => !p);
    };
    const handleKeyUp = (e) => handleKey(e, false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [showMath]);

  useEffect(() => {
    if (!isPaused && !gameOver) {
      gameStateRef.current.animationId = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(gameStateRef.current.animationId);
  }, [isPaused, gameOver, gameLoop]);

  useEffect(() => {
    if (gameOver || isPaused) return;
    const interval = setInterval(() => {
      setLevel(prev => prev + 1);
      gameStateRef.current.fallSpeed += 0.5;
      gameStateRef.current.spawnRate = Math.max(500, gameStateRef.current.spawnRate - 100);
    }, SPEED_INCREASE_INTERVAL);
    return () => clearInterval(interval);
  }, [gameOver, isPaused]);
  
  useEffect(() => {
    if (gameOver || isPaused) return;
    const interval = setInterval(() => {
      setGameTime(Math.floor((Date.now() - gameStateRef.current.startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [gameOver, isPaused]);

  useEffect(() => {
    if (gameOver) {
      submitScore();
    }
  }, [gameOver]);
  
  const submitScore = useCallback(async () => {
    if (score <= 0) return;
    try {
      const response = await scoresAPI.submitScore({ 
        score, 
        bananasCollected, 
        livesUsed: 3 - lives, 
        gameLevel: level, 
        gameDuration: gameTime 
      });
      
      // Check if this was a new high score from the server response
      if (response.data?.isNewHighScore) {
        setIsNewHighScore(true);
      }
      
      // Update user stats in parent component
      if (window.updateUserStats) {
        window.updateUserStats();
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  }, [score, bananasCollected, lives, level, gameTime]);

  const handleMathSuccess = () => {
    setShowMath(false);
    setIsPaused(false);
    setLives(prev => Math.min(prev + 1, 5));
  };
  
  const handleMathFailure = () => {
    setShowMath(false);
    setIsPaused(false);
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) setGameOver(true);
      return newLives;
    });
  };
  
  const handleMathSkip = () => {
    setShowMath(false);
    setGameOver(true);
  };
  
  const handlePlayAgain = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setBananasCollected(0);
    setMissedBananas(0);
    setGameTime(0);
    setGameOver(false);
    setIsPaused(false);
    setIsNewHighScore(false);
    gameStateRef.current = {
      ...gameStateRef.current,
      basketX: GAME_WIDTH / 2 - BASKET_WIDTH / 2,
      fallingItems: [],
      keys: {},
      fallSpeed: INITIAL_FALL_SPEED,
      spawnRate: INITIAL_SPAWN_RATE,
      startTime: Date.now(),
    };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleButtonHover = (e, hover) => e.target.style.transform = hover ? 'translateY(-2px)' : 'translateY(0)';
  const handleButtonPress = (e, pressed, shadowColor) => {
    e.target.style.transform = pressed ? 'translateY(2px)' : 'translateY(-2px)';
    e.target.style.boxShadow = pressed ? `0 2px 0 ${shadowColor}` : `0 5px 0 ${shadowColor}`;
  };

  const currentHighScore = user?.highestScore ?? 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.statsContainer}>
          <div style={styles.stat}><div style={styles.statLabel}>Score</div><div style={styles.statValue}>{score}</div></div>
          <div style={styles.stat}><div style={styles.statLabel}>Level</div><div style={styles.statValue}>{level}</div></div>
          <div style={styles.stat}><div style={styles.statLabel}>Bananas</div><div style={styles.statValue}>🍌 {bananasCollected}</div></div>
          <div style={styles.stat}><div style={styles.statLabel}>Time</div><div style={styles.statValue}>{formatTime(gameTime)}</div></div>
          <div style={styles.stat}><div style={styles.statLabel}>Lives</div><div style={styles.lives}>{'❤️'.repeat(Math.max(0, lives))}{'🖤'.repeat(Math.max(0, 3 - lives))}</div></div>
        </div>
        <button style={{ ...styles.gameButton, ...styles.yellowButton }} onClick={() => setIsPaused(!isPaused)} onMouseEnter={(e) => handleButtonHover(e, true)} onMouseLeave={(e) => handleButtonHover(e, false)} onMouseDown={(e) => handleButtonPress(e, true, '#F7C00D')} onMouseUp={(e) => handleButtonPress(e, false, '#F7C00D')}>
          {isPaused ? '▶️' : '⏸️'}<span>{isPaused ? 'Resume' : 'Pause'}</span>
        </button>
      </div>

      <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} style={styles.gameCanvas} />

      {isPaused && !showMath && (
        <div style={styles.pauseOverlay}>
          <div style={styles.pauseTitle}>PAUSED</div>
          <div style={styles.pauseButtonsContainer}>
            <button style={{ ...styles.gameButton, ...styles.greenButton }} onClick={() => setIsPaused(false)} onMouseEnter={(e) => handleButtonHover(e, true)} onMouseLeave={(e) => handleButtonHover(e, false)} onMouseDown={(e) => handleButtonPress(e, true, '#3E8E41')} onMouseUp={(e) => handleButtonPress(e, false, '#3E8E41')}>▶️<span>Resume</span></button>
            <button style={{ ...styles.gameButton, ...styles.redButton }} onClick={() => navigate('/')} onMouseEnter={(e) => handleButtonHover(e, true)} onMouseLeave={(e) => handleButtonHover(e, false)} onMouseDown={(e) => handleButtonPress(e, true, '#E55353')} onMouseUp={(e) => handleButtonPress(e, false, '#E55353')}>🚪<span>Quit</span></button>
          </div>
        </div>
      )}

      {showMath && (<BananaMath onSuccess={handleMathSuccess} onFailure={handleMathFailure} onSkip={handleMathSkip} />)}

      {gameOver && (
        <div style={styles.gameOverOverlay}>
          <div style={styles.gameOverModal}>
            <div style={styles.gameOverTitle}>{isNewHighScore ? '🎉 NEW HIGH SCORE! 🎉' : '💔 Game Over'}</div>
            <div style={styles.finalScore}>Final Score: {score}</div>
            <div style={styles.gameOverStats}>
              <div style={styles.gameOverStat}><span>🍌 Bananas Collected:</span><strong>{bananasCollected}</strong></div>
              <div style={styles.gameOverStat}><span>😢 Bananas Missed:</span><strong>{missedBananas}</strong></div>
              <div style={styles.gameOverStat}><span>📊 Level Reached:</span><strong>{level}</strong></div>
              <div style={styles.gameOverStat}><span>⏱️ Time Played:</span><strong>{formatTime(gameTime)}</strong></div>
              <div style={styles.gameOverStat}><span>🏆 Your Best:</span><strong>{isNewHighScore ? score : currentHighScore}</strong></div>
            </div>
            <div style={styles.modalButtonsContainer}>
              <button style={{ flex: 1, ...styles.gameButton, ...styles.greenButton }} onClick={handlePlayAgain} onMouseEnter={(e) => handleButtonHover(e, true)} onMouseLeave={(e) => handleButtonHover(e, false)} onMouseDown={(e) => handleButtonPress(e, true, '#3E8E41')} onMouseUp={(e) => handleButtonPress(e, false, '#3E8E41')}>🎮 Play Again</button>
              <button style={{ flex: 1, ...styles.gameButton, ...styles.blueButton }} onClick={() => navigate('/leaderboard')} onMouseEnter={(e) => handleButtonHover(e, true)} onMouseLeave={(e) => handleButtonHover(e, false)} onMouseDown={(e) => handleButtonPress(e, true, '#357ABD')} onMouseUp={(e) => handleButtonPress(e, false, '#357ABD')}>🏆 Leaderboard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;