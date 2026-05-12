import { formatISODate } from "../utils/date";

function safeDivide(numerator, denominator) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return 0;
  }
  return numerator / denominator;
}

function toPercent(value) {
  return Number((value * 100).toFixed(1));
}

function toIsoDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : formatISODate(date);
}

function uniqueDays(plannedSessions, sessionLogs) {
  const plannedDays = plannedSessions.map((session) => session.plannedFor).filter(Boolean);
  const loggedDays = sessionLogs.map((session) => toIsoDate(session.timestamp)).filter(Boolean);

  return new Set([...plannedDays, ...loggedDays]);
}

function toDayDate(isoDay) {
  return new Date(`${isoDay}T00:00:00`);
}

function differenceInDays(previousIsoDay, nextIsoDay) {
  const previous = toDayDate(previousIsoDay);
  const next = toDayDate(nextIsoDay);
  return Math.round((next.getTime() - previous.getTime()) / 86400000);
}

function getCompletedDays(sessionLogs = []) {
  return Array.from(
    new Set(
      sessionLogs
        .filter((session) => session.status === "completed")
        .map((session) => toIsoDate(session.timestamp))
        .filter(Boolean)
    )
  ).sort();
}

export function calculateStreaks(sessionLogs = [], referenceDate = new Date()) {
  const completedDays = getCompletedDays(sessionLogs);

  if (completedDays.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const completedDayLookup = new Set(completedDays);
  const cursor = new Date(referenceDate);
  let currentStreak = 0;

  while (true) {
    const dayKey = formatISODate(cursor);
    if (!completedDayLookup.has(dayKey)) {
      break;
    }

    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  let runningStreak = 0;
  let bestStreak = 0;
  let previousDay = null;

  completedDays.forEach((day) => {
    if (previousDay && differenceInDays(previousDay, day) === 1) {
      runningStreak += 1;
    } else {
      runningStreak = 1;
    }

    if (runningStreak > bestStreak) {
      bestStreak = runningStreak;
    }

    previousDay = day;
  });

  return {
    currentStreak,
    bestStreak
  };
}

export function calculateStreak(sessionLogs = []) {
  return calculateStreaks(sessionLogs).currentStreak;
}

export function buildDisciplineSnapshot(plannedSessions = [], sessionLogs = []) {
  const sessionsCompleted = sessionLogs.filter((session) => session.status === "completed").length;
  const sessionsCancelled = sessionLogs.filter((session) => session.status === "cancelled").length;
  const { currentStreak, bestStreak } = calculateStreaks(sessionLogs);

  return {
    totalDays: uniqueDays(plannedSessions, sessionLogs).size,
    streak: currentStreak,
    bestStreak,
    sessionsCompleted,
    sessionsPlanned: plannedSessions.length,
    sessionsCancelled
  };
}

export function calculateConsistency({ streak = 0, totalDays = 0 } = {}) {
  return safeDivide(streak, totalDays);
}

export function calculateCompletion({ sessionsCompleted = 0, sessionsPlanned = 0 } = {}) {
  return safeDivide(sessionsCompleted, sessionsPlanned);
}

export function calculateIntegrity({ sessionsCompleted = 0, sessionsCancelled = 0 } = {}) {
  const totalTracked = sessionsCompleted + sessionsCancelled;
  return 1 - safeDivide(sessionsCancelled, totalTracked);
}

export function calculateFinalScore({ consistency = 0, completion = 0, integrity = 0 } = {}) {
  return consistency * 0.4 + completion * 0.4 + integrity * 0.2;
}

export function calculateDisciplineFromStats(stats = {}) {
  const consistency = calculateConsistency(stats);
  const completion = calculateCompletion(stats);
  const integrity = calculateIntegrity(stats);
  const finalScore = calculateFinalScore({ consistency, completion, integrity });

  return {
    ...stats,
    consistency,
    completion,
    integrity,
    finalScore
  };
}

export function calculateDisciplineMetrics(plannedSessions = [], sessionLogs = []) {
  const stats = buildDisciplineSnapshot(plannedSessions, sessionLogs);
  const result = calculateDisciplineFromStats(stats);

  const today = formatISODate(new Date());
  const todayComparison = {
    planned: plannedSessions.filter((session) => session.plannedFor === today).length,
    completed: sessionLogs.filter(
      (session) => session.status === "completed" && toIsoDate(session.timestamp) === today
    ).length,
    cancelled: sessionLogs.filter(
      (session) => session.status === "cancelled" && toIsoDate(session.timestamp) === today
    ).length
  };

  return {
    ...stats,
    consistency: toPercent(result.consistency),
    completion: toPercent(result.completion),
    integrity: toPercent(result.integrity),
    finalScore: toPercent(result.finalScore),
    todayComparison
  };
}

export default {
  buildDisciplineSnapshot,
  calculateStreak,
  calculateStreaks,
  calculateConsistency,
  calculateCompletion,
  calculateIntegrity,
  calculateFinalScore,
  calculateDisciplineFromStats,
  calculateDisciplineMetrics
};
