import SessionHistory from "./SessionHistory";

function AnalyticsPanel({ report, sessions, onDeleteSession }) {
  return (
    <section className="view-stack">
      <header className="section-head">
        <p className="eyebrow">Analytics</p>
        <h2>Session Insights</h2>
      </header>
      <div className="section-divider">
        <span>Analytics</span>
      </div>

      <div className="mini-grid">
        <div className="stat-chip">
          <span>Total Days</span>
          <strong>{report.totalDays}</strong>
        </div>
        <div className="stat-chip">
          <span>Streak</span>
          <strong>{report.streak}</strong>
        </div>
        <div className="stat-chip">
          <span>Best Streak</span>
          <strong>{report.bestStreak}</strong>
        </div>
        <div className="stat-chip">
          <span>Completed</span>
          <strong>{report.sessionsCompleted}</strong>
        </div>
        <div className="stat-chip">
          <span>Cancelled</span>
          <strong>{report.sessionsCancelled}</strong>
        </div>
      </div>

      <div className="separator" />

      <SessionHistory onDeleteSession={onDeleteSession} sessions={sessions} />
    </section>
  );
}

export default AnalyticsPanel;
