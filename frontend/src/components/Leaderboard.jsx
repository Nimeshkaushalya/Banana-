import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { scoresAPI } from '../services/api';

const styles = {
  container: {
    minHeight: '100vh',
    padding: '40px 20px',
    color: 'white',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '56px',
    fontWeight: '900',
    marginBottom: '10px',
    background: 'linear-gradient(to bottom, #FFD700, #FFA500)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.3))',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: '20px',
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    letterSpacing: '1px',
  },
  content: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  backButton: {
    background: 'linear-gradient(to bottom, #4CAF50, #2E7D32)',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    marginBottom: '30px',
    color: 'white',
    transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
    boxShadow: '0 4px 0 #1B5E20, 0 8px 20px rgba(0,0,0,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
  },
  tableContainer: {
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(12px)',
    borderRadius: '24px',
    padding: '20px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0',
  },
  thead: {
    background: 'rgba(255, 215, 0, 0.1)',
  },
  th: {
    padding: '20px',
    textAlign: 'left',
    fontWeight: '800',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    color: '#FFD700',
    borderBottom: '2px solid rgba(255, 215, 0, 0.3)',
  },
  tr: {
    transition: 'all 0.2s ease',
  },
  trHover: {
    background: 'rgba(255, 255, 255, 0.05)',
    transform: 'scale(1.01)',
  },
  td: {
    padding: '20px',
    fontSize: '18px',
    color: 'white',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    fontWeight: '500',
  },
  rank: {
    fontWeight: '900',
    fontSize: '24px',
    color: 'rgba(255, 255, 255, 0.5)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  topRank: {
    fontSize: '28px',
    color: '#FFD700',
    textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
  },
  medal: {
    fontSize: '28px',
  },
  username: {
    fontWeight: '700',
    color: 'white',
  },
  currentUser: {
    background: 'rgba(255, 215, 0, 0.15)',
    borderLeft: '4px solid #FFD700',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '24px',
    color: '#FFD700',
    fontWeight: 'bold',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  },
  error: {
    background: 'rgba(255, 68, 68, 0.2)',
    color: '#FF5252',
    padding: '20px',
    borderRadius: '15px',
    textAlign: 'center',
    marginBottom: '20px',
    border: '1px solid #FF5252',
    fontWeight: 'bold',
  },
  noData: {
    textAlign: 'center',
    padding: '80px 20px',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '20px',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '30px',
  },
  pageButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '10px 20px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '700',
    color: 'white',
    transition: 'all 0.2s ease',
    fontFamily: "'Fredoka', sans-serif",
  },
  pageButtonActive: {
    background: '#FFD700',
    border: '1px solid #FFD700',
    color: '#1a2f0a',
    boxShadow: '0 0 15px rgba(255, 215, 0, 0.4)',
  },
};

function Leaderboard({ user }) {
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [page]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await scoresAPI.getLeaderboard(50, page);
      setScores(response.data.scores);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      setError('Failed to load leaderboard. Please try again.');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isCurrentUser = (username) => {
    return user && username === user.username;
  };

  return (
    <div style={styles.container} className="fade-in">
      <div style={styles.header}>
        <h1 style={styles.title}>🏆 Leaderboard 🏆</h1>
        <p style={styles.subtitle}>Top Banana Catchers</p>
      </div>

      <div style={styles.content}>
        <button
          style={styles.backButton}
          onClick={() => navigate('/')}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
          }}
        >
          ← Back to Home
        </button>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.loading}>Loading leaderboard... 🍌</div>
          ) : scores.length === 0 ? (
            <div style={styles.noData}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🍌</div>
              <p>No scores yet. Be the first to play!</p>
            </div>
          ) : (
            <>
              <table style={styles.table}>
                <thead style={styles.thead}>
                  <tr>
                    <th style={{ ...styles.th, width: '80px' }}>Rank</th>
                    <th style={styles.th}>Player</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>Score</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>🍌</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>Level</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score, index) => {
                    const rank = (page - 1) * 50 + index + 1;
                    const isUser = isCurrentUser(score.username);

                    return (
                      <tr
                        key={score._id || index}
                        style={{
                          ...styles.tr,
                          ...(hoveredRow === index ? styles.trHover : {}),
                          ...(isUser ? styles.currentUser : {}),
                        }}
                        onMouseEnter={() => setHoveredRow(index)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <td style={styles.td}>
                          <span style={{
                            ...styles.rank,
                            ...(rank <= 3 ? styles.topRank : {}),
                          }}>
                            {getMedal(rank) && (
                              <span style={styles.medal}>{getMedal(rank)}</span>
                            )}
                            {rank}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.username,
                            ...(isUser ? { color: '#FFD93D', fontWeight: 'bold' } : {}),
                          }}>
                            {score.username}
                            {isUser && ' (You)'}
                          </span>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center', fontWeight: 'bold' }}>
                          {score.score}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          {score.bananasCollected}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          {score.gameLevel}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right', color: '#95A5A6' }}>
                          {formatDate(score.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button
                    style={{
                      ...styles.pageButton,
                      opacity: page === 1 ? 0.5 : 1,
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    ← Previous
                  </button>

                  <span style={{
                    ...styles.pageButton,
                    ...styles.pageButtonActive,
                  }}>
                    Page {page} of {totalPages}
                  </span>

                  <button
                    style={{
                      ...styles.pageButton,
                      opacity: page === totalPages ? 0.5 : 1,
                      cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;