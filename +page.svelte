<script>
	import { onMount } from 'svelte';
	import { auth, db } from '$lib/firebase.js';
	import { doc, getDoc, setDoc } from 'firebase/firestore';

	let plannedSessions = 4;
	let plannedFocusMinutes = 100;
	let plannedDate = '';
	let ready = false;
	let saving = false;
	let saved = false;
	let error = '';

	function tomorrowISO() {
		const d = new Date();
		d.setDate(d.getDate() + 1);
		return d.toISOString().slice(0, 10);
	}

	async function loadPlan(uid) {
		const ref = doc(db, 'users', uid, 'plans', plannedDate);
		const snap = await getDoc(ref);
		if (snap.exists()) {
			const data = snap.data();
			plannedSessions = Number(data.plannedSessions ?? plannedSessions);
			plannedFocusMinutes = Number(data.plannedFocusMinutes ?? plannedFocusMinutes);
		}
	}

	async function savePlan() {
		error = '';
		saved = false;
		if (!auth.currentUser) {
			error = 'Not authenticated';
			return;
		}
		try {
			saving = true;
			const uid = auth.currentUser.uid;
			const ref = doc(db, 'users', uid, 'plans', plannedDate);
			await setDoc(ref, {
				plannedSessions: Number(plannedSessions),
				plannedFocusMinutes: Number(plannedFocusMinutes),
				plannedDate
			});
			saved = true;
		} catch (e) {
			error = 'Failed to save plan';
		} finally {
			saving = false;
		}
	}

	onMount(() => {
		plannedDate = tomorrowISO();
		const unsub = auth.onAuthStateChanged(async (user) => {
			if (!user) return;
			ready = true;
			await loadPlan(user.uid);
		});
		return () => unsub?.();
	});
</script>

<main class="page" aria-busy={!ready}>
	<section class="wrap">
		<h2>Tomorrow’s Plan</h2>

		<div class="card">
			<div class="row">
				<label for="date">Date</label>
				<input id="date" type="date" value={plannedDate} oninput={(e) => (plannedDate = e.target.value)} />
			</div>
			<div class="row">
				<label for="sessions">Number of sessions</label>
				<input id="sessions" type="number" min="1" max="20" value={plannedSessions} oninput={(e) => (plannedSessions = Number(e.target.value))} />
			</div>
			<div class="row">
				<label for="minutes">Total planned focus time (minutes)</label>
				<input id="minutes" type="number" min="15" max="1000" value={plannedFocusMinutes} oninput={(e) => (plannedFocusMinutes = Number(e.target.value))} />
			</div>

			<button class="save" onclick={savePlan} aria-disabled={saving}>{saving ? 'Saving…' : 'Save Plan'}</button>
			{#if saved}<p class="ok">Plan saved</p>{/if}
			{#if error}<p class="err">{error}</p>{/if}
		</div>
	</section>
</main>

<style>
	.page {
		min-height: 100vh;
		background: #020617;
		display: flex;
		justify-content: center;
		align-items: center;
		font-family: system-ui, sans-serif;
		color: #e5e7eb;
	}
	.wrap { width: 100%; max-width: 560px; padding: 16px; }
	h2 { margin: 0 0 12px 0; font-size: 1rem; color: #e5e7eb; }
	.card { background: #0b1220; border-radius: 12px; padding: 16px; }
	.row { display: grid; grid-template-columns: 1fr; gap: 6px; margin-bottom: 10px; }
	label { color: #94a3b8; font-size: 0.85rem; }
	input {
		width: 100%;
		padding: 10px;
		border-radius: 10px;
		border: 1px solid #1e293b;
		background: #0b1220;
		color: #e5e7eb;
	}
	.save {
		margin-top: 6px;
		width: 100%;
		border: 1px solid #1e293b;
		background: #22c55e;
		color: black;
		border-radius: 10px;
		padding: 10px;
		cursor: pointer;
	}
	.ok { color: #94a3b8; font-size: 0.85rem; margin-top: 6px; }
	.err { color: #94a3b8; font-size: 0.85rem; margin-top: 6px; }
</style>
