<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { changeNameFormSchema, type ChangeNameFormSchema } from '$lib/schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { createEventDispatcher } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '../ui/button';

	export let data: SuperValidated<Infer<ChangeNameFormSchema>>;
	const dispatch = createEventDispatcher();

	const form = superForm(data, {
		validators: zodClient(changeNameFormSchema),
		onResult({ result }) {
			if (result.type === 'success') {
				dispatch('toggle');
				toast.success('Successfully Changed Name');
			}
		}
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" action="?/changeName" use:enhance>
	<Card.Root>
		<Card.Header>
			<Card.Title>Update Full Name</Card.Title>
			<Card.Description>Update your personal details here.</Card.Description>
		</Card.Header>
		<Card.Content>
			<Form.Field {form} name="name">
				<Form.Control let:attrs>
					<Form.Label>Name</Form.Label>
					<Input {...attrs} bind:value={$formData.name} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="password">
				<Form.Control let:attrs>
					<Form.Label>Confirm Password</Form.Label>
					<Input {...attrs} type="password" bind:value={$formData.password} />
				</Form.Control>
				<Form.Description></Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<div class="flex flex-row justify-between">
				<Form.Button>Submit</Form.Button>
				<Button on:click={() => dispatch('toggle')}>Back</Button>
			</div>
		</Card.Content>
	</Card.Root>
</form>
