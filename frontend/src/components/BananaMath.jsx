import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease-in',
  },
  modal: {
    background: 'linear-gradient(145deg, rgba(30, 60, 0, 0.95), rgba(10, 20, 0, 0.98))',
    borderRadius: '30px',
    padding: '25px', // Reduced padding
    maxWidth: '550px',
    width: '90%',
    maxHeight: '90vh', // Limit height to 90% of viewport
    overflowY: 'auto', // Allow scrolling if content is too tall
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
    animation: 'bounce 0.5s ease-out',
    textAlign: 'center',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: '28px', // Reduced font size
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: '5px',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
    letterSpacing: '1px',
    marginTop: 0,
  },
  subtitle: {
    fontSize: '16px',
    color: '#a0a0a0',
    marginBottom: '15px',
    fontWeight: '500',
  },
  imageContainer: {
    marginBottom: '15px',
    marginTop: '10px',
    padding: '5px',
    background: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '15px',
    border: '2px solid rgba(255, 215, 0, 0.2)',
    width: 'auto', // Allow container to shrink to image width
    maxWidth: '100%', // Prevent overflowing the modal
    height: '30vh', // Fixed height relative to viewport
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
  },
  image: {
    height: '100%', // Match container height
    width: 'auto', // Maintain aspect ratio
    maxWidth: '100%', // Ensure it doesn't overflow container width
    objectFit: 'contain',
    borderRadius: '10px',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
  },
  question: {
    fontSize: '24px',
    color: '#FFFFFF',
    marginBottom: '20px',
    fontWeight: '700',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  },
  input: {
    width: '100%',
    padding: '12px', // Reduced padding
    fontSize: '20px', // Reduced font size
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '15px',
    textAlign: 'center',
    marginBottom: '15px', // Reduced margin
    outline: 'none',
    transition: 'all 0.3s ease',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    fontWeight: 'bold',
    fontFamily: "'Fredoka', sans-serif",
  },
  inputFocus: {
    border: '2px solid #FFD700',
    boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  buttonsContainer: {
    display: 'flex',
    gap: '15px',
  },
  button: {
    flex: 1,
    padding: '12px', // Reduced padding
    border: 'none',
    borderRadius: '50px',
    fontSize: '16px', // Reduced font size
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: "'Fredoka', sans-serif",
  },
  submitButton: {
    background: 'linear-gradient(to bottom, #4CAF50, #2E7D32)',
    color: '#FFFFFF',
    boxShadow: '0 6px 0 #1B5E20, 0 12px 20px rgba(0,0,0,0.3)',
    textShadow: '0 2px 0 rgba(0,0,0,0.2)',
  },
  skipButton: {
    background: 'transparent',
    color: '#FF5252',
    border: '2px solid #FF5252',
    boxShadow: 'none',
  },
  loading: {
    fontSize: '24px',
    color: '#FFD700',
    fontWeight: 'bold',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  },
  timer: {
    fontSize: '36px', // Reduced font size
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: '10px', // Reduced margin
    textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
    animation: 'pulse 1s ease-in-out infinite',
  },
  error: {
    background: 'rgba(255, 68, 68, 0.2)',
    color: '#FF5252',
    padding: '15px',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '16px',
    border: '1px solid #FF5252',
    fontWeight: 'bold',
  },
  success: {
    background: 'rgba(34, 139, 34, 0.2)',
    color: '#4CAF50',
    padding: '15px',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '18px',
    fontWeight: 'bold',
    border: '1px solid #4CAF50',
  },
  imageLoader: {
    color: '#FFD700',
    fontSize: '18px',
    fontWeight: '600',
  },
};

