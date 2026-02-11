<script>
	import { onMount } from 'svelte';
	import { auth, db } from '$lib/firebase.js';
	import { doc, getDoc } from 'firebase/firestore';

	let ready = false;
	let score = 0;
	let totalSessions = 0;
	let complianceDays = 0;
	let missedDays = 0;
	let earlyQuits = 0;

	function last7Dates() {
		const now = new Date();
		return Array.from({ length: 7 }).map((_, i) => {
			const d = new Date(now);
			d.setDate(now.getDate() - (6 - i));
			return d.toISOString().slice(0, 10);
		});
	}
	function readSettings() {
		try {
			const p = JSON.parse(localStorage.getItem('zennexus_settings') || '{}');
			return { dailyGoal: typeof p.dailyGoal === 'number' ? p.dailyGoal : 4 };
		} catch {
			return { dailyGoal: 4 };
		}
	}
	function clamp(n) { return Math.max(0, Math.min(100, Math.round(n))); }

	onMount(() => {
		const unsub = auth.onAuthStateChanged(async (user) => {
			if (!user) return;
			const dates = last7Dates();
			const { dailyGoal } = readSettings();

			let sessionsSum = 0;
			let compliance = 0;
			let missed = 0;
			let quits = 0;

			for (const day of dates) {
				const dRef = doc(db, 'users', user.uid, 'daily', day);
				const sRef = doc(db, 'users', user.uid, 'integrity', day);
				const dSnap = await getDoc(dRef);
				const sSnap = await getDoc(sRef);
				const sessions = dSnap.exists() ? Number(dSnap.data().sessions || 0) : 0;
				const exits = sSnap.exists() ? Number(sSnap.data().exitAttempts || 0) : 0;
				sessionsSum += sessions;
				if (sessions >= dailyGoal) compliance += 1;
				if (sessions === 0) missed += 1;
				quits += exits;
			}

			totalSessions = sessionsSum;
			complianceDays = compliance;
			missedDays = missed;
			earlyQuits = quits;

			const sessionsWeight = Math.min(totalSessions * 2, 40);
			const complianceWeight = complianceDays * 8; // max 56
			const missedPenalty = missedDays * 7;
			const quitsPenalty = earlyQuits * 3;
			score = clamp(sessionsWeight + complianceWeight - missedPenalty - quitsPenalty);
			ready = true;
		});
		return () => unsub?.();
	});
</script>

<main class="page" aria-busy={!ready}>
	<section class="wrap">
		<h2>Discipline Score</h2>
		<div class="card big">
			<p class="value">{score}</p>
			<p class="muted">Weekly</p>
		</div>
		<div class="grid">
			<div class="card">
				<p class="label">Sessions</p>
				<p class="value">{totalSessions}</p>
			</div>
			<div class="card">
				<p class="label">Daily Minimum Met</p>
				<p class="value">{complianceDays}/7</p>
			</div>
			<div class="card">
				<p class="label">Missed Days</p>
				<p class="value">{missedDays}</p>
			</div>
			<div class="card">
				<p class="label">Early Quits</p>
				<p class="value">{earlyQuits}</p>
			</div>
		</div>
	</section>
	</main>

<style>
	.page { min-height: 100vh; background: #020617; display: flex; justify-content: center; align-items: center; font-family: system-ui, sans-serif; color: #e5e7eb; }
	.wrap { width: 100%; max-width: 720px; padding: 16px; }
	h2 { margin: 0 0 12px 0; font-size: 1rem; color: #e5e7eb; }
	.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 12px; }
	.card { background: #0b1220; border-radius: 12px; padding: 12px; }
	.big { display: flex; align-items: baseline; justify-content: space-between; }
	.label { color: #94a3b8; font-size: 0.8rem; margin: 0 0 4px 0; }
	.value { color: #e5e7eb; font-weight: 600; font-size: 1rem; margin: 0; }
	.big .value { font-size: 2.2rem; font-weight: 700; }
	.muted { color: #94a3b8; font-size: 0.85rem; margin: 0; }
</style>
