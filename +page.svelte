<script>
	import { onMount } from 'svelte';
	import { loadUserStats, saveUserStats } from '$lib/firestorestorage.js';
	import { auth, db } from '$lib/firebase.js';
	import { doc, getDoc } from 'firebase/firestore';
    let syncStatus = 'saved'; // 'saving' | 'saved' | 'offline'


	const SESSION_SECONDS = 25 * 60;
	const DAILY_GOAL = 4;

	let studying = false;
	let completed = false;
	let timeLeft = SESSION_SECONDS;
	let timer;
	let hardMode = false;

	let streak = 0;
	let sessionsToday = 0;
	let todaySessions = [];
	let weeklyCompleted = 0;
	let weeklyTarget = DAILY_GOAL * 7;
	let weeklyPct = 0;

	const RADIUS = 60;
	const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

	function today() {
		return new Date().toISOString().slice(0, 10);
	}

	function dateStr(d) {
		return d.toISOString().slice(0, 10);
	}
	function lastNDates(n) {
		const res = [];
		const now = new Date();
		for (let i = 0; i < n; i++) {
			const dt = new Date(now);
			dt.setDate(now.getDate() - i);
			res.push(dateStr(dt));
		}
		return res.reverse();
	}

	async function computeWeekly(uid) {
		let total = 0;
		const dates = lastNDates(7);
		for (const d of dates) {
			try {
				const snap = await getDoc(doc(db, 'users', uid, 'daily', d));
				if (snap.exists()) {
					total += Number(snap.data().sessions || 0);
				}
			} catch {}
		}
		weeklyCompleted = total;
		weeklyPct = weeklyTarget > 0 ? Math.min(100, Math.round((weeklyCompleted / weeklyTarget) * 100)) : 0;
	}

	onMount(async () => {
		// load hard mode flag from user doc
		const unsub = auth.onAuthStateChanged(async (user) => {
			if (user) {
				const snap = await getDoc(doc(db, 'users', user.uid));
				hardMode = snap.exists() ? !!snap.data().hardMode : false;
				await computeWeekly(user.uid);
			}
		});
		const {
			streak: savedStreak,
			sessionsToday: savedSessions,
			lastStudyDate,
			todaySessions: savedTodaySessions
		} = await loadUserStats();

		const todayDate = today();

		if (!lastStudyDate) {
			streak = savedStreak;
			sessionsToday = 0;
			todaySessions = [];
		} else if (lastStudyDate === todayDate) {
			streak = savedStreak;
			sessionsToday = savedSessions;
			todaySessions = Array.isArray(savedTodaySessions) ? savedTodaySessions.slice(-8) : [];
		} else {
			const last = new Date(lastStudyDate);
			const now = new Date();
			const diffHours = (now - last) / (1000 * 60 * 60);
			if (diffHours > 36) streak = 0;
			sessionsToday = 0;
			todaySessions = [];
		}
	});

	function startStudy() {
		if (studying || completed) return;
		studying = true;

		timer = setInterval(async () => {
			timeLeft -= 1;
			if (timeLeft <= 0) {
				await completeSession();
			}
		}, 1000);
	}

	function stopStudy() {
		studying = false;
		clearInterval(timer);
	}
async function completeSession() {
	clearInterval(timer);
	studying = false;
	completed = true;
	timeLeft = 0;

	const todayDate = today();

	sessionsToday += 1;
	if (sessionsToday === 1) streak += 1;

	// append timestamp (HH:MM), cap to last 8
	const d = new Date();
	const hh = String(d.getHours()).padStart(2, '0');
	const mm = String(d.getMinutes()).padStart(2, '0');
	todaySessions = [...todaySessions, `${hh}:${mm}`].slice(-8);

	syncStatus = 'saving';

	try {
		await saveUserStats({
			streak,
			sessionsToday,
			lastStudyDate: todayDate,
			todaySessions
		});
		syncStatus = 'saved';
	} catch (e) {
		console.error(e);
		syncStatus = 'offline';
	}
}



	function resetTimer() {
		if (hardMode) return;
		clearInterval(timer);
		studying = false;
		completed = false;
		timeLeft = SESSION_SECONDS;
	}

	function formatTime(sec) {
		const m = Math.floor(sec / 60);
		const s = sec % 60;
		return `${m}:${s < 10 ? '0' : ''}${s}`;
	}

	$: progress = timeLeft / SESSION_SECONDS;
	$: dashOffset = CIRCUMFERENCE * (1 - progress);

	$: ringColor =
		timeLeft <= 60
			? '#ef4444'
			: timeLeft <= 300
			? '#eab308'
			: '#22c55e';
</script>

