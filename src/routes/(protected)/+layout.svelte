<script lang="ts">
	import '../../app.css';
	import Sidebar from '$lib/components/sidebar.svelte';
	import Header from '$lib/components/header.svelte';

	let isOpen: boolean = false;

	function toggleSidebar(): void {
		isOpen = !isOpen;
	}
</script>

<div class="flex h-screen flex-col overflow-hidden bg-slate-700">
	<Header {toggleSidebar} />
	<main class="flex flex-1 overflow-hidden">
		<Sidebar {isOpen} />
		<div class="flex-1 bg-green-800 p-2 pl-4 sm:pl-0">
			<div
				class="h-full overflow-hidden rounded-sm border-2 border-solid border-white bg-slate-600"
			>
				<slot />
			</div>
		</div>
	</main>
</div>
