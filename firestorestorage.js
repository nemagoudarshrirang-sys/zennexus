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
			lastStudyDate: null
		};
	}

	return snap.data();
}

export async function saveUserStats({ streak, sessionsToday, lastStudyDate }) {
	await setDoc(userRef, {
		streak,
		sessionsToday,
		lastStudyDate
	});
}
