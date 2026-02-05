<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<a href="/settings" aria-label="Settings" class="settings-link">⚙️</a>
<a href="/analytics" class="analytics-link">Analytics</a>

<style>
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
