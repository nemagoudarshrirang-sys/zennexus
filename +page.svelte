<script>
	import { onMount, onDestroy } from 'svelte';
	import Chart from 'chart.js/auto';
	import { auth } from '$lib/firebase.js';
	import { loadUserStats } from '$lib/firestorestorage.js';

	let title = 'Weekly Focus';
	let totalTimeMin = 0;
	let totalSessions = 0;
	let consistencyPct = 0;
	let hasData = false;
	let chart;

	function settingsFromLocal() {
		try {
			const raw = localStorage.getItem('zennexus_settings');
			const p = raw ? JSON.parse(raw) : {};
			return {
				sessionLength: typeof p.sessionLength === 'number' ? p.sessionLength : 25,
				dailyGoal: typeof p.dailyGoal === 'number' ? p.dailyGoal : 4
			};
		} catch {
			return { sessionLength: 25, dailyGoal: 4 };
		}
	}

	function last7Days() {
		const now = new Date();
		return Array.from({ length: 7 }).map((_, i) => {
			const d = new Date(now);
			d.setDate(now.getDate() - (6 - i));
			return d;
		});
	}

	onMount(() => {
		const unsub = auth.onAuthStateChanged(async (user) => {
			if (!user) return;

			const { sessionsToday, lastStudyDate } = await loadUserStats();
			const { sessionLength, dailyGoal } = settingsFromLocal();

			const days = last7Days();
			const labels = days.map((d) => d.toLocaleDateString(undefined, { weekday: 'short' }));
			const keys = days.map((d) => d.toISOString().slice(0, 10));
			const data = keys.map((k) => (k === lastStudyDate ? sessionsToday : 0));

			totalSessions = data.reduce((a, b) => a + b, 0);
			totalTimeMin = totalSessions * sessionLength;
			const metDays = data.filter((c) => c >= dailyGoal).length;
			consistencyPct = Math.round((metDays / 7) * 100);
			hasData = totalSessions > 0;

			const ctx = document.getElementById('weeklyChart');
			if (ctx) {
				if (chart) chart.destroy();
				chart = new Chart(ctx, {
					type: 'bar',
					data: {
						labels,
						datasets: [
							{
								label: 'Sessions',
								data,
								backgroundColor: '#22c55e'
							}
						]
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
		});
		onDestroy(() => {
			unsub?.();
			chart?.destroy();
		});
	});
</script>

<div class="page">
	<div class="wrap">
		<h2>{title}</h2>
		<div class="metrics">
			<div class="card">
				<p class="label">Total Focus (min)</p>
				<p class="value">{totalTimeMin}</p>
			</div>
			<div class="card">
				<p class="label">Sessions</p>
				<p class="value">{totalSessions}</p>
			</div>
			<div class="card">
				<p class="label">Consistency</p>
				<p class="value">{consistencyPct}%</p>
			</div>
		</div>

		<div class="chart">
			{#if !hasData}
				<p class="empty">No data yet</p>
			{:else}
				<canvas id="weeklyChart" aria-label="Weekly sessions bar chart"></canvas>
			{/if}
		</div>
	</div>
</div>

<style>
	.page {
		min-height: 100vh;
		background: #020617;
		display: flex;
		justify-content: center;
		align-items: center;
		font-family: system-ui, sans-serif;
		color: #e5e7eb;
	}
	.wrap { width: 100%; max-width: 720px; padding: 16px; }
	h2 { margin: 0 0 12px 0; font-size: 1rem; color: #e5e7eb; }
	.metrics {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
		margin-bottom: 12px;
	}
	.card {
		background: #0b1220;
		border-radius: 12px;
		padding: 12px;
	}
	.label { color: #94a3b8; font-size: 0.8rem; margin: 0 0 4px 0; }
	.value { color: #e5e7eb; font-weight: 600; font-size: 1rem; margin: 0; }
	.chart {
		background: #0b1220;
		border-radius: 12px;
		padding: 12px;
	}
	.empty { color: #94a3b8; font-size: 0.85rem; }
</style>
