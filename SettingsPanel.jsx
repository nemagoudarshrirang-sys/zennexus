function SettingsPanel({
  theme,
  hardModeEnabled,
  sessionSummary,
  onThemeChange,
  onToggleHardMode,
  onResetAllData
}) {
  return (
    <section className="view-stack">
      <header className="section-head">
        <p className="eyebrow">Settings</p>
        <h2>Control Center</h2>
      </header>

      <div className="settings-grid">
        <article className="surface-card">
          <p className="eyebrow">Theme</p>
          <h3>Appearance</h3>
          <div className="button-row">
            <button className={`btn btn-secondary ${theme === "dark" ? "btn-active" : ""}`} onClick={() => onThemeChange("dark")} type="button">
              Dark
            </button>
            <button className={`btn btn-secondary ${theme === "light" ? "btn-active" : ""}`} onClick={() => onThemeChange("light")} type="button">
              Light
            </button>
          </div>
        </article>

        <article className="surface-card">
          <p className="eyebrow">Mode</p>
          <h3>Hard Mode</h3>
          <button className={`toggle ${hardModeEnabled ? "toggle-on" : ""}`} onClick={onToggleHardMode} type="button">
            <span className="toggle-thumb" />
          </button>
        </article>

        <article className="surface-card">
          <p className="eyebrow">Session Stats</p>
          <h3>Summary</h3>
          <div className="mini-grid">
            <div className="stat-chip">
              <span>Planned</span>
              <strong>{sessionSummary.sessionsPlanned}</strong>
            </div>
            <div className="stat-chip">
              <span>Completed</span>
              <strong>{sessionSummary.sessionsCompleted}</strong>
            </div>
            <div className="stat-chip">
              <span>Cancelled</span>
              <strong>{sessionSummary.sessionsCancelled}</strong>
            </div>
            <div className="stat-chip">
              <span>Streak</span>
              <strong>{sessionSummary.streak}</strong>
            </div>
          </div>
        </article>

        <article className="surface-card">
          <p className="eyebrow">Danger Zone</p>
          <h3>Reset Data</h3>
          <p className="muted">This clears sessions and manual planner values.</p>
          <button className="btn btn-danger" onClick={onResetAllData} type="button">
            Reset All Data
          </button>
        </article>
      </div>
    </section>
  );
}

export default SettingsPanel;
