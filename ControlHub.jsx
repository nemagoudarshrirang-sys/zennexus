function ControlHub({ isOpen, onClose, report, sessions, onAddSession, onClearSessions, onGoToPlanner }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="hub-overlay">
      <div className="surface-card hub-panel">
        <div className="hub-head">
          <div>
            <p className="eyebrow">Control Hub</p>
            <h2>Quick Access</h2>
          </div>
          <button className="btn btn-secondary" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="mini-grid">
          <div className="stat-chip">
            <span>Score</span>
            <strong>{report.finalScore}%</strong>
          </div>
          <div className="stat-chip">
            <span>Completed</span>
            <strong>{report.sessionsCompleted}</strong>
          </div>
          <div className="stat-chip">
            <span>Cancelled</span>
            <strong>{report.sessionsCancelled}</strong>
          </div>
          <div className="stat-chip">
            <span>Streak</span>
            <strong>{report.streak}</strong>
          </div>
          <div className="stat-chip">
            <span>Best Streak</span>
            <strong>{report.bestStreak}</strong>
          </div>
        </div>

        <div className="separator" />

        <div>
          <p className="eyebrow">Session History Preview</p>
          <div className="history-list">
            {sessions.slice(0, 5).map((entry) => (
              <article key={entry.id} className="history-row">
                <span>
                  {new Date(entry.timestamp).toLocaleString()}
                  {entry.plannedSessionLabel ? ` | ${entry.plannedSessionLabel}` : ""}
                </span>
                <span>{entry.status}</span>
              </article>
            ))}
            {sessions.length === 0 && <p className="muted">No sessions tracked yet.</p>}
          </div>
        </div>

        <div className="separator" />

        <div className="button-row">
          <button className="btn btn-primary" onClick={onAddSession} type="button">
            Add Session
          </button>
          <button className="btn btn-danger" onClick={onClearSessions} type="button">
            Clear Sessions
          </button>
          <button className="btn btn-secondary" onClick={onGoToPlanner} type="button">
            Go to Planner
          </button>
        </div>
      </div>
    </div>
  );
}

export default ControlHub;
