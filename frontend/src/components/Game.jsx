import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BananaMath from './BananaMath';
import { scoresAPI, bananaAPI } from '../services/api';

// [VERSION CONTROL] Game difficulty constants and mechanics
// Speed increases every 20 seconds to raise difficulty
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const BASKET_WIDTH = 100;
const BASKET_HEIGHT = 80;
const ITEM_SIZE = 40;
const INITIAL_FALL_SPEED = 2;
const BASKET_SPEED = 3;
const INITIAL_SPAWN_RATE = 2000;
const SPEED_INCREASE_INTERVAL = 20000; // [EXPLAIN: 20 second level up difficulty]

// [GAME LOGIC] collision detection adjustments
const HORIZONTAL_SPAWN_PADDING = 30;
const BASKET_HITBOX_INSET = 10;

// --- STYLING OBJECT ---
const styles = {
  container: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px', // Reduced padding
    position: 'relative',
    overflow: 'hidden', // Prevent scrolling
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: `${GAME_WIDTH}px`,
    marginBottom: '20px',
    padding: '15px 25px',
    borderRadius: '20px',
    background: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
  },
  statsContainer: {
    display: 'flex',
    gap: '25px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  stat: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: '12px',
    color: '#FFD700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '700',
    marginBottom: '2px',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#FFFFFF',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  },
  lives: {
    fontSize: '24px',
    filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))',
  },
  gameCanvas: {
    borderRadius: '20px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
    background: 'rgba(0, 0, 0, 0.2)', // Semi-transparent
    backdropFilter: 'blur(5px)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    cursor: 'none',
    maxWidth: '100%',
    maxHeight: '75vh', // Ensure it fits vertically with header
    width: 'auto', // Allow aspect ratio scaling
    height: 'auto', // Allow aspect ratio scaling
  },
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '20px',
    zIndex: 100,
  },
  pauseTitle: {
    fontSize: '64px',
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: '40px',
    textShadow: '0 4px 10px rgba(0,0,0,0.5)',
    letterSpacing: '5px',
  },
  gameOverOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(20px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    animation: 'fadeIn 0.5s ease-out',
  },
  gameOverModal: {
    background: 'linear-gradient(180deg, rgba(20, 40, 10, 0.95) 0%, rgba(10, 20, 5, 0.98) 100%)',
    borderRadius: '40px',
    padding: '40px',
    textAlign: 'center',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 0 0 4px rgba(255, 215, 0, 0.3), 0 20px 60px rgba(0,0,0,0.8)',
    border: '2px solid #FFD700',
    animation: 'popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    position: 'relative',
    overflow: 'hidden',
  },
  gameOverTitle: {
    fontSize: '48px',
    marginBottom: '5px',
    background: 'linear-gradient(to bottom, #FFD700, #FFA500)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.5))',
    fontWeight: '900',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    lineHeight: '1.2',
  },
  finalScoreLabel: {
    fontSize: '14px',
    color: '#8FBC8F',
    textTransform: 'uppercase',
    letterSpacing: '3px',
    marginBottom: '5px',
    fontWeight: '700',
  },
  finalScore: {
    fontSize: '80px',
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: '30px',
    textShadow: '0 5px 15px rgba(0,0,0,0.5), 0 0 30px rgba(255, 215, 0, 0.2)',
    lineHeight: '1',
  },
  gameOverStats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '35px',
  },
  gameOverStat: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '15px',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'transform 0.2s',
  },
  statIcon: {
    fontSize: '24px',
    marginBottom: '5px',
    filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))',
  },
  statLabel: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '2px',
    fontWeight: '600',
  },
  statValue: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#fff',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  gameButton: {
    padding: '16px 32px',
    border: 'none',
    borderRadius: '50px',
    fontSize: '18px',
    fontWeight: '800',
    cursor: 'pointer',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textShadow: '0 2px 0 rgba(0, 0, 0, 0.2)',
    transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    minWidth: '200px',
    margin: '10px auto',
    position: 'relative',
    overflow: 'hidden',
  },
  // Premium Button Variants
  greenButton: {
    background: 'linear-gradient(to bottom, #4CAF50, #2E7D32)',
    boxShadow: '0 6px 0 #1B5E20, 0 12px 20px rgba(0,0,0,0.3)',
  },
  redButton: {
    background: 'linear-gradient(to bottom, #FF5252, #D32F2F)',
    boxShadow: '0 6px 0 #B71C1C, 0 12px 20px rgba(0,0,0,0.3)',
  },
  blueButton: {
    background: 'linear-gradient(to bottom, #448AFF, #1565C0)',
    boxShadow: '0 6px 0 #0D47A1, 0 12px 20px rgba(0,0,0,0.3)',
  },
  yellowButton: {
    background: 'linear-gradient(to bottom, #FFD700, #FFA000)',
    boxShadow: '0 6px 0 #B27300, 0 12px 20px rgba(0,0,0,0.3)',
    color: '#3E2723',
    textShadow: 'none',
  },
  modalButtonsContainer: { display: 'flex', gap: '20px' },
  pauseButtonsContainer: { display: 'flex', flexDirection: 'column', gap: '20px', width: '280px' },
};