<div class="page">
	<div class="card {studying ? 'active' : completed ? 'done' : ''}">
		<h1>ZenNexus</h1>
		<p class="subtitle">1 Session = 25 minutes</p>

		<div class="ring-wrapper">
			<svg width="160" height="160">
				<circle class="ring-bg" r={RADIUS} cx="80" cy="80" />
				<circle
					class="ring-progress"
					r={RADIUS}
					cx="80"
					cy="80"
					stroke={ringColor}
					stroke-dasharray={CIRCUMFERENCE}
					stroke-dashoffset={dashOffset}
				/>
			</svg>
			<div class="time">{formatTime(timeLeft)}</div>
		</div>

		<p class="status {studying ? 'on' : completed ? 'done' : 'off'}">
			{studying
				? 'Studying'
				: completed
				? 'Session Completed'
				: 'Not Studying'}
		</p>

		<div class="buttons">
			{#if !studying && !completed}
				<button class="start" on:click={startStudy}>Start</button>
			{/if}

			{#if studying}
				<button class="pause" on:click={stopStudy}>Pause</button>
			{/if}

			<button class="reset" on:click={resetTimer} disabled={hardMode} aria-disabled={hardMode}>Reset</button>
		</div>

		<p class="streak">🔥 Streak: {streak}</p>
		<p class="sync {syncStatus}">
	{syncStatus === 'saving'
		? 'Saving…'
		: syncStatus === 'saved'
		? 'Saved'
		: 'Offline'}
</p>
		<p class="goal">Sessions today: {sessionsToday} / {DAILY_GOAL}</p>

		<div class="history">
	<p class="history-label">Today:</p>

	{#if todaySessions.length === 0}
		<p class="empty-history">
			No sessions yet today.<br />
			Start your first 25-minute focus.
		</p>
	{:else}
		<ul class="history-list">
			{#each todaySessions as t}
				<li>• {t}</li>
			{/each}
		</ul>
	{/if}
</div>

	</div>
</div>
<section class="weekly">
	<div class="weekly-card">
		<p class="title">Weekly Discipline</p>
		<p class="percent">{weeklyPct}%</p>
		<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={weeklyPct}>
			<div class="fill" style={"width:" + weeklyPct + "%"}></div>
		</div>
		<p class="meta">{weeklyCompleted} of {weeklyTarget} sessions</p>
	</div>
</section>
<style>
	.page {
		min-height: 100vh;
		background: radial-gradient(circle at top, #0f172a, #020617);
		display: flex;
		justify-content: center;
		align-items: center;
		font-family: system-ui, sans-serif;
	}

	.card {
		background: #0b1220;
		padding: 32px 28px;
		border-radius: 16px;
		width: 320px;
		text-align: center;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
		transition: box-shadow 0.6s ease;
	}

	.card.active {
		animation: glowPulse 2.5s ease-in-out infinite;
	}

	.card.done {
		box-shadow: 0 0 0 2px #38bdf8, 0 25px 50px rgba(0, 0, 0, 0.7);
	}

	@keyframes glowPulse {
		0% {
			box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.4),
			            0 20px 40px rgba(0, 0, 0, 0.5);
		}
		50% {
			box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.85),
			            0 25px 55px rgba(0, 0, 0, 0.75);
		}
		100% {
			box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.4),
			            0 20px 40px rgba(0, 0, 0, 0.5);
		}
	}

	h1 {
		color: #e5e7eb;
		margin-bottom: 4px;
	}

	.subtitle {
		color: #94a3b8;
		font-size: 0.8rem;
		margin-bottom: 14px;
	}

	.ring-wrapper {
		position: relative;
		width: 160px;
		height: 160px;
		margin: 0 auto 12px;
	}

	svg {
		transform: rotate(-90deg);
	}

	.ring-bg {
		fill: none;
		stroke: #1e293b;
		stroke-width: 8;
	}

	.ring-progress {
		fill: none;
		stroke-width: 8;
		stroke-linecap: round;
		transition: stroke-dashoffset 0.5s linear, stroke 0.4s ease;
	}

	.time {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 2rem;
		font-weight: bold;
		color: #f8fafc;
	}

	.status.on { color: #22c55e; }
	.status.off { color: #94a3b8; }
	.status.done { color: #38bdf8; }

	.buttons {
		display: flex;
		justify-content: center;
		gap: 10px;
		margin: 14px 0;
	}

	button {
		border: none;
		padding: 10px 16px;
		border-radius: 10px;
		font-weight: 600;
		cursor: pointer;
	}

	.start { background: #22c55e; color: black; }
	.pause { background: #eab308; color: black; }
	.reset { background: #ef4444; color: white; }

	.streak {
		color: #cbd5f5;
		font-size: 0.9rem;
	}
	/* Sync status */
.sync {
	font-size: 0.75rem;
	margin-top: 4px;
}

.sync.saving {
	color: #eab308; /* yellow */
}

.sync.saved {
	color: #22c55e; /* green */
}

.sync.offline {
	color: #ef4444; /* red */
}

	.goal {
		font-size: 0.75rem;
		color: #94a3b8;
		margin-top: 6px;
	}

	.history {
		margin-top: 6px;
	}
	.history-label {
		font-size: 0.75rem;
		color: #94a3b8;
		margin-bottom: 2px;
	}
	.history-list {
		list-style: none;
		padding: 0;
		margin: 0;
		font-size: 0.78rem;
		color: #cbd5f5;
	}
	.history-list li {
		line-height: 1.3;
	}
	.empty-history {
	font-size: 0.78rem;
	color: #64748b;
	line-height: 1.4;
	margin-top: 2px;
}
	.weekly { display: flex; justify-content: center; background: #020617; padding: 10px 0 20px; }
	.weekly-card { width: 320px; background: #0b1220; border-radius: 12px; padding: 12px 14px; color: #e5e7eb; border: 1px solid #1e293b; }
	.weekly-card .title { margin: 0 0 4px; color: #94a3b8; font-size: 0.9rem; }
	.weekly-card .percent { margin: 0 0 6px; font-size: 1.8rem; font-weight: 700; }
	.weekly-card .bar { width: 100%; height: 8px; background: #1e293b; border-radius: 9999px; overflow: hidden; }
	.weekly-card .fill { height: 100%; background: #22c55e; }
	.weekly-card .meta { margin: 6px 0 0; font-size: 0.8rem; color: #94a3b8; }
</style>
nc funct
