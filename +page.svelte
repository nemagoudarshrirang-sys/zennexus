<script>
	import { onMount } from 'svelte';
	import { auth, db } from '$lib/firebase.js';
	import { doc, getDoc } from 'firebase/firestore';

	let ready = false;
	let weeks = [];
	let selectedMinutes = null;
	let selectedDate = '';

	function startDate() {
		const d = new Date();
		d.setDate(d.getDate() - 55); // ~8 weeks
		return d;
	}
	function toISO(d) { return d.toISOString().slice(0, 10); }
	function dayName(d) { return d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0,1); }

	async function fetchDay(uid, iso) {
		const ref = doc(db, 'users', uid, 'daily', iso);
		const snap = await getDoc(ref);
		return snap.exists() ? Number(snap.data().minutes || 0) : 0;
	}

	onMount(() => {
		const unsub = auth.onAuthStateChanged(async (user) => {
			if (!user) return;
			const start = startDate();
			const days = [];
			for (let i = 0; i < 56; i++) {
				const d = new Date(start);
				d.setDate(start.getDate() + i);
				days.push(d);
			}
			const rows = [];
			for (let w = 0; w < 8; w++) {
				const weekDays = days.slice(w * 7, w * 7 + 7);
				const row = [];
				for (const d of weekDays) {
					const iso = toISO(d);
					const minutes = await fetchDay(user.uid, iso);
					row.push({ iso, minutes, label: dayName(d) });
				}
				rows.push(row);
			}
			weeks = rows;
			ready = true;
		});
		return () => unsub?.();
	});

	function intensity(m) {
		if (m === 0) return 'lv0';
		if (m < 30) return 'lv1';
		if (m < 60) return 'lv2';
		if (m < 120) return 'lv3';
		return 'lv4';
	}

	function pick(cell) {
		selectedMinutes = cell.minutes;
		selectedDate = cell.iso;
	}
</script>

<main class="page" aria-busy={!ready}>
	<section class="wrap">
		<h2>Focus Heatmap</h2>
		<div class="grid">
			{#each weeks as row}
				<div class="col">
					{#each row as cell}
						<button type="button" class="cell {intensity(cell.minutes)}" title={`${cell.iso}: ${cell.minutes} min`} onclick={() => pick(cell)}>
							<span class="dot" aria-hidden="true"></span>
						</button>
					{/each}
				</div>
			{/each}
		</div>
		{#if selectedDate}
			<p class="info">{selectedDate}: {selectedMinutes} min</p>
		{/if}
	</section>
</main>

<style>
	.page { min-height: 100vh; background: #020617; display: flex; justify-content: center; align-items: center; font-family: system-ui, sans-serif; color: #e5e7eb; }
	.wrap { width: 100%; max-width: 720px; padding: 16px; }
	h2 { margin: 0 0 12px 0; font-size: 1rem; color: #e5e7eb; }
	.grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px; }
	.col { display: grid; grid-template-rows: repeat(7, 1fr); gap: 6px; }
	.cell { width: 26px; height: 26px; border-radius: 6px; border: 1px solid #1e293b; background: #0b1220; display: flex; justify-content: center; align-items: center; cursor: pointer; }
	.dot { width: 16px; height: 16px; border-radius: 4px; background: #0b1220; }
	.lv0 .dot { background: #0b1220; }
	.lv1 .dot { background: #0b7a2d; }
	.lv2 .dot { background: #129c3a; }
	.lv3 .dot { background: #18b74a; }
	.lv4 .dot { background: #22c55e; }
	.info { color: #94a3b8; margin-top: 10px; font-size: 0.85rem; }
</style>
