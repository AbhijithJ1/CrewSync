import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login, authenticate } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

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
