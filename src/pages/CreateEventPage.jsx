import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Calendar, MapPin, FileText, Plus, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateEventPage() {
  const { createEvent, user } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Event title is required.';
    if (form.title.trim().length > 0 && form.title.trim().length < 3) newErrors.title = 'Title must be at least 3 characters.';
    if (!form.date) newErrors.date = 'Event date is required.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 600));

    createEvent({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      venue: form.venue.trim(),
      createdBy: user?.id || 'org-1',
    });

    setIsSubmitting(false);
    toast.success(`Event "${form.title.trim()}" created successfully!`);
    navigate('/dashboard');
  };

  return (
    <div className="page-content-wrapper">
      <div className="create-event-page afu">
        {/* Header */}
        <div className="create-event-header">
          <div className="create-event-title-block">
            <h1>Create New Event</h1>
            <p>Define the event and then add tasks under it from the dashboard.</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="create-event-form-card">
          <form onSubmit={handleSubmit} className="create-event-form">
            {/* Title */}
            <div className="cev-field-group">
              <label className="cev-label">
                Event Title <span className="cev-required">*</span>
              </label>
              <div className={`input-icon-wrapper ${focusedInput === 'title' ? 'focused' : ''} ${errors.title ? 'error' : ''}`}>
                <CheckCircle2 size={16} className="input-field-icon" />
                <input
                  type="text"
                  placeholder="e.g. TechFest 2025 — Annual Hackathon"
                  value={form.title}
                  onChange={e => handleChange('title', e.target.value)}
                  onFocus={() => setFocusedInput('title')}
                  onBlur={() => setFocusedInput(null)}
                  disabled={isSubmitting}
                  maxLength={80}
                />
              </div>
              {errors.title && <span className="cev-error-text">{errors.title}</span>}
            </div>

            {/* Description */}
            <div className="cev-field-group">
              <label className="cev-label">Description</label>
              <div className={`cev-textarea-wrapper ${focusedInput === 'desc' ? 'focused' : ''}`}>
                <FileText size={15} className="cev-textarea-icon" />
                <textarea
                  placeholder="Brief description of the event, goals, or key notes for your crew..."
                  value={form.description}
                  onChange={e => handleChange('description', e.target.value)}
                  onFocus={() => setFocusedInput('desc')}
                  onBlur={() => setFocusedInput(null)}
                  disabled={isSubmitting}
                  rows={4}
                  maxLength={500}
                />
              </div>
              <span className="cev-char-count">{form.description.length}/500</span>
            </div>

            {/* Date & Venue (two-column layout) */}
            <div className="cev-two-col">
              {/* Date */}
              <div className="cev-field-group">
                <label className="cev-label">
                  Event Date <span className="cev-required">*</span>
                </label>
                <div className={`input-icon-wrapper ${focusedInput === 'date' ? 'focused' : ''} ${errors.date ? 'error' : ''}`}>
                  <Calendar size={16} className="input-field-icon" />
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => handleChange('date', e.target.value)}
                    onFocus={() => setFocusedInput('date')}
                    onBlur={() => setFocusedInput(null)}
                    disabled={isSubmitting}
                    min={new Date().toISOString().slice(0, 10)}
                  />
                </div>
                {errors.date && <span className="cev-error-text">{errors.date}</span>}
              </div>

              {/* Venue */}
              <div className="cev-field-group">
                <label className="cev-label">Venue / Location</label>
                <div className={`input-icon-wrapper ${focusedInput === 'venue' ? 'focused' : ''}`}>
                  <MapPin size={16} className="input-field-icon" />
                  <input
                    type="text"
                    placeholder="e.g. Convention Center Hall A"
                    value={form.venue}
                    onChange={e => handleChange('venue', e.target.value)}
                    onFocus={() => setFocusedInput('venue')}
                    onBlur={() => setFocusedInput(null)}
                    disabled={isSubmitting}
                    maxLength={80}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="cev-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !form.title.trim() || !form.date}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="spin-loader" />
                    <span>Creating Event...</span>
                  </>
                ) : (
                  <>
                    <Plus size={15} />
                    <span>Create Event</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Hint Card */}
        <div className="cev-hint-card">
          <div className="cev-hint-icon">💡</div>
          <div>
            <strong>Next Step:</strong> After creating the event, go to the Dashboard and use
            &ldquo;Dispatch Task&rdquo; to create tasks linked to this event.
            Event progress will automatically update as tasks are completed.
          </div>
        </div>
      </div>
    </div>
  );
}
