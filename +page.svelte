<script>
	let studying = false;

	function toggleStudy() {
		studying = !studying;
	}
</script>

<h1>ZenNexus</h1>

<p>Status: {studying ? "Studying" : "Not Studying"}</p>

<button on:click={toggleStudy}>
	{studying ? "Stop Study" : "Start Study"}
</button>
