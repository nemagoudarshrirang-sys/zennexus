import { useState } from "react";
import { formatISODate } from "../../utils/date";

function PlannerPanel({ plannedSessions, onCreatePlan, hardModeEnabled }) {
  const [title, setTitle] = useState("");
  const [plannedFor, setPlannedFor] = useState(formatISODate(new Date()));

  const plannedCount = plannedSessions.length;
  const completedCount = plannedSessions.filter((session) => session.status === "completed").length;

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    onCreatePlan({
      title: trimmedTitle,
      plannedFor
    });

    setTitle("");
  };

  return (
    <section className="view-stack">
      <header className="section-head">
        <p className="eyebrow">Planner</p>
        <h2>Planned Sessions</h2>
      </header>
      <div className="section-divider">
        <span>Planner</span>
      </div>

      <form className="surface-card form-stack" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Session Title
            <input
              className="planner-input"
              placeholder="e.g. Deep Work - DSA"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label>
            Planned Date
            <input
              className="planner-input"
              type="date"
              value={plannedFor}
              onChange={(event) => setPlannedFor(event.target.value)}
            />
          </label>
        </div>

        <div className="button-row">
          <button className="btn btn-primary" type="submit">
            Add Planned Session
          </button>
        </div>

        <p className="muted">Hard mode: {hardModeEnabled ? "Enabled" : "Disabled"}</p>
      </form>

      <article className="surface-card">
        <p className="eyebrow">Planner Progress</p>
        <h3>
          Planned vs Completed: {completedCount} / {plannedCount}
        </h3>
        <div className="history-scroll">
          {plannedSessions.map((session) => (
            <article className="history-card" key={session.id}>
              <div>
                <p className="history-time">{session.title}</p>
                <p className="muted">{session.plannedFor}</p>
              </div>
              <span className={`status-pill status-${session.status}`}>
                {session.status}
              </span>
            </article>
          ))}

          {plannedSessions.length === 0 && <p className="muted">No planned sessions yet.</p>}
        </div>
      </article>
    </section>
  );
}

export default PlannerPanel;
