import React, { useState, useEffect, useRef } from 'react';

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
    height: '350px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '310px',
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
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
  imageLoader: {
    color: '#FFD700',
    fontSize: '18px',
  },
};

// Mock API that simulates the real CSV response format
const mockBananaAPI = {
  getQuestion: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate CSV response: "imageUrl,solution"
    const csvResponse = 'https://www.sanfoh.com/uob/banana/data/tda960504e718609d6c2f28d7c2n54.png,4';
    
    // Parse CSV: split by comma
    const [imageUrl, solutionStr] = csvResponse.split(',');
    
    return {
      question: imageUrl.trim(),
      solution: parseInt(solutionStr.trim(), 10)
    };
  }
};

function BananaMath({ onSuccess, onFailure, onSkip, bananaAPI }) {
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  const isMountedRef = useRef(true);
  const timerRef = useRef(null);
  const imageRetryCount = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    loadQuestion();
    
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (loading || isSubmitting || imageLoading) return;
    
    if (timeLeft === 0) {
      console.log('⏰ Time expired - calling onSkip');
      handleSkip();
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
  }, [timeLeft, loading, isSubmitting, imageLoading]);

  const loadQuestion = async () => {
    console.log('🔄 Loading banana math question...');
    setLoading(true);
    setError('');
    setImageLoading(true);
    setImageError(false);
    imageRetryCount.current = 0;
    
    try {
      // Use the passed bananaAPI or fall back to mock
      const api = bananaAPI || mockBananaAPI;
      const data = await api.getQuestion();
      
      if (!isMountedRef.current) return;
      
      console.log('✅ Question loaded:', data);
      
      // Check if the question is a proper URL
      if (!data.question || !data.question.startsWith('http')) {
        throw new Error('Invalid question URL received from API');
      }
      
      setQuestion(data);
    } catch (err) {
      console.error('❌ Failed to load question:', err);
      
      if (!isMountedRef.current) return;
      
      setError('Failed to load question. Ending game...');
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
    
    // Retry up to 3 times
    if (imageRetryCount.current < 3) {
      imageRetryCount.current++;
      console.log('🔄 Retrying image load...');
      
      // Force reload by adding timestamp
      const img = e.target;
      const currentSrc = img.src.split('?')[0];
      img.src = `${currentSrc}?t=${Date.now()}`;
    } else {
      setImageError(true);
      setImageLoading(false);
      setError('Image failed to load after multiple attempts. You can still try to answer or skip.');
    }
  };

  const handleSubmit = async () => {
    console.log('📝 Submitting answer:', answer);
    
    if (!answer.trim()) {
      setError('Please enter an answer');
      return;
    }

    setIsSubmitting(true);
    const userAnswer = parseInt(answer.trim(), 10);

    if (isNaN(userAnswer)) {
      setError('Please enter a valid number');
      setIsSubmitting(false);
      return;
    }

    const correctAnswer = question.solution;
    console.log(`User answer: ${userAnswer}, Correct answer: ${correctAnswer}`);

    await new Promise(resolve => setTimeout(resolve, 500));

    if (userAnswer === correctAnswer) {
      console.log('✅ Correct answer! Calling onSuccess');
      onSuccess();
    } else {
      console.log('❌ Wrong answer! Calling onFailure');
      onFailure();
    }
  };

  const handleSkip = () => {
    console.log('⏭️ Skip called - ending game');
    if (isMountedRef.current) {
      onSkip();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isSubmitting && !imageLoading) {
      handleSubmit();
    }
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
          Solve this to earn an extra life!
        </p>

        <div style={styles.timer}>⏱️ {timeLeft}s</div>

        {error && (
          <div style={styles.error}>⚠️ {error}</div>
        )}

        {question && (
          <>
            <div style={styles.imageContainer}>
              {imageLoading && !imageError && (
                <div style={styles.imageLoader}>
                  🍌 Loading image...
                </div>
              )}
              
              <img 
                src={question.question}
                alt="Banana Math Question"
                style={{
                  ...styles.image,
                  display: (imageLoading || imageError) ? 'none' : 'block'
                }}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              
              {imageError && (
                <div style={{ color: '#FFD700', fontSize: '16px' }}>
                  🖼️ Image couldn't be displayed<br/>
                  <a 
                    href={question.question} 
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
              🍌 What number is hidden in the image?
            </p>

            <input
              type="number"
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                if (error && error.includes('answer')) {
                  setError('');
                }
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
                disabled={isSubmitting || imageLoading}
                onMouseEnter={(e) => {
                  if (!isSubmitting && !imageLoading) {
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