<script>
	let studying = false;
	let seconds = 0;
	let timer;

	function startStudy() {
		if (studying) return;
		studying = true;
		timer = setInterval(() => {
			seconds += 1;
		}, 1000);
	}

	function stopStudy() {
		studying = false;
		clearInterval(timer);
	}
</script>

<h1>ZenNexus</h1>

<p>Status: {studying ? "Studying" : "Not Studying"}</p>
<p>Time: {seconds} seconds</p>

{#if !studying}
	<button on:click={startStudy}>Start Study</button>
{:else}
	<button on:click={stopStudy}>Stop Study</button>
{/if}
