<script>
	import { onMount } from 'svelte';
	import { auth, db } from '$lib/firebase.js';
	import { doc, getDoc } from 'firebase/firestore';

	let ready = false;
	let items = [];
	const SESSION_MINUTES = 25;

	function parseHM(hm) {
		const [h, m] = hm.split(':').map((n) => Number(n));
		return h * 60 + m;
	}
	function fmtHM(totalMin) {
		const h = Math.floor((totalMin + 24 * 60) % (24 * 60) / 60);
		const m = ((totalMin % 60) + 60) % 60;
		return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
	}

	onMount(() => {
		const unsub = auth.onAuthStateChanged(async (user) => {
			if (!user) return;
			const snap = await getDoc(doc(db, 'users', user.uid));
			const arr = Array.isArray(snap.data()?.todaySessions) ? snap.data().todaySessions : [];
			items = arr.map((end) => {
				const endMin = parseHM(String(end));
				const startMin = endMin - SESSION_MINUTES;
				return {
					start: fmtHM(startMin),
					end: fmtHM(endMin),
					duration: SESSION_MINUTES
				};
			});
			ready = true;
		});
		return () => unsub?.();
	});
</script>

<main class="page" aria-busy={!ready}>
	<section class="wrap">
		<h2>Daily Focus Timeline</h2>
		{#if items.length === 0}
			<p class="empty">No sessions recorded today.</p>
		{:else}
			<ul class="list" aria-label="Today’s sessions">
				{#each items as it}
					<li class="card">
						<div class="row">
							<span class="label">Start</span>
							<span class="val">{it.start}</span>
						</div>
						<div class="row">
							<span class="label">End</span>
							<span class="val">{it.end}</span>
						</div>
						<div class="row">
							<span class="label">Duration</span>
							<span class="val">{it.duration} min</span>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
	
</main>

<style>
	.page { min-height: 100vh; background: #020617; display: flex; justify-content: center; align-items: flex-start; }
	.wrap { width: 100%; max-width: 560px; padding: 16px; color: #e5e7eb; font-family: system-ui, sans-serif; }
	h2 { margin: 10px 0 12px; font-size: 1rem; color: #e5e7eb; }
	.empty { color: #94a3b8; font-size: 0.9rem; }
	.list { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
	.card { background: #0b1220; border: 1px solid #1e293b; border-radius: 12px; padding: 12px; }
	.row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
	.label { color: #94a3b8; font-size: 0.85rem; }
	.val { color: #e5e7eb; font-weight: 600; }
</style>
