<!-- Card.svelte -->
<script>
	export let content;
	export let description;
	export let icon;
	export let link;
</script>

<a href={link} class="block w-full sm:w-[300px]">
	<div
		class="group relative flex h-[150px] flex-col items-center justify-center overflow-hidden rounded-sm border-2 border-solid border-white bg-green-800 text-black sm:h-[200px]"
	>
		<svelte:component this={icon} class="h-8 w-8 text-white sm:h-12 sm:w-12" />
		<div
			class="absolute inset-y-0 bottom-0 z-10 flex h-full w-full translate-y-full transform flex-col justify-between bg-black bg-opacity-50 p-3
    pb-2 transition-transform duration-300 ease-in-out group-hover:translate-y-0 sm:p-5 sm:pb-3"
		>
			<span class="flex text-xl font-bold text-white sm:text-2xl">{content}</span>
			<span class="flex text-sm text-white sm:text-base">{description}</span>
		</div>
	</div>
</a>
