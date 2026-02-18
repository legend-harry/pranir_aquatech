import React, { useState, useEffect } from 'react';
import { signUpWithEmail, signInWithEmail, signInWithGoogle, signInAnonymous } from '../firebase';

export default function SignUpPage({ onSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSignUp, setIsSignUp] = useState(false);

  // Slideshow images from Public/pond directory
  const slides = [
    '/Public/pond/Shrimp2.jpg',
    '/Public/pond/a-natural-pond-without-technology-scaled.jpeg',
    '/Public/pond/ao-nuoi_1648699681.jpg',
    '/Public/pond/hdpe-pond-liner.jpg',
    '/Public/pond/im2.png',
    '/Public/pond/images.jpeg'
  ];

  // Auto-advance slides every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await signUpWithEmail(email, password);
        if (result.success) {
          setSuccess('Account created successfully!');
          setTimeout(() => {
            onSignUp({ user: result.user, email, isNewUser: true });
          }, 1000);
        }
      } else {
        result = await signInWithEmail(email, password);
        if (result.success) {
          setSuccess('Signed in successfully!');
          setTimeout(() => {
            onSignUp({ user: result.user, email, isNewUser: false });
          }, 1000);
        }
      }

      if (!result.success) {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        setSuccess('Signed in with Google successfully!');
        setTimeout(() => {
          onSignUp({ user: result.user, email: result.user.email, isNewUser: false });
        }, 1000);
      } else {
        setError(result.error || 'Google sign-in failed');
      }
    } catch (err) {
      setError('An error occurred with Google sign-in');
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await signInAnonymous();
      if (result.success) {
        setSuccess('Signed in anonymously!');
        setTimeout(() => {
          onSignUp({ user: result.user, email: 'anonymous', isNewUser: false });
        }, 1000);
      } else {
        setError(result.error || 'Anonymous sign-in failed');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="signup-wrapper">
      <a href="http://localhost:8000" className="back-button">
        &lt; Back
      </a>
      <div className="signup-container">
        {/* Left: Form Section */}
        <div className="signup-left">
          <div className="welcome-section">
            <h1 className="welcome-title">{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
            <p className="welcome-subtitle">
              {isSignUp ? 'Sign up to start managing your aquaculture' : 'We are glad to see you back with us'}
            </p>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            {error && <div className="signup-error">{error}</div>}
            {success && <div className="signup-success">{success}</div>}

            <div className="form-field">
              <div className="field-icon">👤</div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="field-input"
                required
              />
            </div>

            <div className="form-field">
              <div className="field-icon">🔒</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="field-input"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-next" 
              disabled={loading}
            >
              {loading ? 'LOADING...' : (isSignUp ? 'SIGN UP' : 'SIGN IN')}
            </button>

            <div className="auth-toggle">
              {isSignUp ? (
                <p>
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    className="toggle-btn" 
                    onClick={() => setIsSignUp(false)}
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <p>
                  Don't have an account?{' '}
                  <button 
                    type="button" 
                    className="toggle-btn" 
                    onClick={() => setIsSignUp(true)}
                  >
                    Sign Up
                  </button>
                </p>
              )}
            </div>
          </form>

          <div className="divider">
            <span>Or continue with</span>
          </div>

          <div className="social-logins">
            <button 
              type="button" 
              className="social-btn google-btn"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <span>🔍</span> Google
            </button>
            <button 
              type="button" 
              className="social-btn anonymous-btn"
              onClick={handleAnonymousSignIn}
              disabled={loading}
            >
              <span>👤</span> Anonymous
            </button>
          </div>

          <div className="floating-accent accent-top"></div>
        </div>

        {/* Right: Slideshow Section */}
        <div className="signup-right">
          <div className="slideshow-main">
            <div className="slides-container">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`slide-item ${index === currentSlide ? 'active' : ''}`}
                  style={{ backgroundImage: `url(${slide})` }}
                >
                  <div className="slide-mask"></div>
                </div>
              ))}
            </div>

            {/* Navigation Controls */}
            <button type="button" className="slide-arrow prev-arrow" onClick={prevSlide}>
              ‹
            </button>
            <button type="button" className="slide-arrow next-arrow" onClick={nextSlide}>
              ›
            </button>

            {/* Slide Indicators */}
            <div className="slide-indicators">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
