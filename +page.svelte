<script>
	const SESSION_SECONDS = 25 * 60;

	let studying = false;
	let completed = false;
	let seconds = 0;
	let timer;
	let streak = 0;

	function startStudy() {
		if (studying || completed) return;
		studying = true;
		timer = setInterval(() => {
			seconds += 1;

			if (seconds >= SESSION_SECONDS) {
				completeSession();
			}
		}, 1000);
	}

	function stopStudy() {
		studying = false;
		clearInterval(timer);
	}

	function completeSession() {
		clearInterval(timer);
		studying = false;
		completed = true;
		streak += 1;
	}

	function resetTimer() {
		clearInterval(timer);
		seconds = 0;
		studying = false;
		completed = false;
	}

	function formatTime(sec) {
		const minutes = Math.floor(sec / 60);
		const remainingSeconds = sec % 60;
		return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
	}
</script>

<div class="page">
	<div class="card {studying ? 'active' : completed ? 'done' : ''}">
		<h1>ZenNexus</h1>

		<p class="status {studying ? 'on' : completed ? 'done' : 'off'}">
			{studying
				? "Studying"
				: completed
				? "Session Completed"
				: "Not Studying"}
		</p>

		<div class="time">{formatTime(seconds)}</div>

		<div class="buttons">
			{#if !studying && !completed}
				<button class="start" on:click={startStudy}>Start</button>
			{/if}

			{#if studying}
				<button class="pause" on:click={stopStudy}>Pause</button>
			{/if}

			<button class="reset" on:click={resetTimer}>Reset</button>
		</div>

		<p class="streak">🔥 Streak: {streak}</p>
	</div>
</div>

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
		width: 280px;
		text-align: center;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
		transition: box-shadow 0.3s ease;
	}

	.card.active {
		box-shadow: 0 0 0 2px #22c55e, 0 25px 50px rgba(0, 0, 0, 0.7);
	}

	.card.done {
		box-shadow: 0 0 0 2px #38bdf8, 0 25px 50px rgba(0, 0, 0, 0.7);
	}

	h1 {
		margin-bottom: 8px;
		color: #e5e7eb;
	}

	.status {
		margin-bottom: 20px;
		font-weight: 500;
	}

	.status.on {
		color: #22c55e;
	}

	.status.off {
		color: #94a3b8;
	}

	.status.done {
		color: #38bdf8;
	}

	.time {
		font-size: 2.5rem;
		font-weight: bold;
		margin-bottom: 24px;
		color: #f8fafc;
	}

	.buttons {
		display: flex;
		gap: 10px;
		justify-content: center;
		margin-bottom: 16px;
	}

	button {
		border: none;
		padding: 10px 16px;
		border-radius: 10px;
		font-weight: 600;
		cursor: pointer;
	}

	.start {
		background: #22c55e;
		color: black;
	}

	.pause {
		background: #eab308;
		color: black;
	}

	.reset {
		background: #ef4444;
		color: white;
	}

	.streak {
		color: #cbd5f5;
		font-size: 0.9rem;
	}
</style>
