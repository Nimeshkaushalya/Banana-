import React, { useState, useEffect } from 'react';
import { bananaAPI } from '../services/api';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease-in',
  },
  modal: {
    background: '#FFFFFF',
    borderRadius: '25px',
    padding: '40px',
    maxWidth: '550px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(255, 215, 0, 0.5)',
    animation: 'bounce 0.5s ease-out',
    textAlign: 'center',
    border: '4px solid #FFD700',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#666666',
    marginBottom: '30px',
  },
  imageContainer: {
    marginBottom: '30px',
    padding: '20px',
    background: '#000000',
    borderRadius: '15px',
    border: '3px solid #FFD700',
  },
  image: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
  },
  question: {
    fontSize: '22px',
    color: '#000000',
    marginBottom: '20px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '18px',
    fontSize: '28px',
    border: '3px solid #CCCCCC',
    borderRadius: '12px',
    textAlign: 'center',
    marginBottom: '20px',
    outline: 'none',
    transition: 'all 0.3s ease',
    color: '#000000',
    backgroundColor: '#FFFFFF',
    fontWeight: 'bold',
  },
  inputFocus: {
    border: '3px solid #FFD700',
    boxShadow: '0 0 15px rgba(255, 215, 0, 0.5)',
  },
  buttonsContainer: {
    display: 'flex',
    gap: '15px',
  },
  button: {
    flex: 1,
    padding: '18px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  submitButton: {
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    color: '#000000',
    border: '3px solid #FFD700',
  },
  skipButton: {
    background: '#000000',
    color: '#FFD700',
    border: '3px solid #FFD700',
  },
  loading: {
    fontSize: '20px',
    color: '#666666',
  },
  timer: {
    fontSize: '56px',
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: '20px',
    textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
    animation: 'pulse 1s ease-in-out infinite',
  },
  error: {
    background: '#000000',
    color: '#FFD700',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '16px',
    border: '2px solid #FFD700',
  },
};

function BananaMath({ onSuccess, onFailure, onSkip }) {
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadQuestion();
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      handleSkip();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const loadQuestion = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await bananaAPI.getQuestion();
      setQuestion(data);
    } catch (err) {
      setError('Failed to load question. Using skip...');
      setTimeout(() => onSkip(), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      setError('Please enter an answer');
      return;
    }

    setIsSubmitting(true);
    const userAnswer = parseInt(answer.trim());

    if (isNaN(userAnswer)) {
      setError('Please enter a valid number');
      setIsSubmitting(false);
      return;
    }

    const correctAnswer = question.solution;

    if (userAnswer === correctAnswer) {
      onSuccess();
    } else {
      onFailure();
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (loading) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.loading} className="glow">
            🍌 Loading Banana Math Question... 🍌
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>🧮 Banana Math Challenge!</h2>
        <p style={styles.subtitle}>
          Solve this to earn an extra life!
        </p>

        <div style={styles.timer}>⏱️ {timeLeft}s</div>

        {error && (
          <div style={styles.error} className="glow">⚠️ {error}</div>
        )}

        {question && (
          <>
            <div style={styles.imageContainer}>
              <img 
                src={question.question} 
                alt="Banana Math Question"
                style={styles.image}
                onError={(e) => {
                  e.target.style.display = 'none';
                  setError('Image failed to load');
                }}
              />
            </div>

            <p style={styles.question}>
              🍌 What number is hidden in the image?
            </p>

            <input
              type="number"
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={{
                ...styles.input,
                ...(isFocused ? styles.inputFocus : {}),
              }}
              placeholder="Enter your answer"
              autoFocus
              disabled={isSubmitting}
            />

            <div style={styles.buttonsContainer}>
              <button
                style={styles.submitButton}
                onClick={handleSubmit}
                disabled={isSubmitting}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {isSubmitting ? '⏳ Checking...' : '✓ Submit'}
              </button>
              <button
                style={styles.skipButton}
                onClick={handleSkip}
                disabled={isSubmitting}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                ✗ Skip (End Game)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default BananaMath;