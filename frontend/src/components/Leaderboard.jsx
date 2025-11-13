import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { scoresAPI } from '../services/api';

const styles = {
  container: {
    minHeight: '100vh',
    padding: '40px 20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '10px',
    textShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
  },
  subtitle: {
    fontSize: '18px',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  backButton: {
    background: 'rgba(255, 255, 255, 0.95)',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '20px',
    color: '#764ba2',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  },
  tableContainer: {
    background: 'white',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  thead: {
    background: 'linear-gradient(135deg, #FFD93D 0%, #6BCB77 100%)',
    color: 'white',
  },
  th: {
    padding: '15px',
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  tr: {
    borderBottom: '1px solid #E8E8E8',
    transition: 'all 0.3s ease',
  },
  trHover: {
    background: '#F8F9FA',
  },
  td: {
    padding: '15px',
    fontSize: '16px',
    color: '#2C3E50',
  },
  rank: {
    fontWeight: 'bold',
    fontSize: '20px',
  },
  topRank: {
    fontSize: '24px',
  },
  medal: {
    fontSize: '24px',
    marginRight: '10px',
  },
  username: {
    fontWeight: 'bold',
    color: '#6BCB77',
  },
  currentUser: {
    background: '#FFF9E6',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#95A5A6',
  },
  error: {
    background: '#FFE5E5',
    color: '#FF6B6B',
    padding: '20px',
    borderRadius: '15px',
    textAlign: 'center',
    marginBottom: '20px',
  },
  noData: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#95A5A6',
    fontSize: '18px',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '30px',
  },
  pageButton: {
    background: 'white',
    border: '2px solid #E8E8E8',
    padding: '10px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
  },
  pageButtonActive: {
    background: '#FFD93D',
    border: '2px solid #FFD93D',
    color: 'white',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    background: 'white',
    padding: '25px',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  },
  statIcon: {
    fontSize: '36px',
    marginBottom: '10px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#FFD93D',
    marginBottom: '5px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#95A5A6',
    textTransform: 'uppercase',
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