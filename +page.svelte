<script>
	import { onMount, onDestroy } from 'svelte';
	import { auth, db } from '$lib/firebase.js';
	import { doc, getDoc } from 'firebase/firestore';
	import Chart from 'chart.js/auto';

	let ready = false;
	let probMet = 0;
	let expectedSessions = 0;
	let expectedMinutes = 0;
	let chart;

	function lastNDates(n) {
		const now = new Date();
		return Array.from({ length: n }).map((_, i) => {
			const d = new Date(now);
			d.setDate(now.getDate() - (n - 1 - i));
			return d.toISOString().slice(0, 10);
		});
	}
	function readSettings() {
		try {
			const p = JSON.parse(localStorage.getItem('zennexus_settings') || '{}');
			return {
				dailyGoal: typeof p.dailyGoal === 'number' ? p.dailyGoal : 4,
				sessionLength: typeof p.sessionLength === 'number' ? p.sessionLength : 25
			};
		} catch {
			return { dailyGoal: 4, sessionLength: 25 };
		}
	}

	onMount(() => {
		const unsub = auth.onAuthStateChanged(async (user) => {
			if (!user) return;
			const dates = lastNDates(14);
			const { dailyGoal, sessionLength } = readSettings();

			const sessions = [];
			for (const day of dates) {
				const ref = doc(db, 'users', user.uid, 'daily', day);
				const snap = await getDoc(ref);
				sessions.push(snap.exists() ? Number(snap.data().sessions || 0) : 0);
			}

			const met = sessions.filter((c) => c >= dailyGoal).length;
			probMet = Math.round((met / 14) * 100);
			const recent = sessions.slice(-7);
			expectedSessions = Math.round(recent.reduce((a, b) => a + b, 0) / recent.length);
			expectedMinutes = expectedSessions * sessionLength;

			const ctx = document.getElementById('trendChart');
			if (ctx) {
				if (chart) chart.destroy();
				chart = new Chart(ctx, {
					type: 'line',
					data: {
						labels: dates.map((d) => d.slice(5)),
						datasets: [{ data: sessions, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.2)', tension: 0.2 }]
					},
					options: {
						plugins: { legend: { display: false } },
						scales: {
							x: { ticks: { color: '#e5e7eb' }, grid: { display: false } },
							y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' }, beginAtZero: true, precision: 0 }
						}
					}
				});
			}
			ready = true;
		});
		onDestroy(() => {
			unsub?.();
			chart?.destroy();
		});
	});
</script>

<main class="page" aria-busy={!ready}>
	<section class="wrap">
		<h2>Focus Forecast</h2>

		<div class="grid">
			<div class="card"><p class="label">Probability Met</p><p class="value">{probMet}%</p></div>
			<div class="card"><p class="label">Expected Sessions</p><p class="value">{expectedSessions}</p></div>
			<div class="card"><p class="label">Expected Focus (min)</p><p class="value">{expectedMinutes}</p></div>
		</div>

		<div class="chart"><canvas id="trendChart" aria-label="14-day sessions trend"></canvas></div>
	</section>
</main>

<style>
	.page { min-height: 100vh; background: #020617; display: flex; justify-content: center; align-items: center; font-family: system-ui, sans-serif; color: #e5e7eb; }
	.wrap { width: 100%; max-width: 720px; padding: 16px; }
	h2 { margin: 0 0 12px 0; font-size: 1rem; color: #e5e7eb; }
	.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; }
	.card { background: #0b1220; border-radius: 12px; padding: 12px; }
	.label { color: #94a3b8; font-size: 0.8rem; margin: 0 0 4px 0; }
	.value { color: #e5e7eb; font-weight: 600; font-size: 1rem; margin: 0; }
	.chart { background: #0b1220; border-radius: 12px; padding: 12px; }
</style>
