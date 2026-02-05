<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { theme } from '$lib/themeStore.js';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<a href="/settings" aria-label="Settings" class="settings-link">⚙️</a>
<a href="/analytics" class="analytics-link">Analytics</a>
<a href="#" aria-label="Toggle Theme" class="theme-bulb" on:click|preventDefault={() => theme.toggle()}>💡</a>

<style>
	:root[data-theme="dark"] .theme-bulb { color: #facc15; }
	:root[data-theme="light"] .theme-bulb { color: #475569; }

	.theme-bulb {
		position: fixed;
		top: 10px;
		right: 10px;
		font-size: 18px;
		text-decoration: none;
		opacity: 0.9;
		z-index: 1001;
	}
	.theme-bulb:hover,
	.theme-bulb:focus { opacity: 1; }
	.settings-link {
		position: fixed;
		right: 10px;
		bottom: 10px;
		font-size: 18px;
		color: #94a3b8;
		text-decoration: none;
		z-index: 1000;
	}
	.settings-link:hover,
	.settings-link:focus {
		color: #cbd5f5;
	}
	.analytics-link {
		position: fixed;
		right: 10px;
		bottom: 34px;
		font-size: 12px;
		color: #94a3b8;
		text-decoration: none;
		z-index: 999;
	}
	.analytics-link:hover,
	.analytics-link:focus {
		color: #cbd5f5;
	}
</style>
