<script>
	import { onMount } from 'svelte';
	import { auth, db } from '$lib/firebase.js';
	import { doc, getDoc, setDoc } from 'firebase/firestore';

	const today = new Date().toISOString().slice(0, 10);

	let saved = null;
	let wentWell = '';
	let distractions = '';
	let improvement = '';

	onMount(() => {
		const unsub = auth.onAuthStateChanged(async (user) => {
			if (!user) return;
			const snap = await getDoc(doc(db, 'users', user.uid));
			if (snap.exists()) {
				const data = snap.data();
				const r = data?.reflectionData?.[today];
				if (r) {
					saved = {
						wentWell: String(r.wentWell || ''),
						distractions: String(r.distractions || ''),
						improvement: String(r.improvement || '')
					};
				}
			}
		});
		return () => unsub?.();
	});

	async function save() {
		if (!auth.currentUser) return;
		const uid = auth.currentUser.uid;
		const entry = {
			wentWell: wentWell.trim(),
			distractions: distractions.trim(),
			improvement: improvement.trim()
		};
		await setDoc(
			doc(db, 'users', uid),
			{ reflectionData: { [today]: entry } },
			{ merge: true }
		);
		saved = entry;
	}
</script>

<div class="page">
	<div class="card">
		<h2>Daily Reflection</h2>

		{#if saved}
			<div class="read">
				<p class="label">What went well today?</p>
				<p class="text">{saved.wentWell || '—'}</p>
				<p class="label">What distracted you?</p>
				<p class="text">{saved.distractions || '—'}</p>
				<p class="label">One thing to improve tomorrow</p>
				<p class="text">{saved.improvement || '—'}</p>
			</div>
		{:else}
			<div class="item">
				<p class="label">What went well today?</p>
				<textarea class="ta" bind:value={wentWell}></textarea>
			</div>
			<div class="item">
				<p class="label">What distracted you?</p>
				<textarea class="ta" bind:value={distractions}></textarea>
			</div>
			<div class="item">
				<p class="label">One thing to improve tomorrow</p>
				<textarea class="ta" bind:value={improvement}></textarea>
			</div>
			<button class="save" onclick={save}>Save</button>
		{/if}
	</div>
</div>

<style>
	.page { min-height: 100vh; background: #020617; display: flex; justify-content: center; align-items: center; font-family: system-ui, sans-serif; }
	.card { background: #0b1220; padding: 20px 18px; border-radius: 14px; width: 360px; text-align: left; }
	h2 { margin: 0 0 8px 0; color: #e5e7eb; font-size: 1rem; }
	.item { margin-top: 10px; }
	.label { color: #e5e7eb; font-size: 0.85rem; margin-bottom: 6px; }
	.ta { width: 100%; min-height: 72px; background: #0b1220; color: #e5e7eb; border: 1px solid #1e293b; border-radius: 10px; padding: 10px; }
	.save { margin-top: 10px; width: 100%; border: 1px solid #1e293b; background: #22c55e; color: black; border-radius: 10px; padding: 10px; cursor: pointer; }
	.read .text { color: #e5e7eb; white-space: pre-wrap; margin-bottom: 8px; }
	.read .label { color: #e5e7eb; font-size: 0.85rem; margin: 8px 0 4px; }
</style>
