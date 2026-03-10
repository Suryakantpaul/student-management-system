// components/Loading.jsx
// Displays a full-screen loading overlay while data is being "fetched"

const Loading = () => {
  return (
    <div className="loading-overlay" role="status" aria-label="Loading students">
      {/* Spinning ring indicator */}
      <div className="spinner-ring" />

      {/* Animated label */}
      <span className="loading-label">Loading students…</span>
    </div>
  );
};

export default Loading;