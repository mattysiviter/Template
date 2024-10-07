<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let onDelete: () => void;
</script>

<div
	class="pointer-events-auto fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300"
>
	<Card.Root>
		<Card.Header>
			<Card.Title>Confirm Account Deletion</Card.Title>
			<Card.Description>
				This action will permanently remove your account and all associated data.
			</Card.Description>
		</Card.Header>
		<Card.Content class="flex justify-evenly">
			<Button on:click={() => dispatch('cancel')}>Cancel</Button>
			<Button variant="destructive" on:click={onDelete}>Delete</Button>
		</Card.Content>
	</Card.Root>
</div>
