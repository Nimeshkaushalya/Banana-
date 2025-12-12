import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    // Background removed to show global jungle theme
  },
  card: {
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(12px)',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    maxWidth: '450px',
    width: '100%',
    animation: 'fadeIn 0.5s ease-in',
    border: '1px solid rgba(255, 215, 0, 0.2)',
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: '10px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '30px',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#FFD700',
    fontWeight: '600',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '10px',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    outline: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#FFFFFF',
  },
  inputFocus: {
    border: '1px solid #FFD700',
    boxShadow: '0 0 10px rgba(255, 215, 0, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  button: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#000000',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '10px',
    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
  },
  buttonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(255, 215, 0, 0.6)',
  },
  error: {
    background: '#000000',
    color: '#FFD700',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    border: '2px solid #FFD700',
    textAlign: 'center',
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '14px',
  },
  link: {
    color: '#FFD700',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'color 0.3s ease',
  },
  emoji: {
    fontSize: '48px',
    textAlign: 'center',
    marginBottom: '20px',
    animation: 'bounce 2s ease-in-out infinite',
  },
};

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);

      if (response.success) {
        onLogin(response.data, response.data.token);
        navigate('/');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="fade-in">
        <div style={styles.emoji}>🍌</div>
        <h1 style={styles.title}>Welcome Back!</h1>
        <p style={styles.subtitle}>Login to start catching bananas</p>

        {error && (
          <div style={styles.error} className="glow">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput('')}
              style={{
                ...styles.input,
                ...(focusedInput === 'email' ? styles.inputFocus : {}),
              }}
              placeholder="Enter your email"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput('')}
              style={{
                ...styles.input,
                ...(focusedInput === 'password' ? styles.inputFocus : {}),
              }}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{
              ...styles.button,
              ...(isHovering && !loading ? styles.buttonHover : {}),
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '🍌 Logging in...' : '🎮 Login & Play'}
          </button>
        </form>

        <div style={styles.footer}>
          Don't have an account?{' '}
          <Link
            to="/register"
            style={styles.link}
            onMouseEnter={(e) => e.target.style.color = '#FFA500'}
            onMouseLeave={(e) => e.target.style.color = '#FFD700'}
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;