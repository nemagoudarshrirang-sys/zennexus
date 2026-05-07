import { useEffect, useMemo, useState } from "react";
import Dashboard from "./components/Dashboard";
import AnalyticsPanel from "./components/dashboard/AnalyticsPanel";
import ControlHub from "./components/dashboard/ControlHub";
import PlannerPanel from "./components/dashboard/PlannerPanel";
import SettingsPanel from "./components/dashboard/SettingsPanel";
import TopNavbar from "./components/layout/TopNavbar";
import { useTheme } from "./context/ThemeContext";
import {
  addSession,
  addPlannedSession,
  clearSessions,
  clearPlannedSessions,
  deleteSession,
  getDisciplineReport,
  getPlannedSessions,
  getSessions,
  updatePlannedSessionStatus
} from "./services/sessionManager";

const HARD_MODE_KEY = "zennexus.v2.hardMode";

function getStoredHardMode() {
  if (typeof localStorage === "undefined") {
    return false;
  }

  return localStorage.getItem(HARD_MODE_KEY) === "true";
}

function App() {
  const { theme, setTheme } = useTheme();
  const [activeView, setActiveView] = useState("dashboard");
  const [isHubOpen, setHubOpen] = useState(false);
  const [sessions, setSessions] = useState(() => getSessions());
  const [plannedSessions, setPlannedSessions] = useState(() => getPlannedSessions());
  const [hardModeEnabled, setHardModeEnabled] = useState(getStoredHardMode);

  const report = useMemo(
    () =>
      getDisciplineReport(
        {},
        sessions,
        plannedSessions
      ),
    [plannedSessions, sessions]
  );

  const plannedSessionOptions = useMemo(() => {
    return plannedSessions
      .filter((session) => session.status === "planned")
      .map((session) => ({
        id: session.id,
        label: `${session.title} (${session.plannedFor})`
      }));
  }, [plannedSessions]);

  useEffect(() => {
    if (typeof localStorage === "undefined") {
      return;
    }

    localStorage.setItem(HARD_MODE_KEY, String(hardModeEnabled));
  }, [hardModeEnabled]);

  const handleAddSession = (status, options = {}) => {
    addSession(status, options);
    setSessions(getSessions());
  };

  const handleTrackTimerSession = ({ status, plannedSessionId, plannedSessionLabel }) => {
    handleAddSession(status, {
      plannedSessionId: plannedSessionId || null,
      plannedSessionLabel: plannedSessionLabel || null
    });

    if (status === "completed" && plannedSessionId) {
      updatePlannedSessionStatus(plannedSessionId, "completed");
      setPlannedSessions(getPlannedSessions());
    }
  };

  const handleClearSessions = () => {
    clearSessions();
    setSessions([]);
  };

  const handleDeleteSession = (sessionId) => {
    deleteSession(sessionId);
    setSessions(getSessions());
  };

  const handleCreatePlannedSession = (payload) => {
    addPlannedSession(payload);
    setPlannedSessions(getPlannedSessions());
  };

  const handleResetAllData = () => {
    const shouldReset = window.confirm("Reset all data?");
    if (!shouldReset) {
      return;
    }

    clearSessions();
    clearPlannedSessions();
    setSessions([]);
    setPlannedSessions([]);
    setHardModeEnabled(false);

    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(HARD_MODE_KEY);
    }
  };

  const navigateToPlanner = () => {
    setActiveView("planner");
    setHubOpen(false);
  };

  const renderView = () => {
    if (activeView === "planner") {
      return (
        <PlannerPanel
          hardModeEnabled={hardModeEnabled}
          onCreatePlan={handleCreatePlannedSession}
          plannedSessions={plannedSessions}
        />
      );
    }

    if (activeView === "analytics") {
      return <AnalyticsPanel onDeleteSession={handleDeleteSession} report={report} sessions={sessions} />;
    }

    if (activeView === "settings") {
      return (
        <SettingsPanel
          hardModeEnabled={hardModeEnabled}
          onResetAllData={handleResetAllData}
          onThemeChange={setTheme}
          onToggleHardMode={() => setHardModeEnabled((value) => !value)}
          sessionSummary={{
            sessionsPlanned: report.sessionsPlanned,
            sessionsCompleted: report.plannedCompleted,
            sessionsCancelled: report.sessionsCancelled,
            streak: report.streak
          }}
          theme={theme}
        />
      );
    }

    return (
      <Dashboard
        onAddCancelled={() => handleAddSession("cancelled")}
        onAddCompleted={() => handleAddSession("completed")}
        onTrackTimerSession={handleTrackTimerSession}
        plannedSessionOptions={plannedSessionOptions}
        report={report}
        sessionCount={sessions.length}
      />
    );
  };

  return (
    <main className="app-shell">
      <div className="app-content">
        <TopNavbar
          activeView={activeView}
          hardModeEnabled={hardModeEnabled}
          onNavigate={setActiveView}
          onOpenControlHub={() => setHubOpen(true)}
        />
        {renderView()}
      </div>

      <ControlHub
        isOpen={isHubOpen}
        onAddSession={() => handleAddSession("completed")}
        onClearSessions={handleClearSessions}
        onClose={() => setHubOpen(false)}
        onGoToPlanner={navigateToPlanner}
        report={report}
        sessions={sessions}
      />
    </main>
  );
}

export default App;
