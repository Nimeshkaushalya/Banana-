import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Game from './components/Game';
import Leaderboard from './components/Leaderboard';
import { authAPI } from './services/api';

// Styles are now handled in index.css


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch fresh user data
  const fetchUserData = useCallback(async () => {
    // [EXPLAIN: VIRTUAL IDENTITY - SESSION MANAGEMENT] 
    // We use LocalStorage to store the JWT (JSON Web Token).
    // This token serves as the user's "virtual identity" proof for subsequent requests.
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.getMe();
      if (response.success) {
        const freshUserData = response.data;
        setUser(freshUserData);
        localStorage.setItem('user', JSON.stringify(freshUserData));
        console.log('User data updated:', freshUserData); // Debug log
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If token is invalid, clear everything
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies needed

  // Initial load
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      // First set user from localStorage for immediate display
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }

      // Then fetch fresh data from server
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData, token) => {
    console.log('Login data received:', userData); // Debug log
    setUser(userData);
    // [EXPLAIN: VIRTUAL IDENTITY - AUTHENTICATION]
    // Upon successful login, we store the token to establish the session.
    // This persists the user's identity across page reloads.
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    // [SESSION END]
    // To "log out", we simply delete the token from LocalStorage.
    // This destroys the user's session on the client side.
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Function to update user stats after a game
  const updateUserStats = useCallback(async () => {
    console.log('Updating user stats...'); // Debug log
    await fetchUserData();
  }, []); // Empty dependencies - function doesn't need to be recreated

  if (loading) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '24px',
        color: '#FFD700',
      }}>
        <div className="glow">🍌 Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-content">
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Home user={user} onLogout={handleLogout} updateUserStats={updateUserStats} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/register"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <Register onRegister={handleLogin} />
              )
            }
          />
          <Route
            path="/game"
            element={
              user ? (
                <Game user={user} updateUserStats={updateUserStats} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/leaderboard"
            element={<Leaderboard user={user} />}
          />
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;