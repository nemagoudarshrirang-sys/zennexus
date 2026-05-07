function MetricCard({ label, value }) {
  return (
    <div className="rounded-md border border-line bg-[#0d1119] px-3 py-3">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </div>
  );
}

function Analytics({ metrics, sessionLogs }) {
  return (
    <section className="panel p-5 md:p-6">
      <p className="panel-title">Analytics Section</p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight">Discipline Engine</h2>

      <div className="mt-5">
        <p className="panel-title">Score Overview</p>
        <div className="mt-2 rounded-lg border border-line bg-[#0d1119] px-4 py-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Final Score</p>
          <p className="mt-2 text-5xl font-semibold tracking-tight text-accent">{metrics.finalScore}%</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="panel-title">Core Metrics</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <MetricCard label="Consistency" value={`${metrics.consistency}%`} />
          <MetricCard label="Completion" value={`${metrics.completion}%`} />
          <MetricCard label="Integrity" value={`${metrics.integrity}%`} />
          <MetricCard label="Streak" value={`${metrics.streak} day(s)`} />
        </div>
      </div>

      <div className="mt-5 rounded-md border border-line bg-[#0d1119] px-3 py-3">
        <p className="panel-title">Today Snapshot</p>
        <p className="mt-1 text-sm text-slate-200">
          Planned: {metrics.todayComparison.planned} | Completed:{" "}
          {metrics.todayComparison.completed} | Cancelled: {metrics.todayComparison.cancelled}
        </p>
      </div>

      <div className="mt-5">
        <p className="panel-title">Session History</p>
      </div>
      <div className="mt-2 space-y-2">
        {sessionLogs.slice(0, 6).map((entry) => (
          <article key={entry.id} className="rounded-md border border-line px-3 py-2 text-sm">
            <div className="flex items-center justify-between">
              <span>{new Date(entry.timestamp).toLocaleString()}</span>
              <span className="uppercase tracking-[0.1em] text-slate-400">{entry.status}</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              {entry.durationMinutes}m {entry.plannedSessionId ? "| linked plan" : "| unplanned"}
            </p>
          </article>
        ))}

        {sessionLogs.length === 0 && (
          <p className="rounded-md border border-dashed border-line px-3 py-5 text-sm text-muted">
            No tracked sessions yet.
          </p>
        )}
      </div>
    </section>
  );
}

export default Analytics;
