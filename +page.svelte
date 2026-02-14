<script>
	import { onMount } from 'svelte';
	import { auth, db } from '$lib/firebase.js';
	import { collection, getDocs } from 'firebase/firestore';

	let ready = false;
	let byEnergy = { Low: 0, Medium: 0, High: 0 };
	let byTime = { Morning: { Low: 0, Medium: 0, High: 0 }, Afternoon: { Low: 0, Medium: 0, High: 0 }, Night: { Low: 0, Medium: 0, High: 0 } };

	function bucket(hour) {
		if (hour >= 5 && hour <= 11) return 'Morning';
		if (hour >= 12 && hour <= 17) return 'Afternoon';
		return 'Night';
	}

	onMount(() => {
		const unsub = auth.onAuthStateChanged(async (user) => {
			if (!user) return;
			const col = collection(db, 'users', user.uid, 'sessions');
			const snaps = await getDocs(col);
			snaps.forEach((d) => {
				const data = d.data();
				const energy = data.energy || 'Medium';
				const hour = Number(data.hour || 12);
				byEnergy[energy] = (byEnergy[energy] || 0) + 1;
				const b = bucket(hour);
				byTime[b][energy] = (byTime[b][energy] || 0) + 1;
			});
			ready = true;
		});
		return () => unsub?.();
	});
</script>

<main class="page" aria-busy={!ready}>
	<section class="wrap">
		<h2>Energy Analytics</h2>

		<div class="grid">
			<div class="card">
				<p class="label">Low</p>
				<p class="value">{byEnergy.Low}</p>
			</div>
			<div class="card">
				<p class="label">Medium</p>
				<p class="value">{byEnergy.Medium}</p>
			</div>
			<div class="card">
				<p class="label">High</p>
				<p class="value">{byEnergy.High}</p>
			</div>
		</div>

		<div class="table">
			<div class="row head">
				<div>Time</div><div>Low</div><div>Medium</div><div>High</div>
			</div>
			<div class="row"><div>Morning</div><div>{byTime.Morning.Low}</div><div>{byTime.Morning.Medium}</div><div>{byTime.Morning.High}</div></div>
			<div class="row"><div>Afternoon</div><div>{byTime.Afternoon.Low}</div><div>{byTime.Afternoon.Medium}</div><div>{byTime.Afternoon.High}</div></div>
			<div class="row"><div>Night</div><div>{byTime.Night.Low}</div><div>{byTime.Night.Medium}</div><div>{byTime.Night.High}</div></div>
		</div>
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
	.table { background: #0b1220; border-radius: 12px; padding: 12px; }
	.row { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 8px; padding: 6px 0; }
	.head { color: #94a3b8; }
</style>