function BananaMath({ onSuccess, onFailure, onSkip }) {
  const [puzzle, setPuzzle] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isFocused, setIsFocused] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMountedRef = useRef(true);
  const timerRef = useRef(null);
  const imageRetryCount = useRef(0);
  const correctAnswerRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    fetchPuzzle();

    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (loading || success || imageLoading || isSubmitting) return;

    if (timeLeft === 0) {
      console.log('⏰ Time expired - ending game');
      handleTimeOut();
      return;
    }

    timerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setTimeLeft(prev => prev - 1);
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, loading, success, imageLoading, isSubmitting]);

  const fetchPuzzle = async () => {
    console.log('🔄 Fetching puzzle from API...');
    setLoading(true);
    setError('');
    setImageLoading(true);
    setImageError(false);
    imageRetryCount.current = 0;

    try {
      // [INTEROPERABILITY] Consume external Banana Math API via HTTP/HTTPS
      const response = await axios.get('https://marcconrad.com/uob/banana/api.php');

      if (!isMountedRef.current) return;

      console.log('✅ Raw API Response:', JSON.stringify(response.data, null, 2));

      if (!response.data || !response.data.question || response.data.solution === undefined || response.data.solution === null) {
        throw new Error('Invalid API response');
      }

      const solutionValue = parseInt(response.data.solution, 10);

      if (isNaN(solutionValue)) {
        throw new Error('Solution is not a valid number');
      }

      console.log('✅ Correct answer from API:', solutionValue);

      correctAnswerRef.current = solutionValue;

      setPuzzle({
        question: response.data.question,
        solution: solutionValue
      });

    } catch (err) {
      console.error('❌ Failed to fetch puzzle:', err);

      if (!isMountedRef.current) return;

      setError('Failed to load puzzle. Ending game...');
      setTimeout(() => {
        if (isMountedRef.current) {
          onSkip();
        }
      }, 2000);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully');
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = (e) => {
    console.error('❌ Image failed to load, attempt:', imageRetryCount.current + 1);

    if (imageRetryCount.current < 3) {
      imageRetryCount.current++;
      console.log('🔄 Retrying image load...');

      const img = e.target;
      const currentSrc = img.src.split('?')[0];
      img.src = `${currentSrc}?t=${Date.now()}`;
    } else {
      setImageError(true);
      setImageLoading(false);
      setError('Image failed to load. You can still try to answer or skip.');
    }
  };

  const handleTimeOut = () => {
    console.log('💀 TIME OUT - GAME OVER');
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onFailure(); // Changed from onSkip() to onFailure()
  };

  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (success || isSubmitting) {
      console.log('⚠️ Already processing, ignoring submission');
      return;
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 SUBMISSION STARTED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    setError('');
    setIsSubmitting(true);

    if (!answer || answer.trim() === '') {
      console.log('❌ Answer is empty');
      setError('Please enter an answer');
      setIsSubmitting(false);
      return;
    }

    const userAnswer = parseInt(answer.trim(), 10);
    console.log('User answer (parsed):', userAnswer, '(type:', typeof userAnswer, ')');

    if (isNaN(userAnswer)) {
      console.log('❌ User answer is not a valid number');
      setError('Please enter a valid number');
      setIsSubmitting(false);
      return;
    }

    const correctAnswer = correctAnswerRef.current;
    console.log('Correct answer:', correctAnswer, '(type:', typeof correctAnswer, ')');

    if (correctAnswer === null || correctAnswer === undefined) {
      console.log('❌ Correct answer not available');
      setError('Puzzle data error. Please skip.');
      setIsSubmitting(false);
      return;
    }

    console.log('Comparing:', userAnswer, '===', correctAnswer);
    const isCorrect = (userAnswer === correctAnswer);
    console.log('Result:', isCorrect ? '✅ CORRECT' : '❌ WRONG');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (isCorrect) {
      // ✅ CORRECT ANSWER - User continues playing
      console.log('✅✅✅ CORRECT ANSWER! User continues game');
      setSuccess(true);
      setError('');

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setTimeout(() => {
        if (isMountedRef.current) {
          console.log('🎉 Calling onSuccess() - Continuing game');
          onSuccess();
        }
      }, 1500);

    } else {
      // ❌ WRONG ANSWER - GAME OVER
      console.log('❌❌❌ WRONG ANSWER! GAME OVER');
      setError(`Wrong! The correct answer was ${correctAnswer}. Game Over!`);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Show error for 2 seconds, then end game
      setTimeout(() => {
        if (isMountedRef.current) {
          console.log('💀💀💀 Calling onFailure() - ENDING GAME & SHOWING SCORECARD');
          onFailure();
        }
      }, 2000);
    }
  };

  const handleSkip = () => {
    console.log('⏭️ Skip button clicked - Going to homepage');
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onSkip(); // ✅ Call onSkip() to navigate home
  };

  if (loading) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.loading}>
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
          {success ? 'Correct! Continuing...' : 'Solve this to continue playing!'}
        </p>

        {!success && !isSubmitting && <div style={styles.timer}>⏱️ {timeLeft}s</div>}

        {error && <div style={styles.error}>⚠️ {error}</div>}

        {success && (
          <div style={styles.success}>
            ✅ Correct! You can continue playing...
          </div>
        )}

        {puzzle && !success && (
          <>
            <div style={styles.imageContainer}>
              {imageLoading && !imageError && (
                <div style={styles.imageLoader}>
                  🍌 Loading image...
                </div>
              )}

              <img
                src={puzzle.question}
                alt="Banana Math Question"
                style={{
                  ...styles.image,
                  display: (imageLoading || imageError) ? 'none' : 'block',
                }}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />

              {imageError && (
                <div style={{ color: '#FFD700', fontSize: '16px' }}>
                  🖼️ Image couldn't be displayed<br />
                  <a
                    href={puzzle.question}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#FFD700', textDecoration: 'underline' }}
                  >
                    Click here to view in new tab
                  </a>
                </div>
              )}
            </div>

            <p style={styles.question}>
              🍌 What number should replace the question mark?
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="number"
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  if (error) setError('');
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{
                  ...styles.input,
                  ...(isFocused ? styles.inputFocus : {}),
                }}
                placeholder="Enter your answer"
                autoFocus
                required
                disabled={isSubmitting}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />

              <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                (Press <strong>Enter</strong> or click <strong>Submit</strong>)
              </div>

              <div style={styles.buttonsContainer}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    ...styles.button,
                    ...styles.submitButton,
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.6)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 0 #006400';
                  }}
                >
                  {isSubmitting ? '⏳ Checking...' : '✓ Submit Answer'}
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  style={{
                    ...styles.button,
                    ...styles.skipButton,
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                  onClick={handleSkip}
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
            </form>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

export default BananaMath;