<script>
	import { createEventDispatcher } from 'svelte';
	import { RiArrowRightSLine } from 'svelte-remixicon';
	const dispatch = createEventDispatcher();
	import * as Card from '$lib/components/ui/card/index';
	import { Description } from 'formsnap';
	export let variable;
	export let title;
</script>

<button
	on:click={() => {
		dispatch('toggle');
	}}
	class="font-inherit bg-transparen flex h-16 w-full cursor-pointer flex-row items-center justify-between border-0 p-4 pl-6 text-left hover:bg-slate-100 focus:outline-none"
>
	<div class="flex flex-col gap-1">
		<Card.Title>{title}</Card.Title>
		<Card.Description>{variable}</Card.Description>
	</div>
	<RiArrowRightSLine class="h-4 w-4" />
</button>
