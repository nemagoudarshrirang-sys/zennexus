<script>
	import { onMount } from 'svelte';
	import { auth, db } from '$lib/firebase.js';
	import { collection, addDoc, getDocs } from 'firebase/firestore';

	let ready = false;
	let name = '';
	let focusMinutes = 25;
	let breakMinutes = 5;
	let presets = [];
	let err = '';

	onMount(() => {
		const unsub = auth.onAuthStateChanged(async (user) => {
			if (!user) return;
			await loadPresets(user.uid);
			ready = true;
		});
		return () => unsub?.();
	});

	async function loadPresets(uid) {
		const col = collection(db, 'users', uid, 'presets');
		const snaps = await getDocs(col);
		presets = snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
	}

	async function savePreset() {
		err = '';
		if (!auth.currentUser) return;
		try {
			const uid = auth.currentUser.uid;
			const col = collection(db, 'users', uid, 'presets');
			await addDoc(col, { name: name.trim(), focusMinutes: Number(focusMinutes), breakMinutes: Number(breakMinutes) });
			name = '';
			focusMinutes = 25;
			breakMinutes = 5;
			await loadPresets(uid);
		} catch (e) {
			err = 'Failed to save preset';
		}
	}

	function selectPreset(p) {
		localStorage.setItem('zennexus_preset', JSON.stringify(p));
	}

	function startFocus(p) {
		selectPreset(p);
		location.assign('/');
	}
</script>

<main class="page" aria-busy={!ready}>
	<section class="wrap">
		<h2>Focus Mode Presets</h2>

		<div class="card">
			<div class="row">
				<label for="name">Preset name</label>
				<input id="name" value={name} oninput={(e) => (name = e.target.value)} />
			</div>
			<div class="row">
				<label for="focus">Focus duration (minutes)</label>
				<input id="focus" type="number" min="15" max="180" value={focusMinutes} oninput={(e) => (focusMinutes = Number(e.target.value))} />
			</div>
			<div class="row">
				<label for="break">Break duration (minutes)</label>
				<input id="break" type="number" min="3" max="60" value={breakMinutes} oninput={(e) => (breakMinutes = Number(e.target.value))} />
			</div>
			<button class="save" onclick={savePreset}>Save Preset</button>
			{#if err}<p class="err">{err}</p>{/if}
		</div>

		<div class="list">
			{#each presets as p}
				<div class="item">
					<div class="meta">
						<p class="label">{p.name}</p>
						<p class="muted">{p.focusMinutes}m focus · {p.breakMinutes}m break</p>
					</div>
					<div class="actions">
						<button class="secondary" onclick={() => selectPreset(p)}>Select</button>
						<button class="primary" onclick={() => startFocus(p)}>Start Focus</button>
					</div>
				</div>
			{/each}
		</div>
	</section>
</main>

<style>
	.page { min-height: 100vh; background: #020617; display: flex; justify-content: center; align-items: center; font-family: system-ui, sans-serif; color: #e5e7eb; }
	.wrap { width: 100%; max-width: 720px; padding: 16px; }
	h2 { margin: 0 0 12px 0; font-size: 1rem; color: #e5e7eb; }
	.card { background: #0b1220; border-radius: 12px; padding: 16px; }
	.row { display: grid; grid-template-columns: 1fr; gap: 6px; margin-bottom: 10px; }
	label { color: #94a3b8; font-size: 0.85rem; }
	input { width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #1e293b; background: #0b1220; color: #e5e7eb; }
	.save { margin-top: 6px; border: 1px solid #1e293b; background: #22c55e; color: black; border-radius: 10px; padding: 10px; cursor: pointer; }
	.list { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
	.item { display: flex; justify-content: space-between; align-items: center; background: #0b1220; border-radius: 12px; padding: 12px; }
	.meta .label { color: #e5e7eb; font-weight: 600; margin: 0; }
	.meta .muted { color: #94a3b8; margin: 2px 0 0; font-size: 0.85rem; }
	.actions { display: flex; gap: 8px; }
	.primary { background: #22c55e; color: black; border: 1px solid #1e293b; border-radius: 10px; padding: 8px 10px; cursor: pointer; }
	.secondary { background: #0b1220; color: #e5e7eb; border: 1px solid #1e293b; border-radius: 10px; padding: 8px 10px; cursor: pointer; }
	.err { color: #94a3b8; font-size: 0.85rem; margin-top: 6px; }
</style>
