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
    // Background removed
  },
  card: {
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(12px)',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    maxWidth: '450px',
    width: '100%',
    animation: 'fadeIn 0.5s ease-in',
    border: '1px solid rgba(255, 215, 0, 0.2)',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: '5px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '20px',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#FFD700',
    fontWeight: '600',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
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
    marginBottom: '15px',
    animation: 'bounce 2s ease-in-out infinite',
  },
  hint: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: '5px',
  },
  strengthMeter: {
    height: '5px',
    borderRadius: '3px',
    marginTop: '8px',
    transition: 'all 0.3s ease',
  },
  strengthText: {
    fontSize: '12px',
    marginTop: '4px',
    textAlign: 'right',
    fontWeight: 'bold',
  },
};

function Register({ onRegister }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === 'password') {
      calculatePasswordStrength(value);
    }

    setError('');
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 10) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return '#FF4136'; // Red - Weak
    if (passwordStrength <= 3) return '#FFDC00'; // Yellow - Medium
    return '#2ECC40'; // Green - Strong
  };

  const getStrengthLabel = () => {
    if (formData.password.length === 0) return '';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (response.success) {
        onRegister(response.data, response.data.token);
        navigate('/');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="fade-in">
        <div style={styles.emoji}>🍌✨</div>
        <h1 style={styles.title}>Join the Fun!</h1>
        <p style={styles.subtitle}>Create an account to start playing</p>

        {error && (
          <div style={styles.error} className="glow">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onFocus={() => setFocusedInput('username')}
              onBlur={() => setFocusedInput('')}
              style={{
                ...styles.input,
                ...(focusedInput === 'username' ? styles.inputFocus : {}),
              }}
              placeholder="Choose a username"
              required
            />
            <div style={styles.hint}>3-20 characters, letters, numbers, and underscores only</div>
          </div>

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
              placeholder="Create a password"
              required
            />
            <div style={styles.hint}>At least 6 characters</div>
            {formData.password && (
              <>
                <div style={{
                  ...styles.strengthMeter,
                  width: `${(passwordStrength / 5) * 100}%`,
                  backgroundColor: getStrengthColor(),
                }} />
                <div style={{
                  ...styles.strengthText,
                  color: getStrengthColor(),
                }}>
                  {getStrengthLabel()}
                </div>
              </>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onFocus={() => setFocusedInput('confirmPassword')}
              onBlur={() => setFocusedInput('')}
              style={{
                ...styles.input,
                ...(focusedInput === 'confirmPassword' ? styles.inputFocus : {}),
              }}
              placeholder="Confirm your password"
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
            {loading ? '🍌 Creating Account...' : '🎮 Register & Play'}
          </button>
        </form>

        <div style={styles.footer}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={styles.link}
            onMouseEnter={(e) => e.target.style.color = '#FFA500'}
            onMouseLeave={(e) => e.target.style.color = '#FFD700'}
          >
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;