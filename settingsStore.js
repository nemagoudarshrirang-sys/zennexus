import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const SESSION_OPTIONS = [25, 30, 45];
const DEFAULTS = {
	sessionLength: 25,
	dailyGoal: 4,
	theme: 'dark'
};

function read() {
	if (!browser) return DEFAULTS;
	try {
		const raw = localStorage.getItem('zennexus_settings');
		if (!raw) return DEFAULTS;
		const parsed = JSON.parse(raw);
		return {
			sessionLength: SESSION_OPTIONS.includes(parsed.sessionLength) ? parsed.sessionLength : DEFAULTS.sessionLength,
			dailyGoal:
				typeof parsed.dailyGoal === 'number' && parsed.dailyGoal >= 2 && parsed.dailyGoal <= 10
					? parsed.dailyGoal
					: DEFAULTS.dailyGoal,
			theme: parsed.theme === 'light' ? 'light' : 'dark'
		};
	} catch {
		return DEFAULTS;
	}
}

function applyTheme(theme) {
	if (!browser) return;
	document.documentElement.setAttribute('data-theme', theme);
}

function createStore() {
	const store = writable(read());

	if (browser) {
		applyTheme(read().theme);
		store.subscribe((v) => {
			localStorage.setItem('zennexus_settings', JSON.stringify(v));
			applyTheme(v.theme);
		});
	}

	function setSessionLength(val) {
		if (!SESSION_OPTIONS.includes(val)) return;
		store.update((s) => ({ ...s, sessionLength: val }));
	}
	function incrementSessionLength() {
		store.update((s) => {
			const idx = SESSION_OPTIONS.indexOf(s.sessionLength);
			const next = SESSION_OPTIONS[Math.min(idx + 1, SESSION_OPTIONS.length - 1)];
			return { ...s, sessionLength: next };
		});
	}
	function decrementSessionLength() {
		store.update((s) => {
			const idx = SESSION_OPTIONS.indexOf(s.sessionLength);
			const prev = SESSION_OPTIONS[Math.max(idx - 1, 0)];
			return { ...s, sessionLength: prev };
		});
	}

	function setDailyGoal(val) {
		const n = Math.max(2, Math.min(10, Number(val) || DEFAULTS.dailyGoal));
		store.update((s) => ({ ...s, dailyGoal: n }));
	}
	function incrementDailyGoal() {
		store.update((s) => ({ ...s, dailyGoal: Math.min(10, s.dailyGoal + 1) }));
	}
	function decrementDailyGoal() {
		store.update((s) => ({ ...s, dailyGoal: Math.max(2, s.dailyGoal - 1) }));
	}

	function toggleTheme() {
		store.update((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }));
	}

	return {
		subscribe: store.subscribe,
		setSessionLength,
		incrementSessionLength,
		decrementSessionLength,
		setDailyGoal,
		incrementDailyGoal,
		decrementDailyGoal,
		toggleTheme
	};
}

export const settings = createStore();
