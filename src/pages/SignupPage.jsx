import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, Mail, Lock, Loader2, ArrowRight, CheckCircle2, Zap } from 'lucide-react';

// Google G Logo SVG
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function SignupPage() {
  const { signup, taskTypes, loginWithGoogle, login } = useApp();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("volunteer"); // volunteer or organizer
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setError('');
    const result = await loginWithGoogle();
    setIsGoogleLoading(false);
    if (result.success) {
      login(result.user);
      navigate('/role-selection');
    } else {
      setError(result.error || 'Google sign-up unavailable. Please use email registration.');
    }
  };

  const handleSkillToggle = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    // Form Validations
    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
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
    if (role === 'volunteer' && selectedSkills.length === 0) {
      setError("Please select at least one skill category.");
      return;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));

    try {
      signup({
        name,
        email,
        password,
        role,
        skills: role === 'volunteer' ? selectedSkills : [],
        location: role === 'volunteer' ? 'Lobby Area' : ''
      });
      setIsLoading(false);
      navigate("/role-selection");
    } catch {
      setIsLoading(false);
      setError("Signup failed. Please try again.");
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-bg-ambient" />

      <div className="auth-card signup-card afu">
        {/* Header */}
        <div className="auth-card-header">
          <div className="auth-brand-logo"><Zap size={18} /></div>
          <h2>Join CrewSync</h2>
          <p>Register as event staff or coordinator</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="auth-error-banner aex">
            <span className="error-text">{error}</span>
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          type="button"
          className="google-signin-btn"
          onClick={handleGoogleSignup}
          disabled={isLoading || isGoogleLoading}
          id="google-signup-btn"
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
          <span>or register with email</span>
          <div className="auth-divider-line" />
        </div>

        <form onSubmit={handleSignup} className="auth-form-layout">
          {/* Name */}
          <div className="input-group-row">
            <label>Full Name</label>
            <div className={`input-icon-wrapper ${focusedInput === 'name' ? 'focused' : ''}`}>
              <User size={16} className="input-field-icon" />
              <input
                type="text"
                placeholder="Alex Mercer"
                value={name}
                onChange={e => { setName(e.target.value); setError(""); }}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email */}
          <div className="input-group-row">
            <label>Email Address</label>
            <div className={`input-icon-wrapper ${focusedInput === 'email' ? 'focused' : ''}`}>
              <Mail size={16} className="input-field-icon" />
              <input
                type="email"
                placeholder="alex@event.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="input-group-row">
            <label>Password (min 6 chars)</label>
            <div className={`input-icon-wrapper ${focusedInput === 'password' ? 'focused' : ''}`}>
              <Lock size={16} className="input-field-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Role Choice */}
          <div className="input-group-row">
            <label>Choose Platform Role</label>
            <div className="auth-role-select-row">
              <button
                type="button"
                className={`role-btn-option ${role === 'volunteer' ? 'selected' : ''}`}
                onClick={() => { setRole('volunteer'); setError(""); }}
                disabled={isLoading}
              >
                🙋 Volunteer
              </button>
              <button
                type="button"
                className={`role-btn-option ${role === 'organizer' ? 'selected' : ''}`}
                onClick={() => { setRole('organizer'); setError(""); }}
                disabled={isLoading}
              >
                🏢 Organizer
              </button>
            </div>
          </div>

          {/* Skills Selection (Visible only for Volunteer role) */}
          {role === 'volunteer' && (
            <div className="input-group-row skill-picker-section aex">
              <label>Select Your Skills (at least 1)</label>
              <div className="skill-grid-selection">
                {(taskTypes || []).map(skill => {
                  const isChecked = selectedSkills.includes(skill);
                  return (
                    <div 
                      key={skill}
                      className={`skill-check-tile ${isChecked ? 'active' : ''}`}
                      onClick={() => handleSkillToggle(skill)}
                    >
                      <CheckCircle2 size={13} className="tile-check-icon" />
                      <span>{skill}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit */}
          <button 
            type="submit" 
            className="auth-submit-btn" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="spin-loader" />
                <span>Registering profile...</span>
              </>
            ) : (
              <>
                <span>Sign Up</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-prompt">
          <span>Already registered?</span>
          <Link to="/login" className="auth-link-action">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
