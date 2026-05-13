import { formatISODate } from "../utils/date";
import { calculateDisciplineFromStats, calculateStreaks } from "./disciplineEngine";

const SESSION_STORAGE_KEY = "zennexus.v2.sessions";
const PLANNED_SESSION_STORAGE_KEY = "zennexus.v2.plannedSessions";
const ALLOWED_SESSION_STATUSES = new Set(["completed", "cancelled"]);
const ALLOWED_PLANNED_STATUSES = new Set(["planned", "completed", "cancelled"]);

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function isValidDate(value) {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function toPercent(value) {
  return Number((value * 100).toFixed(1));
}

function normalizeWholeNumber(value, fallback = 0) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return fallback;
  }

  return Math.floor(numberValue);
}

function readFromStorage(key) {
  if (typeof localStorage === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeToStorage(key, value) {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeSession(session) {
  if (!session || typeof session !== "object") {
    return null;
  }

  const id = typeof session.id === "string" && session.id.trim() ? session.id : null;
  const status = typeof session.status === "string" ? session.status : null;
  const timestamp = session.timestamp;
  const plannedSessionId =
    typeof session.plannedSessionId === "string" && session.plannedSessionId.trim()
      ? session.plannedSessionId
      : null;
  const plannedSessionLabel =
    typeof session.plannedSessionLabel === "string" && session.plannedSessionLabel.trim()
      ? session.plannedSessionLabel
      : null;

  if (!id || !ALLOWED_SESSION_STATUSES.has(status) || !isValidDate(timestamp)) {
    return null;
  }

  return {
    id,
    timestamp: new Date(timestamp).toISOString(),
    status,
    plannedSessionId,
    plannedSessionLabel
  };
}

function normalizePlannedSession(session) {
  if (!session || typeof session !== "object") {
    return null;
  }

  const id = typeof session.id === "string" && session.id.trim() ? session.id : null;
  const title = typeof session.title === "string" && session.title.trim() ? session.title.trim() : null;
  const plannedFor = typeof session.plannedFor === "string" ? session.plannedFor : null;
  const status =
    typeof session.status === "string" && ALLOWED_PLANNED_STATUSES.has(session.status)
      ? session.status
      : "planned";

  if (!id || !title || !plannedFor) {
    return null;
  }

  const plannedDate = new Date(plannedFor);
  if (Number.isNaN(plannedDate.getTime())) {
    return null;
  }

  return {
    id,
    title,
    plannedFor: formatISODate(plannedDate),
    status,
    createdAt: isValidDate(session.createdAt) ? new Date(session.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: isValidDate(session.updatedAt) ? new Date(session.updatedAt).toISOString() : null
  };
}

function getDayFromTimestamp(timestamp) {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? null : formatISODate(date);
}

export function getSessions() {
  return readFromStorage(SESSION_STORAGE_KEY).map(normalizeSession).filter(Boolean);
}

export function addSession(status, options = {}) {
  if (!ALLOWED_SESSION_STATUSES.has(status)) {
    throw new Error("Invalid status. Use 'completed' or 'cancelled'.");
  }

  const nextSession = {
    id: createId(),
    timestamp: new Date().toISOString(),
    status,
    plannedSessionId:
      typeof options.plannedSessionId === "string" && options.plannedSessionId.trim()
        ? options.plannedSessionId
        : null,
    plannedSessionLabel:
      typeof options.plannedSessionLabel === "string" && options.plannedSessionLabel.trim()
        ? options.plannedSessionLabel
        : null
  };

  const nextSessions = [nextSession, ...getSessions()];
  writeToStorage(SESSION_STORAGE_KEY, nextSessions);
  return nextSession;
}

export function clearSessions() {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function deleteSession(sessionId) {
  const targetId = typeof sessionId === "string" ? sessionId.trim() : "";
  if (!targetId) {
    return false;
  }

  const sessions = getSessions();
  const nextSessions = sessions.filter((session) => session.id !== targetId);

  if (nextSessions.length === sessions.length) {
    return false;
  }

  writeToStorage(SESSION_STORAGE_KEY, nextSessions);
  return true;
}

export function getPlannedSessions() {
  return readFromStorage(PLANNED_SESSION_STORAGE_KEY).map(normalizePlannedSession).filter(Boolean);
}

export function addPlannedSession({ title, plannedFor }) {
  const trimmedTitle = typeof title === "string" ? title.trim() : "";
  if (!trimmedTitle) {
    throw new Error("Planned session title is required.");
  }

  const plannedDate = new Date(plannedFor);
  if (Number.isNaN(plannedDate.getTime())) {
    throw new Error("Planned date is invalid.");
  }

  const nextPlannedSession = {
    id: createId(),
    title: trimmedTitle,
    plannedFor: formatISODate(plannedDate),
    status: "planned",
    createdAt: new Date().toISOString(),
    updatedAt: null
  };

  const nextSessions = [nextPlannedSession, ...getPlannedSessions()];
  writeToStorage(PLANNED_SESSION_STORAGE_KEY, nextSessions);
  return nextPlannedSession;
}

export function updatePlannedSessionStatus(plannedSessionId, status = "completed") {
  const targetId = typeof plannedSessionId === "string" ? plannedSessionId.trim() : "";
  if (!targetId || !ALLOWED_PLANNED_STATUSES.has(status)) {
    return false;
  }

  const sessions = getPlannedSessions();
  let updated = false;

  const nextSessions = sessions.map((session) => {
    if (session.id !== targetId) {
      return session;
    }

    updated = true;
    return {
      ...session,
      status,
      updatedAt: new Date().toISOString()
    };
  });

  if (!updated) {
    return false;
  }

  writeToStorage(PLANNED_SESSION_STORAGE_KEY, nextSessions);
  return true;
}

export function clearPlannedSessions() {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.removeItem(PLANNED_SESSION_STORAGE_KEY);
}

export function getSessionCounts(sessions = getSessions()) {
  return sessions.reduce(
    (accumulator, session) => {
      if (session.status === "completed") {
        accumulator.sessionsCompleted += 1;
      }

      if (session.status === "cancelled") {
        accumulator.sessionsCancelled += 1;
      }

      return accumulator;
    },
    { sessionsCompleted: 0, sessionsCancelled: 0 }
  );
}

export function getPlannedSessionCounts(plannedSessions = getPlannedSessions()) {
  return plannedSessions.reduce(
    (accumulator, session) => {
      accumulator.sessionsPlanned += 1;

      if (session.status === "completed") {
        accumulator.sessionsCompleted += 1;
      }

      return accumulator;
    },
    { sessionsPlanned: 0, sessionsCompleted: 0 }
  );
}

export function getTotalDaysFromSessions(sessions = getSessions()) {
  return new Set(sessions.map((session) => getDayFromTimestamp(session.timestamp)).filter(Boolean)).size;
}

export function buildDisciplineInput(options = {}, sessions = getSessions(), plannedSessions = getPlannedSessions()) {
  const { sessionsCompleted, sessionsCancelled } = getSessionCounts(sessions);
  const { currentStreak, bestStreak } = calculateStreaks(sessions);
  const plannedCounts = getPlannedSessionCounts(plannedSessions);

  return {
    totalDays: getTotalDaysFromSessions(sessions),
    streak: currentStreak,
    bestStreak,
    sessionsCompleted,
    sessionsPlanned:
      options.sessionsPlanned === undefined
        ? plannedCounts.sessionsPlanned
        : normalizeWholeNumber(options.sessionsPlanned),
    plannedCompleted: plannedCounts.sessionsCompleted,
    sessionsCancelled
  };
}

export function getDisciplineReport(options = {}, sessions = getSessions(), plannedSessions = getPlannedSessions()) {
  const disciplineInput = buildDisciplineInput(options, sessions, plannedSessions);
  const scores = calculateDisciplineFromStats(disciplineInput);

  return {
    ...disciplineInput,
    consistency: toPercent(scores.consistency),
    completion: toPercent(scores.completion),
    integrity: toPercent(scores.integrity),
    finalScore: toPercent(scores.finalScore)
  };
}

export default {
  addSession,
  getSessions,
  clearSessions,
  deleteSession,
  addPlannedSession,
  getPlannedSessions,
  updatePlannedSessionStatus,
  clearPlannedSessions,
  getSessionCounts,
  getPlannedSessionCounts,
  buildDisciplineInput,
  getDisciplineReport
};
