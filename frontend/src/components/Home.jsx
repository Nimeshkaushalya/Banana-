import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundDecor: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 0,
  },
  floatingBanana: {
    position: 'absolute',
    fontSize: '40px',
    opacity: 0.1,
    animation: 'float 20s infinite ease-in-out',
  },
  header: {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 215, 0, 0.2)',
    zIndex: 10,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: '1px',
  },
  logoEmoji: {
    fontSize: '32px',
    animation: 'bounce 2s ease-in-out infinite',
  },
  userSection: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
  },
  userInfo: {
    background: 'rgba(255, 215, 0, 0.1)',
    padding: '10px 20px',
    borderRadius: '20px',
    color: '#FFD700',
    fontWeight: '600',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  logoutButton: {
    background: 'transparent',
    color: '#FFD700',
    border: '2px solid #FFD700',
    padding: '10px 24px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    fontSize: '14px',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '120px 20px 80px',
    position: 'relative',
    zIndex: 1,
  },
  heroSection: {
    textAlign: 'center',
    marginBottom: '60px',
    maxWidth: '800px',
  },
  title: {
    fontSize: '64px',
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: '15px',
    textShadow: '0 0 40px rgba(255, 215, 0, 0.4)',
    letterSpacing: '2px',
  },
  titleEmoji: {
    display: 'inline-block',
    animation: 'bounce 2s ease-in-out infinite',
  },
  subtitle: {
    fontSize: '20px',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '20px',
    fontWeight: '300',
    letterSpacing: '0.5px',
  },
  divider: {
    width: '100px',
    height: '3px',
    background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
    margin: '20px auto',
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '40px',
    marginBottom: '50px',
    flexWrap: 'wrap',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '30px 40px',
    borderRadius: '15px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 215, 0, 0.2)',
    minWidth: '160px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    cursor: 'default',
  },
  statCardHover: {
    transform: 'translateY(-5px)',
    border: '1px solid rgba(255, 215, 0, 0.5)',
    boxShadow: '0 10px 30px rgba(255, 215, 0, 0.2)',
  },
  statNumber: {
    fontSize: '42px',
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: '8px',
    textShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
  },
  statLabel: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    fontWeight: '500',
  },
  buttonsContainer: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '60px',
  },
  button: {
    padding: '16px 45px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '30px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '200px',
    letterSpacing: '0.5px',
    position: 'relative',
    overflow: 'hidden',
  },
  playButton: {
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    color: '#000000',
    border: 'none',
    boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
  },
  leaderboardButton: {
    background: 'transparent',
    color: '#FFD700',
    border: '2px solid #FFD700',
  },
  infoSection: {
    maxWidth: '900px',
    width: '100%',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '40px',
  },
  infoCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    padding: '25px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 215, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
  },
  infoCardHover: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    transform: 'translateY(-3px)',
  },
  infoEmoji: {
    fontSize: '32px',
    marginBottom: '12px',
    display: 'block',
  },
  infoTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: '8px',
  },
  infoText: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: '1.6',
  },
  footer: {
    background: 'rgba(0, 0, 0, 0.8)',
    borderTop: '1px solid rgba(255, 215, 0, 0.2)',
    padding: '40px 20px 20px',
    position: 'relative',
    zIndex: 1,
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '40px',
    marginBottom: '30px',
  },
  footerSection: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  footerTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: '15px',
    letterSpacing: '0.5px',
  },
  footerText: {
    fontSize: '14px',
    lineHeight: '1.8',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '10px',
  },
  footerLink: {
    color: 'rgba(255, 255, 255, 0.6)',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
  },
  footerStats: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  footerStatItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  footerStatEmoji: {
    fontSize: '20px',
  },
  footerStatText: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  footerBottom: {
    borderTop: '1px solid rgba(255, 215, 0, 0.1)',
    paddingTop: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
  },
  copyright: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  socialLinks: {
    display: 'flex',
    gap: '15px',
  },
  socialIcon: {
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    background: 'rgba(255, 215, 0, 0.1)',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '16px',
  },
};

const floatingBananas = [
  { top: '10%', left: '5%', delay: '0s' },
  { top: '20%', right: '8%', delay: '2s' },
  { top: '60%', left: '10%', delay: '4s' },
  { top: '70%', right: '15%', delay: '6s' },
  { top: '40%', left: '85%', delay: '3s' },
  { top: '85%', left: '20%', delay: '5s' },
];

