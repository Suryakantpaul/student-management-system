// App.jsx
// Root component. Manages global state: students list, loading,
// editing target, and toast notifications.

import { useState, useEffect } from 'react';
import StudentForm  from './components/StudentForm';
import StudentTable from './components/StudentTable';
import Loading      from './components/Loading';
import './styles.css';

// ── Initial sample data ─────────────────────────────────────
const INITIAL_STUDENTS = [
  { id: 1, name: 'Alice Johnson',   email: 'alice@example.com',   age: 21 },
  { id: 2, name: 'Bob Martinez',    email: 'bob@example.com',     age: 23 },
  { id: 3, name: 'Clara Nguyen',    email: 'clara@example.com',   age: 20 },
  { id: 4, name: 'David Kim',       email: 'david@example.com',   age: 22 },
  { id: 5, name: 'Eva Petrova',     email: 'eva@example.com',     age: 19 },
];

// ── localStorage helpers ────────────────────────────────────
const STORAGE_KEY = 'sms_students';

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota exceeded — silently ignore */
  }
};

// ── Toast component (inline, lightweight) ──────────────────
const Toast = ({ toasts }) => (
  <div className="toast-container" aria-live="polite">
    {toasts.map((t) => (
      <div key={t.id} className={`toast ${t.type}`}>
        <div className="toast-dot" />
        {t.message}
      </div>
    ))}
  </div>
);

// ── App ─────────────────────────────────────────────────────
const App = () => {
  // All students — initialised from localStorage or fallback data
  const [students, setStudents]         = useState([]);
  // Simulated loading flag
  const [loading, setLoading]           = useState(true);
  // The student currently being edited (null = Add mode)
  const [editingStudent, setEditingStudent] = useState(null);
  // Toast notifications queue
  const [toasts, setToasts]             = useState([]);
  // Next student id counter
  const [nextId, setNextId]             = useState(6);

  // ── Simulated initial load ────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = loadFromStorage();
      if (stored && stored.length > 0) {
        setStudents(stored);
        // Calculate next id from stored data
        const maxId = stored.reduce((m, s) => Math.max(m, s.id), 0);
        setNextId(maxId + 1);
      } else {
        setStudents(INITIAL_STUDENTS);
        saveToStorage(INITIAL_STUDENTS);
      }
      setLoading(false);
    }, 1500); // 1.5-second simulated load

    return () => clearTimeout(timer);
  }, []);

  // ── Persist to localStorage whenever students changes ─────
  useEffect(() => {
    if (!loading) {
      saveToStorage(students);
    }
  }, [students, loading]);

  // ── Toast helper ─────────────────────────────────────────
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // ── CRUD handlers ─────────────────────────────────────────

  /** Add a new student or save edits to an existing one */
  const handleSubmit = (data) => {
    if (editingStudent) {
      // Update existing
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editingStudent.id ? { ...s, ...data } : s
        )
      );
      addToast(`✅ "${data.name}" updated successfully.`, 'success');
      setEditingStudent(null);
    } else {
      // Add new
      const newStudent = { id: nextId, ...data };
      setStudents((prev) => [...prev, newStudent]);
      setNextId((n) => n + 1);
      addToast(`✅ "${data.name}" added successfully.`, 'success');
    }
  };

  /** Enter edit mode for a student */
  const handleEdit = (student) => {
    setEditingStudent(student);
    // Scroll form into view on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** Delete a student by id */
  const handleDelete = (id) => {
    const student = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    addToast(`🗑️ "${student?.name}" removed.`, 'error');
    // Clear edit mode if the deleted student was being edited
    if (editingStudent?.id === id) setEditingStudent(null);
  };

  /** Cancel editing — return to Add mode */
  const handleCancelEdit = () => setEditingStudent(null);

  // ── Loading screen ────────────────────────────────────────
  if (loading) return <Loading />;

  // ── Main UI ───────────────────────────────────────────────
  return (
    <div className="app-wrapper">
      <div className="app-container">

        {/* ── Header ─────────────────────────────────────── */}
        <header className="app-header">
          <div className="header-left">
            <div className="header-eyebrow">Academic Records</div>
            <h1 className="app-title">
              Student <em>Management</em> System
            </h1>
            <p className="header-meta">
              Add, edit, and export your student registry
            </p>
          </div>

          {/* Live student count */}
          <div className="header-stats">
            <div className="stat-pill">
              🎓 <strong>{students.length}</strong> students
            </div>
          </div>
        </header>

        {/* ── Main content grid ──────────────────────────── */}
        <main className="main-grid">
          {/* Left: Form */}
          <aside>
            <StudentForm
              editingStudent={editingStudent}
              onSubmit={handleSubmit}
              onCancel={handleCancelEdit}
            />
          </aside>

          {/* Right: Table */}
          <section>
            <StudentTable
              students={students}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </section>
        </main>
      </div>

      {/* Toast notifications */}
      <Toast toasts={toasts} />
    </div>
  );
};

export default App;