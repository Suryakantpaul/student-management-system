// components/StudentTable.jsx
// Displays the students table with sorting, search filtering,
// edit/delete actions, and an Excel download button.

import { useState } from 'react';
import { exportToExcel } from '../utils/exportExcel';

// ── Delete confirmation modal ───────────────────────────────
const DeleteModal = ({ student, onConfirm, onCancel }) => (
  <div className="modal-backdrop" role="dialog" aria-modal="true">
    <div className="modal">
      <div className="modal-icon">🗑️</div>
      <h2>Delete Student?</h2>
      <p>
        You're about to permanently remove{' '}
        <strong>{student.name}</strong> ({student.email}) from the list.
        This action cannot be undone.
      </p>
      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-danger" onClick={onConfirm}>
          Yes, Delete
        </button>
      </div>
    </div>
  </div>
);

// ── Helper: initials for avatar ─────────────────────────────
const initials = (name) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

// ── Main component ──────────────────────────────────────────
const StudentTable = ({ students, onEdit, onDelete }) => {
  // Search / filter
  const [query, setQuery]           = useState('');
  // Sort config: { key: string, dir: 'asc' | 'desc' }
  const [sort, setSort]             = useState({ key: 'name', dir: 'asc' });
  // Student targeted for deletion
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Sort handler ────────────────────────────────────────
  const handleSort = (key) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  };

  // ── Filter + sort pipeline ──────────────────────────────
  const filtered = students.filter((s) => {
    const q = query.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      String(s.age).includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sort.key];
    let valB = b[sort.key];

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sort.dir === 'asc' ? -1 : 1;
    if (valA > valB) return sort.dir === 'asc' ? 1 : -1;
    return 0;
  });

  // ── Sort icon helper ────────────────────────────────────
  const sortIcon = (key) => {
    if (sort.key !== key) return <span className="sort-icon">↕</span>;
    return (
      <span className="sort-icon" style={{ color: 'var(--accent)' }}>
        {sort.dir === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  // ── Delete flow ─────────────────────────────────────────
  const confirmDelete = () => {
    onDelete(deleteTarget.id);
    setDeleteTarget(null);
  };

  // ── Excel export ─────────────────────────────────────────
  const handleExport = () => {
    // Export current filtered/sorted view
    exportToExcel(
      sorted,
      query ? `students_filtered_${Date.now()}.xlsx` : 'students.xlsx'
    );
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <>
      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteModal
          student={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="card table-panel">
        {/* Card header */}
        <div className="card-header">
          <h2 className="card-title">
            <span className="icon">📋</span>
            Students
          </h2>
          {/* Download Excel button */}
          <button
            className="btn btn-success"
            onClick={handleExport}
            disabled={sorted.length === 0}
            title="Download visible rows as Excel"
          >
            ⬇ Export Excel
          </button>
        </div>

        {/* Search toolbar */}
        <div className="table-toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, email, or age…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search students"
            />
          </div>
          {query && (
            <button
              className="btn btn-secondary btn-icon"
              onClick={() => setQuery('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Table */}
        <div className="table-scroll">
          {sorted.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎓</div>
              <h3>{query ? 'No results found' : 'No students yet'}</h3>
              <p>
                {query
                  ? `No students match "${query}".`
                  : 'Use the form to add your first student.'}
              </p>
            </div>
          ) : (
            <table className="students-table" aria-label="Students list">
              <thead>
                <tr>
                  <th
                    onClick={() => handleSort('name')}
                    className={sort.key === 'name' ? 'active' : ''}
                  >
                    Name {sortIcon('name')}
                  </th>
                  <th
                    onClick={() => handleSort('email')}
                    className={sort.key === 'email' ? 'active' : ''}
                  >
                    Email {sortIcon('email')}
                  </th>
                  <th
                    onClick={() => handleSort('age')}
                    className={sort.key === 'age' ? 'active' : ''}
                    style={{ width: '90px' }}
                  >
                    Age {sortIcon('age')}
                  </th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((student, idx) => (
                  <tr
                    key={student.id}
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    {/* Name + avatar */}
                    <td>
                      <div className="student-name">
                        <div className="avatar">{initials(student.name)}</div>
                        {student.name}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="td-email">{student.email}</td>

                    {/* Age badge */}
                    <td className="td-age">
                      <span className="age-badge">{student.age}</span>
                    </td>

                    {/* Actions */}
                    <td className="td-actions">
                      <button
                        className="btn btn-secondary btn-icon"
                        onClick={() => onEdit(student)}
                        title="Edit student"
                        aria-label={`Edit ${student.name}`}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-danger btn-icon"
                        onClick={() => setDeleteTarget(student)}
                        title="Delete student"
                        aria-label={`Delete ${student.name}`}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer row count */}
        <div className="table-footer">
          <span className="count-label">
            Showing{' '}
            <strong>
              {sorted.length} of {students.length}
            </strong>{' '}
            student{students.length !== 1 ? 's' : ''}
            {query && ` — filtered by "${query}"`}
          </span>
          {query && sorted.length > 0 && (
            <span className="count-label">
              Export will download <strong>{sorted.length}</strong> filtered row
              {sorted.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentTable;