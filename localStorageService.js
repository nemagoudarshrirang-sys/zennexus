const STORAGE_KEYS = {
  plannedSessions: "zennexus.v2.plannedSessions",
  sessionLogs: "zennexus.v2.sessionLogs"
};

const fallbackData = {
  plannedSessions: [],
  sessionLogs: []
};

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function parseList(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function safeRead(key, fallback) {
  const raw = localStorage.getItem(key);
  return raw ? parseList(raw, fallback) : fallback;
}

function safeWrite(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getPlannedSessions() {
  return safeRead(STORAGE_KEYS.plannedSessions, fallbackData.plannedSessions);
}

export function savePlannedSessions(sessions) {
  safeWrite(STORAGE_KEYS.plannedSessions, sessions);
}

export function getSessionLogs() {
  return safeRead(STORAGE_KEYS.sessionLogs, fallbackData.sessionLogs);
}

export function saveSessionLogs(logs) {
  safeWrite(STORAGE_KEYS.sessionLogs, logs);
}

export function createPlannedSession({ title, durationMinutes, plannedFor }) {
  return {
    id: createId(),
    title,
    durationMinutes,
    plannedFor,
    status: "planned",
    createdAt: new Date().toISOString()
  };
}

export function updatePlannedSessionStatus(sessions, plannedSessionId, status) {
  return sessions.map((session) =>
    session.id === plannedSessionId
      ? { ...session, status, updatedAt: new Date().toISOString() }
      : session
  );
}

export function createTrackedSession({ plannedSessionId, status, durationMinutes }) {
  return {
    id: createId(),
    timestamp: new Date().toISOString(),
    plannedSessionId: plannedSessionId ?? null,
    status,
    durationMinutes
  };
}
