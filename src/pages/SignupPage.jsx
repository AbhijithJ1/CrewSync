import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, Mail, Lock, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const { signup, taskTypes } = useApp();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("volunteer"); // volunteer or organizer
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

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
          <div className="auth-brand-logo">⚡</div>
          <h2>Join CrewSync</h2>
          <p>Register as event staff or coordinator</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="auth-error-banner aex">
            <span className="error-text">{error}</span>
          </div>
        )}

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
