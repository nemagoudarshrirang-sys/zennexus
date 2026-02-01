export function loadUserStats() {
	return {
		streak: Number(localStorage.getItem('streak') || 0),
		sessionsToday: Number(localStorage.getItem('sessionsToday') || 0),
		lastStudyDate: localStorage.getItem('lastStudyDate')
	};
}

export function saveUserStats({ streak, sessionsToday, lastStudyDate }) {
	localStorage.setItem('streak', streak);
	localStorage.setItem('sessionsToday', sessionsToday);
	localStorage.setItem('lastStudyDate', lastStudyDate);
}
