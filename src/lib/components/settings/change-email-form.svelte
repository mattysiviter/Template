<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { changeEmailFormSchema, type ChangeEmailFormSchema } from '$lib/schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { createEventDispatcher } from 'svelte';
	import { Button } from '../ui/button';

	export let data: SuperValidated<Infer<ChangeEmailFormSchema>>;
	const dispatch = createEventDispatcher();

	const form = superForm(data, {
		validators: zodClient(changeEmailFormSchema),
		onResult({ result }) {
			if (result.type === 'success') {
				dispatch('toggle');
				toast.success('Successfully Updated Email');
			} else if (result.type === 'error') {
				toast.error('An Error Occured, Please Try Again');
			}
		}
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" action="?/changeEmail" use:enhance>
	<Card.Root>
		<Card.Header>
			<Card.Title>Update Email</Card.Title>
			<Card.Description>Update your personal details here.</Card.Description>
		</Card.Header>
		<Card.Content>
			<Form.Field {form} name="email">
				<Form.Control let:attrs>
					<Form.Label>Email</Form.Label>
					<Input {...attrs} bind:value={$formData.email} />
				</Form.Control>
				<Form.Description>Email Changes Must Be Verified</Form.Description>
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
				<Form.Button>Verify</Form.Button>
				<Button on:click={() => dispatch('toggle')}>Back</Button>
			</div>
		</Card.Content>
	</Card.Root>
</form>
