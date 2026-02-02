import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '$lib/firebase';

// temporary single-user document
const userRef = doc(db, 'users', 'demo-user');

export async function loadUserStats() {
	const snap = await getDoc(userRef);

	if (!snap.exists()) {
		return {
			streak: 0,
			sessionsToday: 0,
			lastStudyDate: null,
			todaySessions: []
		};
	}

	const data = snap.data();
	return {
		streak: data.streak ?? 0,
		sessionsToday: data.sessionsToday ?? 0,
		lastStudyDate: data.lastStudyDate ?? null,
		todaySessions: Array.isArray(data.todaySessions) ? data.todaySessions : []
	};
}

/**
 * @param {{ streak: number, sessionsToday: number, lastStudyDate: string|null, todaySessions: string[] }} stats
 */
export async function saveUserStats({ streak, sessionsToday, lastStudyDate, todaySessions }) {
	await setDoc(userRef, {
		streak,
		sessionsToday,
		lastStudyDate,
		todaySessions
	});
}