function Game({ user, updateUserStats }) {
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

  // [FEATURES] Define item types: Bananas (Good) vs Obstacles (Bad)
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
    // [RENDERING] Clear canvas for next frame

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


  // [EVENT DRIVEN] Handle keyboard input for basket movement
  useEffect(() => {
    const handleKey = (e, isDown) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key)) {
        e.preventDefault();
        gameStateRef.current.keys[e.key] = isDown;
      }
    };
    const handleKeyDown = (e) => {
      handleKey(e, true);
      // [EVENT] Toggle pause on 'P' key press
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
    if (!isPaused && !gameOver && !showMath) {  //  Added !showMath condition
      gameStateRef.current.animationId = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameStateRef.current.animationId) {
        cancelAnimationFrame(gameStateRef.current.animationId);
      }
    };
  }, [isPaused, gameOver, showMath, gameLoop]);  //  Added showMath to dependencies

  // [EVENT DRIVEN] Increase game difficulty (speed/spawn rate) every 20s
  useEffect(() => {
    if (gameOver || isPaused) return;
    const interval = setInterval(() => {
      setLevel(prev => prev + 1);
      gameStateRef.current.fallSpeed = Math.min(gameStateRef.current.fallSpeed + 0.5, 12);
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
      if (updateUserStats) {
        updateUserStats();
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  }, [score, bananasCollected, lives, level, gameTime]);

  const handleMathSuccess = () => {
    console.log(' Math Success - User continues playing');
    setShowMath(false);
    setIsPaused(false);
    // Game continues, no life lost
  };

  const handleMathFailure = () => {
    console.log(' Math Failure - ENDING GAME NOW');

    // Hide math modal immediately
    setShowMath(false);

    // Clear any running animations
    if (gameStateRef.current.animationId) {
      cancelAnimationFrame(gameStateRef.current.animationId);
    }

    // Force lives to 0 and trigger game over immediately
    setLives(0);
    setGameOver(true);
  };

  const handleMathSkip = () => {
    console.log('⏭️ Math Skipped - ENDING GAME NOW');

    // Hide math modal immediately
    setShowMath(false);

    // Clear any running animations
    if (gameStateRef.current.animationId) {
      cancelAnimationFrame(gameStateRef.current.animationId);
    }

    // Force lives to 0 and trigger game over immediately
    setLives(0);
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
        <button style={{ ...styles.gameButton, ...styles.yellowButton }} onClick={() => setIsPaused(!isPaused)} onMouseEnter={(e) => handleButtonHover(e, true)} onMouseLeave={(e) => handleButtonHover(e, false)} onMouseDown={(e) => handleButtonPress(e, true, '#B27300')} onMouseUp={(e) => handleButtonPress(e, false, '#B27300')}>
          {isPaused ? '▶️' : '⏸️'}<span>{isPaused ? 'Resume' : 'Pause'}</span>
        </button>
      </div>

      <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} style={styles.gameCanvas} />

      {isPaused && !showMath && (
        <div style={styles.pauseOverlay}>
          <div style={styles.pauseTitle}>PAUSED</div>
          <div style={styles.pauseButtonsContainer}>
            <button style={{ ...styles.gameButton, ...styles.greenButton }} onClick={() => setIsPaused(false)} onMouseEnter={(e) => handleButtonHover(e, true)} onMouseLeave={(e) => handleButtonHover(e, false)} onMouseDown={(e) => handleButtonPress(e, true, '#1B5E20')} onMouseUp={(e) => handleButtonPress(e, false, '#1B5E20')}>▶️<span>Resume</span></button>
            <button style={{ ...styles.gameButton, ...styles.redButton }} onClick={() => navigate('/')} onMouseEnter={(e) => handleButtonHover(e, true)} onMouseLeave={(e) => handleButtonHover(e, false)} onMouseDown={(e) => handleButtonPress(e, true, '#B71C1C')} onMouseUp={(e) => handleButtonPress(e, false, '#B71C1C')}>🚪<span>Quit</span></button>
          </div>
        </div>
      )}

      {/* [INTEROPERABILITY] Trigger Banana Math API on penalty (bomb/rock caught) */}
      {showMath && (<BananaMath onSuccess={handleMathSuccess} onFailure={handleMathFailure} onSkip={handleMathSkip} bananaAPI={bananaAPI} />)}

      {gameOver && (
        <div style={styles.gameOverOverlay}>
          <div style={styles.gameOverModal}>
            <div style={styles.gameOverTitle}>{isNewHighScore ? '🎉 NEW HIGH SCORE!' : 'GAME OVER'}</div>

            <div style={styles.finalScoreLabel}>Final Score</div>
            <div style={styles.finalScore}>{score}</div>

            <div style={styles.gameOverStats}>
              <div style={styles.gameOverStat}>
                <span style={styles.statIcon}>🍌</span>
                <span style={styles.statLabel}>Collected</span>
                <span style={styles.statValue}>{bananasCollected}</span>
              </div>
              <div style={styles.gameOverStat}>
                <span style={styles.statIcon}>😢</span>
                <span style={styles.statLabel}>Missed</span>
                <span style={styles.statValue}>{missedBananas}</span>
              </div>
              <div style={styles.gameOverStat}>
                <span style={styles.statIcon}>📊</span>
                <span style={styles.statLabel}>Level</span>
                <span style={styles.statValue}>{level}</span>
              </div>
              <div style={styles.gameOverStat}>
                <span style={styles.statIcon}>🏆</span>
                <span style={styles.statLabel}>Best</span>
                <span style={styles.statValue}>{isNewHighScore ? score : currentHighScore}</span>
              </div>
            </div>

            <div style={styles.modalButtonsContainer}>
              <button style={{ flex: 1, ...styles.gameButton, ...styles.greenButton }} onClick={handlePlayAgain} onMouseEnter={(e) => handleButtonHover(e, true)} onMouseLeave={(e) => handleButtonHover(e, false)} onMouseDown={(e) => handleButtonPress(e, true, '#1B5E20')} onMouseUp={(e) => handleButtonPress(e, false, '#1B5E20')}>🎮 Play Again</button>
              <button style={{ flex: 1, ...styles.gameButton, ...styles.blueButton }} onClick={() => navigate('/leaderboard')} onMouseEnter={(e) => handleButtonHover(e, true)} onMouseLeave={(e) => handleButtonHover(e, false)} onMouseDown={(e) => handleButtonPress(e, true, '#0D47A1')} onMouseUp={(e) => handleButtonPress(e, false, '#0D47A1')}>🏆 Leaderboard</button>
            </div>
          </div>
          <style>{`
            @keyframes popIn {
              0% { transform: scale(0.8); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

export default Game;