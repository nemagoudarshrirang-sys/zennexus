const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "planner", label: "Planner" },
  { id: "analytics", label: "Analytics" },
  { id: "settings", label: "Settings" }
];

function TopNavbar({ activeView, onNavigate, onOpenControlHub, hardModeEnabled }) {
  return (
    <header className="surface-card top-nav">
      <div className="brand-row">
        <p className="brand-title">Zennexus</p>
        {hardModeEnabled && <span className="pill">Hard Mode</span>}
      </div>

      <div className="nav-actions">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`btn btn-secondary ${activeView === item.id ? "btn-active" : ""}`}
            onClick={() => onNavigate(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
        <button className="btn btn-primary" onClick={onOpenControlHub} type="button">
          Open Control Hub
        </button>
      </div>
    </header>
  );
}

export default TopNavbar;
