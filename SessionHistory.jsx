import { useMemo, useState } from "react";

const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" }
];

function SessionHistory({ sessions, onDeleteSession }) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredSessions = useMemo(() => {
    if (activeFilter === "all") {
      return sessions;
    }

    return sessions.filter((session) => session.status === activeFilter);
  }, [activeFilter, sessions]);

  return (
    <section className="surface-card">
      <div className="history-head">
        <div>
          <p className="eyebrow">Session History</p>
          <h3>All Tracked Sessions</h3>
        </div>
        <div className="button-row">
          {FILTER_OPTIONS.map((option) => (
            <button
              className={`btn ${activeFilter === option.key ? "btn-active" : ""}`}
              key={option.key}
              onClick={() => setActiveFilter(option.key)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="history-scroll">
        {filteredSessions.map((session) => (
          <article className="history-card" key={session.id}>
            <div>
              <p className="history-time">{new Date(session.timestamp).toLocaleString()}</p>
              {session.plannedSessionLabel && <p className="muted">Linked: {session.plannedSessionLabel}</p>}
            </div>
            <div className="history-actions">
              <span className={`status-pill status-${session.status}`}>{session.status}</span>
              <button className="btn btn-danger" onClick={() => onDeleteSession(session.id)} type="button">
                Delete
              </button>
            </div>
          </article>
        ))}

        {filteredSessions.length === 0 && <p className="muted">No sessions match this filter.</p>}
      </div>
    </section>
  );
}

export default SessionHistory;
