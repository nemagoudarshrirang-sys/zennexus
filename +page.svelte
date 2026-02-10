<script>
	import { onMount } from 'svelte';
	import { auth, db } from '$lib/firebase.js';
	import { doc, getDoc } from 'firebase/firestore';

	let exitAttempts = 0;
	let score = 100;
	let ready = false;

	function today() {
		return new Date().toISOString().slice(0, 10);
	}

	onMount(() => {
		const unsub = auth.onAuthStateChanged(async (user) => {
			if (!user) return;
			const ref = doc(db, 'users', user.uid, 'integrity', today());
			const snap = await getDoc(ref);
			exitAttempts = snap.exists() ? Number(snap.data().exitAttempts || 0) : 0;
			score = Math.max(0, 100 - exitAttempts * 10);
			ready = true;
		});
		return () => unsub?.();
	});
</script>

<main class="page" aria-busy={!ready}>
	<section class="wrap">
		<h2>Focus Integrity</h2>
		<div class="card">
			<div class="row">
				<p class="label">Integrity Score</p>
				<p class="value">{score}%</p>
			</div>
			<div class="row">
				<p class="label">Exit Attempts (today)</p>
				<p class="value">{exitAttempts}</p>
			</div>
		</div>
	</section>
</main>

<style>
	.page { min-height: 100vh; background: #020617; display: flex; justify-content: center; align-items: center; font-family: system-ui, sans-serif; color: #e5e7eb; }
	.wrap { width: 100%; max-width: 560px; padding: 16px; }
	h2 { margin: 0 0 12px 0; font-size: 1rem; color: #e5e7eb; }
	.card { background: #0b1220; border-radius: 12px; padding: 16px; }
	.row { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px; }
	.label { color: #94a3b8; font-size: 0.85rem; }
	.value { color: #e5e7eb; font-weight: 600; font-size: 1rem; text-align: right; }
</style>
