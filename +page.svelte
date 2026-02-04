<script>
	import { settings } from '$lib/settingsStore.js';
	import { onMount } from 'svelte';

	let soundEnabled = true;
	let autoStartNext = false;
	let minimalStats = false;

	onMount(() => {
		try {
			const raw = localStorage.getItem('zennexus_settings_extras');
			if (raw) {
				const p = JSON.parse(raw);
				soundEnabled = p.soundEnabled !== false;
				autoStartNext = p.autoStartNext === true;
				minimalStats = p.minimalStats === true;
			}
		} catch {}
	});

	function persistExtras() {
		localStorage.setItem(
			'zennexus_settings_extras',
			JSON.stringify({ soundEnabled, autoStartNext, minimalStats })
		);
	}
</script>

<div class="page">
	<div class="card">
		<h2>Settings</h2>

		<section class="item">
			<div class="label">Session Length</div>
			<div class="controls">
				<button aria-label="decrease session" on:click={settings.decrementSessionLength}>−</button>
				<span class="value">{$settings.sessionLength} min</span>
				<button aria-label="increase session" on:click={settings.incrementSessionLength}>+</button>
			</div>
			<div class="hint">Applies to future sessions</div>
		</section>

		<section class="item">
			<div class="label">Daily Goal</div>
			<div class="controls">
				<button aria-label="decrease goal" on:click={settings.decrementDailyGoal}>−</button>
				<span class="value">{$settings.dailyGoal}</span>
				<button aria-label="increase goal" on:click={settings.incrementDailyGoal}>+</button>
			</div>
		</section>

		<section class="item">
			<div class="label">Theme Mode</div>
			<div class="controls">
				<button aria-label="toggle theme" on:click={settings.toggleTheme}>
					{$settings.theme === 'dark' ? 'Dark' : 'Light'}
				</button>
			</div>
			<div class="hint">Soft background/text only</div>
		</section>

		<section class="item">
			<div class="label">Sound</div>
			<div class="controls">
				<button aria-label="toggle sound" on:click={() => { soundEnabled = !soundEnabled; persistExtras(); }}>
					{soundEnabled ? 'Enabled' : 'Disabled'}
				</button>
			</div>
		</section>

		<section class="item">
			<div class="label">Auto-start Next Session</div>
			<div class="controls">
				<button aria-label="toggle auto-start" on:click={() => { autoStartNext = !autoStartNext; persistExtras(); }}>
					{autoStartNext ? 'On' : 'Off'}
				</button>
			</div>
		</section>

		<section class="item">
			<div class="label">Minimal Stats View</div>
			<div class="controls">
				<button aria-label="toggle minimal stats" on:click={() => { minimalStats = !minimalStats; persistExtras(); }}>
					{minimalStats ? 'Hide' : 'Show'}
				</button>
			</div>
		</section>
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
	}
	.card {
		background: #0b1220;
		padding: 20px 18px;
		border-radius: 14px;
		width: 320px;
		text-align: left;
	}
	h2 {
		margin: 0 0 8px 0;
		color: #e5e7eb;
		font-size: 1rem;
	}
	.item {
		margin-top: 10px;
	}
	.label {
		color: #94a3b8;
		font-size: 0.8rem;
		margin-bottom: 6px;
	}
	.controls {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.value {
		color: #f8fafc;
		font-weight: 600;
	}
	button {
		border: 1px solid #1e293b;
		background: #0b1220;
		color: #e5e7eb;
		border-radius: 8px;
		padding: 6px 10px;
		cursor: pointer;
	}
	.hint {
		color: #64748b;
		font-size: 0.7rem;
		margin-top: 4px;
	}
</style>