function Home({ user, onLogout, updateUserStats }) {
  const navigate = useNavigate();
  const [hoveredButton, setHoveredButton] = React.useState('');
  const [hoveredStat, setHoveredStat] = React.useState(null);
  const [hoveredInfo, setHoveredInfo] = React.useState(null);
  const [hoveredSocial, setHoveredSocial] = React.useState(null);

  // Update user stats when component mounts
  useEffect(() => {
    console.log('Home component user data:', user); // Debug log
    if (updateUserStats) {
      updateUserStats();
    }
  }, [updateUserStats]);

  // Log user changes
  useEffect(() => {
    console.log('User prop changed in Home:', user);
  }, [user]);

  const handlePlayClick = () => {
    navigate('/game');
  };

  const handleLeaderboardClick = () => {
    navigate('/leaderboard');
  };

  const getButtonStyle = (buttonName) => {
    const baseStyle = buttonName === 'play' ? styles.playButton : styles.leaderboardButton;
    const hoverStyle = hoveredButton === buttonName ? {
      transform: 'translateY(-3px)',
      boxShadow: buttonName === 'play' 
        ? '0 8px 30px rgba(255, 215, 0, 0.6)' 
        : '0 8px 30px rgba(255, 215, 0, 0.3)',
    } : {};
    
    return {
      ...styles.button,
      ...baseStyle,
      ...hoverStyle,
    };
  };

  const gameFeatures = [
    {
      emoji: '🍌',
      title: 'Catch Every Banana',
      text: 'Missing a single banana ends the game. Stay focused and catch them all!',
    },
    {
      emoji: '💣',
      title: 'Avoid Obstacles',
      text: 'Watch out for bombs and rocks falling from the sky. They will cost you lives!',
    },
    {
      emoji: '🧮',
      title: 'Math Challenges',
      text: 'Solve banana math puzzles to earn extra lives and continue your streak!',
    },
    {
      emoji: '⚡',
      title: 'Progressive Difficulty',
      text: 'Game speed increases over time. Test your reflexes and concentration!',
    },
    {
      emoji: '🏆',
      title: 'Compete Globally',
      text: 'Climb the leaderboard and prove you\'re the ultimate banana catcher!',
    },
    {
      emoji: '🎯',
      title: 'Score Big',
      text: 'Each banana is worth points. Higher levels mean bigger bonuses!',
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.backgroundDecor}>
        {floatingBananas.map((banana, index) => (
          <div
            key={index}
            style={{
              ...styles.floatingBanana,
              top: banana.top,
              left: banana.left,
              right: banana.right,
              animationDelay: banana.delay,
            }}
          >
            🍌
          </div>
        ))}
      </div>

      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoEmoji}>🍌</span>
          <span style={styles.logoText}>BANANA CATCH</span>
        </div>
        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            👋 {user?.username || 'Player'}
          </div>
          <button
            style={styles.logoutButton}
            onClick={onLogout}
            onMouseEnter={(e) => {
              e.target.style.background = '#FFD700';
              e.target.style.color = '#000000';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#FFD700';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={styles.mainContent}>
        <div style={styles.heroSection}>
          <h1 style={styles.title}>
            <span style={styles.titleEmoji}>🍌</span> Banana Catch{' '}
            <span style={styles.titleEmoji}>🍌</span>
          </h1>
          <div style={styles.divider}></div>
          <p style={styles.subtitle}>
            Catch all the bananas, avoid obstacles, and become the ultimate champion!
          </p>
        </div>

        <div style={styles.statsContainer}>
          <div
            style={{
              ...styles.statCard,
              ...(hoveredStat === 0 ? styles.statCardHover : {}),
            }}
            onMouseEnter={() => setHoveredStat(0)}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <div style={styles.statNumber}>{user?.highestScore || 0}</div>
            <div style={styles.statLabel}>Best Score</div>
          </div>
          <div
            style={{
              ...styles.statCard,
              ...(hoveredStat === 1 ? styles.statCardHover : {}),
            }}
            onMouseEnter={() => setHoveredStat(1)}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <div style={styles.statNumber}>{user?.gamesPlayed || 0}</div>
            <div style={styles.statLabel}>Games Played</div>
          </div>
        </div>

        <div style={styles.buttonsContainer}>
          <button
            style={getButtonStyle('play')}
            onClick={handlePlayClick}
            onMouseEnter={() => setHoveredButton('play')}
            onMouseLeave={() => setHoveredButton('')}
          >
            🎮 Start Playing
          </button>
          <button
            style={getButtonStyle('leaderboard')}
            onClick={handleLeaderboardClick}
            onMouseEnter={() => setHoveredButton('leaderboard')}
            onMouseLeave={() => setHoveredButton('')}
          >
            🏆 View Leaderboard
          </button>
        </div>

        <div style={styles.infoSection}>
          <div style={styles.infoGrid}>
            {gameFeatures.map((feature, index) => (
              <div
                key={index}
                style={{
                  ...styles.infoCard,
                  ...(hoveredInfo === index ? styles.infoCardHover : {}),
                }}
                onMouseEnter={() => setHoveredInfo(index)}
                onMouseLeave={() => setHoveredInfo(null)}
              >
                <span style={styles.infoEmoji}>{feature.emoji}</span>
                <div style={styles.infoTitle}>{feature.title}</div>
                <div style={styles.infoText}>{feature.text}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerGrid}>
            <div style={styles.footerSection}>
              <h3 style={styles.footerTitle}>About Banana Catch</h3>
              <p style={styles.footerText}>
                An exciting browser-based game where reflexes and concentration meet fun. 
                Challenge yourself and compete with players worldwide!
              </p>
              <div style={styles.footerStats}>
                <div style={styles.footerStatItem}>
                  <span style={styles.footerStatEmoji}>🎮</span>
                  <span style={styles.footerStatText}>Fun Gameplay</span>
                </div>
                <div style={styles.footerStatItem}>
                  <span style={styles.footerStatEmoji}>🏆</span>
                  <span style={styles.footerStatText}>Global Ranking</span>
                </div>
              </div>
            </div>

            <div style={styles.footerSection}>
              <h3 style={styles.footerTitle}>Quick Links</h3>
              <a
                href="#"
                style={styles.footerLink}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/game');
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#FFD700';
                  e.target.style.paddingLeft = '5px';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255, 255, 255, 0.6)';
                  e.target.style.paddingLeft = '0';
                }}
              >
                → Play Now
              </a>
              <a
                href="#"
                style={styles.footerLink}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/leaderboard');
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#FFD700';
                  e.target.style.paddingLeft = '5px';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255, 255, 255, 0.6)';
                  e.target.style.paddingLeft = '0';
                }}
              >
                → Leaderboard
              </a>
              <a
                href="#"
                style={styles.footerLink}
                onMouseEnter={(e) => {
                  e.target.style.color = '#FFD700';
                  e.target.style.paddingLeft = '5px';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255, 255, 255, 0.6)';
                  e.target.style.paddingLeft = '0';
                }}
              >
                → How to Play
              </a>
            </div>

            <div style={styles.footerSection}>
              <h3 style={styles.footerTitle}>Your Stats</h3>
              <p style={styles.footerText}>
                <strong style={{ color: '#FFD700' }}>Player:</strong> {user?.username || 'N/A'}
              </p>
              <p style={styles.footerText}>
                <strong style={{ color: '#FFD700' }}>High Score:</strong> {user?.highestScore || 0}
              </p>
              <p style={styles.footerText}>
                <strong style={{ color: '#FFD700' }}>Games:</strong> {user?.gamesPlayed || 0}
              </p>
              <p style={styles.footerText}>
                <strong style={{ color: '#FFD700' }}>Rank:</strong> Coming Soon
              </p>
            </div>
          </div>

          <div style={styles.footerBottom}>
            <div style={styles.copyright}>
              © 2024 Banana Catch Game. Built with React & Node.js
            </div>
            <div style={styles.socialLinks}>
              <div
                style={{
                  ...styles.socialIcon,
                  ...(hoveredSocial === 0 ? {
                    background: '#FFD700',
                    transform: 'scale(1.1)',
                  } : {}),
                }}
                onMouseEnter={() => setHoveredSocial(0)}
                onMouseLeave={() => setHoveredSocial(null)}
                title="GitHub"
              >
                🔗
              </div>
              <div
                style={{
                  ...styles.socialIcon,
                  ...(hoveredSocial === 1 ? {
                    background: '#FFD700',
                    transform: 'scale(1.1)',
                  } : {}),
                }}
                onMouseEnter={() => setHoveredSocial(1)}
                onMouseLeave={() => setHoveredSocial(null)}
                title="Share"
              >
                📤
              </div>
              <div
                style={{
                  ...styles.socialIcon,
                  ...(hoveredSocial === 2 ? {
                    background: '#FFD700',
                    transform: 'scale(1.1)',
                  } : {}),
                }}
                onMouseEnter={() => setHoveredSocial(2)}
                onMouseLeave={() => setHoveredSocial(null)}
                title="Info"
              >
                ℹ️
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(10deg);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}

export default Home;