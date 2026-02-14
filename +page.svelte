<script>
	import { onMount } from 'svelte';
	import { auth, db } from '$lib/firebase.js';
	import { doc, getDoc } from 'firebase/firestore';

	let ready = false;
	let dailyCurrent = 0;
	let dailyLongest = 0;
	let weeklyCurrent = 0;
	let weeklyLongest = 0;
	let perfectCurrent = 0;
	let perfectLongest = 0;

	function lastNDates(n) {
		const now = new Date();
		return Array.from({ length: n }).map((_, i) => {
			const d = new Date(now);
			d.setDate(now.getDate() - (n - 1 - i));
			return d;
		});
	}
	function toISO(d) { return d.toISOString().slice(0, 10); }
	function readSettings() {
		try {
			const p = JSON.parse(localStorage.getItem('zennexus_settings') || '{}');
			return { dailyGoal: typeof p.dailyGoal === 'number' ? p.dailyGoal : 4 };
		} catch { return { dailyGoal: 4 }; }
	}

	onMount(() => {
		const unsub = auth.onAuthStateChanged(async (user) => {
			if (!user) return;
			const days = lastNDates(56);
			const { dailyGoal } = readSettings();
			const sessions = [];
			for (const d of days) {
				const snap = await getDoc(doc(db, 'users', user.uid, 'daily', toISO(d)));
				sessions.push(snap.exists() ? Number(snap.data().sessions || 0) : 0);
			}

			// Daily current and longest
			let cur = 0, longest = 0;
			for (let i = sessions.length - 1; i >= 0; i--) {
				if (sessions[i] > 0) cur += 1; else break;
			}
			let run = 0;
			for (let i = 0; i < sessions.length; i++) {
				if (sessions[i] > 0) { run += 1; longest = Math.max(longest, run); } else { run = 0; }
			}
			dailyCurrent = cur; dailyLongest = longest;

			// Weekly and perfect week (group by 7)
			let weeks = [];
			for (let i = 0; i < sessions.length; i += 7) {
				const w = sessions.slice(i, i + 7);
				weeks.push(w);
			}
			const weeklyFlags = weeks.map((w) => w.every((c) => c > 0));
			const perfectFlags = weeks.map((w) => w.every((c) => c >= dailyGoal));

			function streakInfo(flags) {
				let cur = 0, longest = 0, run = 0;
				for (let i = flags.length - 1; i >= 0; i--) { if (flags[i]) cur += 1; else break; }
				for (let i = 0; i < flags.length; i++) { if (flags[i]) { run += 1; longest = Math.max(longest, run); } else run = 0; }
				return { cur, longest };
			}
			const wInfo = streakInfo(weeklyFlags);
			const pInfo = streakInfo(perfectFlags);
			weeklyCurrent = wInfo.cur; weeklyLongest = wInfo.longest;
			perfectCurrent = pInfo.cur; perfectLongest = pInfo.longest;
			ready = true;
		});
		return () => unsub?.();
	});
</script>

<main class="page" aria-busy={!ready}>
	<section class="wrap">
		<h2>Streak Layers</h2>
		<div class="grid">
			<div class="card"><p class="label">Daily</p><p class="value">{dailyCurrent}</p><p class="muted">Longest: {dailyLongest}</p></div>
			<div class="card"><p class="label">Weekly</p><p class="value">{weeklyCurrent}</p><p class="muted">Longest: {weeklyLongest}</p></div>
			<div class="card"><p class="label">Perfect Week</p><p class="value">{perfectCurrent}</p><p class="muted">Longest: {perfectLongest}</p></div>
		</div>
	</section>
</main>

<style>
	.page { min-height: 100vh; background: #020617; display: flex; justify-content: center; align-items: center; font-family: system-ui, sans-serif; color: #e5e7eb; }
	.wrap { width: 100%; max-width: 720px; padding: 16px; }
	h2 { margin: 0 0 12px 0; font-size: 1rem; color: #e5e7eb; }
	.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
	.card { background: #0b1220; border-radius: 12px; padding: 12px; }
	.label { color: #94a3b8; font-size: 0.8rem; margin: 0 0 4px 0; }
	.value { color: #e5e7eb; font-weight: 600; font-size: 1rem; margin: 0; }
	.muted { color: #94a3b8; font-size: 0.85rem; margin: 4px 0 0; }
</style>
