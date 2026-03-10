// components/StudentForm.jsx
// Handles both Add and Edit modes for student records.
// Includes full validation with inline error messages.

import { useState, useEffect } from 'react';

// ── Validation helpers ──────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (fields) => {
  const errors = {};

  if (!fields.name.trim()) {
    errors.name = 'Name is required.';
  } else if (fields.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!fields.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(fields.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!fields.age) {
    errors.age = 'Age is required.';
  } else if (isNaN(Number(fields.age)) || Number(fields.age) <= 0) {
    errors.age = 'Age must be a positive number.';
  } else if (!Number.isInteger(Number(fields.age))) {
    errors.age = 'Age must be a whole number.';
  }

  return errors;
};

// ── Component ───────────────────────────────────────────────
const StudentForm = ({ editingStudent, onSubmit, onCancel }) => {
  // Form field state
  const [fields, setFields] = useState({ name: '', email: '', age: '' });
  // Validation errors
  const [errors, setErrors] = useState({});
  // Whether the user has attempted submission (controls when errors show)
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill form when editingStudent changes (Edit mode)
  useEffect(() => {
    if (editingStudent) {
      setFields({
        name:  editingStudent.name,
        email: editingStudent.email,
        age:   String(editingStudent.age),
      });
      setErrors({});
      setSubmitted(false);
    } else {
      // Reset to empty for Add mode
      setFields({ name: '', email: '', age: '' });
      setErrors({});
      setSubmitted(false);
    }
  }, [editingStudent]);

  // Re-validate live once the user has already attempted submission
  useEffect(() => {
    if (submitted) {
      setErrors(validate(fields));
    }
  }, [fields, submitted]);

  // ── Handlers ─────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Pass clean data up to parent
    onSubmit({
      name:  fields.name.trim(),
      email: fields.email.trim().toLowerCase(),
      age:   Number(fields.age),
    });

    // Reset form on success
    setFields({ name: '', email: '', age: '' });
    setErrors({});
    setSubmitted(false);
  };

  const handleCancel = () => {
    setFields({ name: '', email: '', age: '' });
    setErrors({});
    setSubmitted(false);
    onCancel();
  };

  const isEditing = Boolean(editingStudent);

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="card">
      {/* Card header */}
      <div className="card-header">
        <h2 className="card-title">
          <span className="icon">{isEditing ? '✏️' : '＋'}</span>
          {isEditing ? 'Edit Student' : 'Add Student'}
        </h2>
      </div>

      <div className="card-body">
        {/* Edit mode banner */}
        {isEditing && (
          <div className="edit-banner">
            ✏️ Editing: <strong>{editingStudent.name}</strong>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* ── Name ─────────────────────────── */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Name <span className="required">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="e.g. Alice Johnson"
              value={fields.name}
              onChange={handleChange}
              autoComplete="off"
            />
            {errors.name && (
              <div className="form-error" role="alert">
                ⚠ {errors.name}
              </div>
            )}
          </div>

          {/* ── Email ────────────────────────── */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="e.g. alice@example.com"
              value={fields.email}
              onChange={handleChange}
              autoComplete="off"
            />
            {errors.email && (
              <div className="form-error" role="alert">
                ⚠ {errors.email}
              </div>
            )}
          </div>

          {/* ── Age ──────────────────────────── */}
          <div className="form-group">
            <label className="form-label" htmlFor="age">
              Age <span className="required">*</span>
            </label>
            <input
              id="age"
              name="age"
              type="number"
              min="1"
              max="120"
              className={`form-input ${errors.age ? 'error' : ''}`}
              placeholder="e.g. 21"
              value={fields.age}
              onChange={handleChange}
            />
            {errors.age && (
              <div className="form-error" role="alert">
                ⚠ {errors.age}
              </div>
            )}
          </div>

          {/* ── Actions ──────────────────────── */}
          <div className="form-actions">
            {isEditing && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary">
              {isEditing ? '💾 Save Changes' : '＋ Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;