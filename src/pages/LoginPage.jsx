import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

// Google G Logo SVG
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const { login, authenticate, loginWithGoogle } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    const result = await loginWithGoogle();
    setIsGoogleLoading(false);
    if (result.success) {
      login(result.user);
      navigate('/role-selection');
    } else {
      setError(result.error || 'Google sign-in unavailable. Please use email/password.');
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation checks
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    // Simulate real network delay for micro-interactions
    await new Promise((r) => setTimeout(r, 700));

    const result = authenticate(email, password);
    setIsLoading(false);

    if (!result.success) {
      setError("Invalid email credentials or password.");
      return;
    }

    // Success! Log the user in and redirect to Role Selection Page
    login(result.user);
    navigate("/role-selection");
  };

  return (
    <div className="auth-page-container">
      <div className="auth-bg-ambient" />
      
      <div className="auth-card afu">
        {/* Card Header */}
        <div className="auth-card-header">
          <div className="auth-brand-logo">⚡</div>
          <h2>Welcome back</h2>
          <p>Sign in to sync your event dispatches</p>
        </div>

        {/* Validation Banner */}
        {error && (
          <div className="auth-error-banner aex">
            <span className="error-text">{error}</span>
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          type="button"
          className="google-signin-btn"
          onClick={handleGoogleLogin}
          disabled={isLoading || isGoogleLoading}
          id="google-signin-btn"
        >
          {isGoogleLoading ? (
            <Loader2 size={16} className="spin-loader" />
          ) : (
            <GoogleIcon />
          )}
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="auth-divider">
          <div className="auth-divider-line" />
          <span>or sign in with email</span>
          <div className="auth-divider-line" />
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form-layout">
          <div className="input-group-row">
            <label>Event Email</label>
            <div className={`input-icon-wrapper ${focusedInput === 'email' ? 'focused' : ''}`}>
              <Mail size={16} className="input-field-icon" />
              <input
                type="email"
                placeholder="you@event.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="input-group-row">
            <label>Password</label>
            <div className={`input-icon-wrapper ${focusedInput === 'password' ? 'focused' : ''}`}>
              <Lock size={16} className="input-field-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                disabled={isLoading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="spin-loader" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Signup Redirect */}
        <div className="auth-footer-prompt">
          <span>Need a crew account?</span>
          <Link to="/signup" className="auth-link-action">
            Sign up now
          </Link>
        </div>

        {/* Demo credentials hint */}
        <div className="demo-credentials-card">
          <div className="demo-header">
            <ShieldCheck size={12} />
            <span>Developer Sandbox Accounts:</span>
          </div>
          <div className="demo-row">
            <span>Organizer:</span>
            <code>admin@crewsync.com</code> / <code>admin123</code>
          </div>
          <div className="demo-row">
            <span>Volunteer:</span>
            <code>priya@crewsync.com</code> / <code>priya123</code>
          </div>
        </div>
      </div>
    </div>
  );
}
