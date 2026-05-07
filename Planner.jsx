import { useState } from "react";
import { formatISODate } from "../../utils/date";

function Planner({ plannedSessions, onAddPlan }) {
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [plannedFor, setPlannedFor] = useState(formatISODate(new Date()));

  const submitPlan = (event) => {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }

    onAddPlan({
      title: title.trim(),
      durationMinutes: Number(durationMinutes) || 25,
      plannedFor
    });

    setTitle("");
    setDurationMinutes(25);
  };

  return (
    <section className="panel p-5 md:p-6">
      <p className="panel-title">Planner Section</p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight">Daily Planner</h2>

      <form className="mt-4 space-y-3" onSubmit={submitPlan}>
        <input
          className="w-full rounded-md border border-line bg-[#0d1119] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
          placeholder="Session title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-2">
          <input
            className="rounded-md border border-line bg-[#0d1119] px-3 py-2 text-sm text-slate-100"
            type="number"
            min="5"
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(event.target.value)}
            required
          />

          <input
            className="rounded-md border border-line bg-[#0d1119] px-3 py-2 text-sm text-slate-100"
            type="date"
            value={plannedFor}
            onChange={(event) => setPlannedFor(event.target.value)}
            required
          />
        </div>

        <button
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-50 hover:bg-slate-100 hover:text-slate-900"
          type="submit"
        >
          Add Planned Session
        </button>
      </form>

      <div className="mt-5 space-y-2">
        {plannedSessions.slice(0, 7).map((session) => (
          <article
            key={session.id}
            className="rounded-md border border-line bg-[#0d1119] px-3 py-2 text-sm"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{session.title}</p>
              <span className="text-xs uppercase tracking-[0.12em] text-slate-400">
                {session.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              {session.durationMinutes}m | Planned {session.plannedFor}
            </p>
          </article>
        ))}

        {plannedSessions.length === 0 && (
          <p className="rounded-md border border-dashed border-line px-3 py-5 text-sm text-muted">
            No planned sessions yet.
          </p>
        )}
      </div>
    </section>
  );
}

export default Planner;
