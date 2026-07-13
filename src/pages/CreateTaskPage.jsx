import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import TaskCard from '../components/TaskCard';
import { Send, Plus, X, Check, MapPin, BadgeInfo, Users, ShieldAlert, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const SESSION_KEY = "crewsync-create-task-draft";

export default function CreateTaskPage() {
  const { 
    addTask, 
    locations, 
    taskTypes, 
    addLocation, 
    deleteLocation, 
    addSkill, 
    deleteSkill,
    events,
  } = useApp();
  
  const navigate = useNavigate();

  // State to manage input visibility for custom additions
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocationVal, setNewLocationVal] = useState("");
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillVal, setNewSkillVal] = useState("");

  const [form, setForm] = useState(() => {
    const cached = sessionStorage.getItem(SESSION_KEY);
    const initialLoc = locations[0] || "Lobby Area";
    const initialSkill = taskTypes[0] || "General Support";
    const defaultForm = {
      title: "",
      description: "",
      volunteersNeeded: 1,
      location: initialLoc,
      requiredSkill: initialSkill,
      durationLimit: 300, // 5 minutes
      deadline: "ASAP",
      priority: "medium",
      eventId: "",
      eventName: "",
    };

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return {
          ...defaultForm,
          ...parsed,
          location: locations.includes(parsed.location) ? parsed.location : initialLoc,
          requiredSkill: taskTypes.includes(parsed.requiredSkill) ? parsed.requiredSkill : initialSkill
        };
      } catch (e) {
        console.error("Error reading draft from sessionStorage", e);
      }
    }
    return defaultForm;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key, value) => {
    const updated = { ...form, [key]: value };
    setForm(updated);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  };

  // Dynamic selector additions
  const handleAddLocation = (e) => {
    e.preventDefault();
    const val = newLocationVal.trim();
    if (!val) return;
    if (locations.some(loc => loc.toLowerCase() === val.toLowerCase())) {
      toast.error("Location already exists.");
      return;
    }
    addLocation(val);
    handleChange('location', val);
    setNewLocationVal("");
    setShowAddLocation(false);
    toast.success(`Location "${val}" added.`);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const val = newSkillVal.trim();
    if (!val) return;
    if (taskTypes.some(sk => sk.toLowerCase() === val.toLowerCase())) {
      toast.error("Skill category already exists.");
      return;
    }
    addSkill(val);
    handleChange('requiredSkill', val);
    setNewSkillVal("");
    setShowAddSkill(false);
    toast.success(`Skill "${val}" added.`);
  };

  const handleDeleteLocation = (e, loc) => {
    e.stopPropagation();
    if (locations.length <= 1) {
      toast.error("At least one location option is required.");
      return;
    }
    if (!window.confirm(`Delete location "${loc}"?`)) return;
    deleteLocation(loc);
    if (form.location === loc) {
      const remaining = locations.filter(l => l !== loc);
      handleChange('location', remaining[0] || "");
    }
  };

  const handleDeleteSkill = (e, sk) => {
    e.stopPropagation();
    if (taskTypes.length <= 1) {
      toast.error("At least one skill category is required.");
      return;
    }
    if (!window.confirm(`Delete skill "${sk}"?`)) return;
    deleteSkill(sk);
    if (form.requiredSkill === sk) {
      const remaining = taskTypes.filter(t => t !== sk);
      handleChange('requiredSkill', remaining[0] || "");
    }
  };

  const handleDispatch = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Please enter a task title.");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Please enter a short description.");
      return;
    }
    if (form.volunteersNeeded < 1) {
      toast.error("At least 1 volunteer slot is required.");
      return;
    }

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    setIsSubmitting(false);

    const selectedEvent = events.find(ev => ev.id === form.eventId);
    addTask({
      ...form,
      eventId: selectedEvent ? selectedEvent.id : '',
      eventName: selectedEvent ? selectedEvent.title : '',
    });
    toast.success("Task dispatched to live crew queue!");

    sessionStorage.removeItem(SESSION_KEY);
    // Reset form using current locations/skills first element
    setForm({
      title: "",
      description: "",
      volunteersNeeded: 1,
      location: locations[0] || "",
      requiredSkill: taskTypes[0] || "",
      durationLimit: 300,
      deadline: "ASAP",
      priority: "medium",
      eventId: "",
      eventName: "",
    });

    navigate('/dashboard');
  };

  const priorityColors = {
    low: 'var(--priority-low-border)',
    medium: 'var(--priority-medium-border)',
    high: 'var(--priority-high-border)',
    critical: 'var(--priority-critical-border)'
  };

  // Preview task payload shape
  const previewTask = {
    id: "task-preview",
    title: form.title || "Untitled Task Preview",
    description: form.description || "Describe specific duties, required deliverables, or tools to bring...",
    volunteersNeeded: form.volunteersNeeded,
    location: form.location,
    requiredSkill: form.requiredSkill,
    durationLimit: form.durationLimit,
    deadline: form.deadline || "ASAP",
    priority: form.priority,
    status: "pending",
    createdAt: new Date().toISOString(),
    acceptedBy: [],
    interestedVolunteers: [],
    messages: []
  };

  return (
    <div className="create-task-container afu">
      <div className="create-task-header">
        <h2>Dispatch Crew Task</h2>
        <p>Broadcast a new volunteer assignment to the active live queue</p>
      </div>

      <form onSubmit={handleDispatch} className="create-task-form">
        
        {/* Left Column: Input Form Fields */}
        <div className="form-column-left">
          {/* Task Title */}
          <div className="form-input-block">
            <label>Task Title</label>
            <div className="form-input-element">
              <input
                type="text"
                placeholder="e.g. Set up VIP Panel Audio Mixer"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                maxLength={60}
              />
            </div>
          </div>

          {/* Event Selector */}
          <div className="form-input-block">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🗓</span>
              <span>Linked Event <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></span>
            </label>
            {events.filter(ev => ev.status === 'active').length > 0 ? (
              <div className="form-select-element">
                <select
                  value={form.eventId}
                  onChange={e => handleChange('eventId', e.target.value)}
                  className="form-select"
                >
                  <option value="">— No event / standalone task —</option>
                  {events.filter(ev => ev.status === 'active').map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="event-selector-empty">
                <span>No active events.</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate('/create-event')}
                >
                  Create Event First
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="form-input-block">
            <label>Description</label>
            <div className="form-input-element">
              <textarea
                placeholder="Describe specific duties, required deliverables, or tools to bring..."
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                rows={4}
                maxLength={250}
              />
            </div>
          </div>

          {/* Location Picker (Tag UX) */}
          <div className="form-input-block">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={13} />
              <span>Location / Event Zone</span>
            </label>
            <div className="tag-picker-container">
              {locations.map(loc => {
                const isActive = form.location === loc;
                return (
                  <span
                    key={loc}
                    onClick={() => handleChange('location', loc)}
                    className={`picker-tag ${isActive ? 'active' : ''}`}
                  >
                    <span>{loc}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteLocation(e, loc)}
                      className="picker-tag-delete"
                      title="Remove option"
                    >
                      ×
                    </button>
                  </span>
                );
              })}

              {/* Add Location trigger */}
              {!showAddLocation ? (
                <button
                  type="button"
                  onClick={() => setShowAddLocation(true)}
                  className="add-tag-trigger-btn"
                >
                  <Plus size={12} />
                  <span>Add New</span>
                </button>
              ) : (
                <div className="add-tag-form">
                  <input
                    type="text"
                    placeholder="Location name..."
                    value={newLocationVal}
                    onChange={e => setNewLocationVal(e.target.value)}
                    className="add-tag-input"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLocation(e);
                      } else if (e.key === 'Escape') {
                        setShowAddLocation(false);
                      }
                    }}
                  />
                  <button type="button" onClick={handleAddLocation} className="add-tag-submit-btn">
                    <Check size={12} />
                  </button>
                  <button type="button" onClick={() => setShowAddLocation(false)} className="add-tag-cancel-btn">
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Required Skill Category (Tag UX) */}
          <div className="form-input-block">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BadgeInfo size={13} />
              <span>Required Skill Category</span>
            </label>
            <div className="tag-picker-container">
              {taskTypes.map(sk => {
                const isActive = form.requiredSkill === sk;
                return (
                  <span
                    key={sk}
                    onClick={() => handleChange('requiredSkill', sk)}
                    className={`picker-tag ${isActive ? 'active' : ''}`}
                  >
                    <span>{sk}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSkill(e, sk)}
                      className="picker-tag-delete"
                      title="Remove option"
                    >
                      ×
                    </button>
                  </span>
                );
              })}

              {/* Add Skill trigger */}
              {!showAddSkill ? (
                <button
                  type="button"
                  onClick={() => setShowAddSkill(true)}
                  className="add-tag-trigger-btn"
                >
                  <Plus size={12} />
                  <span>Add New</span>
                </button>
              ) : (
                <div className="add-tag-form">
                  <input
                    type="text"
                    placeholder="Skill category..."
                    value={newSkillVal}
                    onChange={e => setNewSkillVal(e.target.value)}
                    className="add-tag-input"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(e);
                      } else if (e.key === 'Escape') {
                        setShowAddSkill(false);
                      }
                    }}
                  />
                  <button type="button" onClick={handleAddSkill} className="add-tag-submit-btn">
                    <Check size={12} />
                  </button>
                  <button type="button" onClick={() => setShowAddSkill(false)} className="add-tag-cancel-btn">
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Priority and Slots Row */}
          <div className="form-grid-2col">
            <div className="form-input-block">
              <label>Priority Level</label>
              <div className="form-select-element" style={{ color: priorityColors[form.priority] }}>
                <ShieldAlert size={14} className="select-addon-icon" />
                <select 
                  value={form.priority} 
                  onChange={e => handleChange('priority', e.target.value)}
                  style={{ color: priorityColors[form.priority], fontWeight: 600 }}
                >
                  <option value="low">LOW</option>
                  <option value="medium">MEDIUM</option>
                  <option value="high">HIGH</option>
                  <option value="critical">CRITICAL</option>
                </select>
              </div>
            </div>

            <div className="form-input-block">
              <label>Volunteers Needed</label>
              <div className="form-input-element">
                <Users size={14} className="input-addon-icon" />
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={form.volunteersNeeded}
                  onChange={e => handleChange('volunteersNeeded', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          </div>

          {/* Expiry Countdown Timer and Clock Deadline */}
          <div className="form-grid-2col">
            <div className="form-input-block">
              <label>Acceptance Window (minutes)</label>
              <div className="form-input-element">
                <Clock size={14} className="input-addon-icon" />
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={Math.round(form.durationLimit / 60)}
                  onChange={e => handleChange('durationLimit', (parseInt(e.target.value) || 5) * 60)}
                />
              </div>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
                Task auto-expires in {Math.round(form.durationLimit / 60)} min if not fully staffed.
              </span>
            </div>

            <div className="form-input-block">
              <label>Task Deadline (clock time)</label>
              <div className="form-input-element">
                <Clock size={14} className="input-addon-icon" />
                <input
                  type="time"
                  value={form.deadline === 'ASAP' ? '' : form.deadline}
                  onChange={e => handleChange('deadline', e.target.value || 'ASAP')}
                />
              </div>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
                {form.deadline === 'ASAP' ? 'No fixed deadline — ASAP.' : `Must complete by ${form.deadline}.`}
              </span>
            </div>
          </div>

          {/* Broadcast Trigger Button */}
          <div style={{ marginTop: '12px' }}>
            <button 
              type="submit" 
              className="dispatch-submit-btn" 
              disabled={isSubmitting}
              style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
            >
              <Send size={15} />
              <span>{isSubmitting ? 'Spawning threads...' : 'Broadcast Dispatch'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Feed Preview and Rules Card */}
        <div className="form-column-right">
          <div className="create-task-header" style={{ marginBottom: '-8px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Live Dispatch Preview</h3>
            <p style={{ fontSize: '12px' }}>This is how the task card renders in the active volunteer queue feed.</p>
          </div>

          {/* High fidelity live preview card */}
          <div className="preview-card-outer" style={{ pointerEvents: 'none', opacity: 0.9 }}>
            <TaskCard task={previewTask} role="volunteer" />
          </div>

          {/* Dispatch Guidelines Card */}
          <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h4 style={{ fontFamily: 'Sora', fontSize: '13px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={14} />
              <span>Dispatch Protocols</span>
            </h4>
            <ul style={{ paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.4' }}>
              <li>Priority <strong>CRITICAL</strong> alerts lock active dispatches and pulse color lines on operator screens.</li>
              <li>Required Skill Categories restrict feed items until volunteers explicitly check "Show All".</li>
              <li>Volunteers checked into slots are locked under "Busy Lock" until task resolution is logged.</li>
            </ul>
          </div>
        </div>

      </form>
    </div>
  );
}
