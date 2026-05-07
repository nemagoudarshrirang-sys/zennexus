import { useEffect, useMemo, useState } from "react";

const DEFAULT_MINUTES = 25;

function FocusTimer({ onTrackSession, plannedSessionOptions = [] }) {
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);

  const selectedPlan = useMemo(
    () => plannedSessionOptions.find((plan) => plan.id === selectedPlanId) || null,
    [plannedSessionOptions, selectedPlanId]
  );

  const handleSessionDone = (status) => {
    onTrackSession({
      status,
      plannedSessionId: selectedPlan?.id || null,
      plannedSessionLabel: selectedPlan?.label || null
    });

    setIsRunning(false);
    setRemainingSeconds(DEFAULT_MINUTES * 60);
    setSelectedPlanId("");
  };

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const ticker = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          clearInterval(ticker);
          setIsRunning(false);
          handleSessionDone("completed");
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(ticker);
  }, [isRunning]);

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(DEFAULT_MINUTES * 60);
  };

  const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const seconds = String(remainingSeconds % 60).padStart(2, "0");

  return (
    <article className="surface-card timer-card">
      <p className="eyebrow">Focus Timer</p>
      <h3>25 Minute Session</h3>
      <div className="section-divider">
        <span>Timer</span>
      </div>

      <label className="timer-label">
        Select Planned Session
        <select value={selectedPlanId} onChange={(event) => setSelectedPlanId(event.target.value)}>
          <option value="">No linked plan</option>
          {plannedSessionOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <p className="timer-display">
        {minutes}:{seconds}
      </p>

      <div className="timer-actions">
        <button className="btn btn-primary" onClick={() => setIsRunning((value) => !value)} type="button">
          {isRunning ? "Pause" : "Start"}
        </button>
        <button className="btn btn-secondary" onClick={handleReset} type="button">
          Reset
        </button>
        <button className="btn btn-primary" onClick={() => handleSessionDone("completed")} type="button">
          Complete
        </button>
        <button className="btn btn-danger" onClick={() => handleSessionDone("cancelled")} type="button">
          Cancel
        </button>
      </div>
    </article>
  );
}

export default FocusTimer;
