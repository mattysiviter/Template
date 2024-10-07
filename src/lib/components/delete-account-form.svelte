<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { deleteAccountFormSchema, type DeleteAccountFormSchema } from '$lib/schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { createEventDispatcher } from 'svelte';
	import { toast } from '../../routes/+layout.svelte';

	const dispatch = createEventDispatcher();
	let formElement: HTMLFormElement;

	export function submitForm() {
		if (formElement && canDelete) {
			formElement.requestSubmit();
		}
	}

	export let data: SuperValidated<Infer<DeleteAccountFormSchema>>;
	export let usersName: string;

	const form = superForm(data, {
		validators: zodClient(deleteAccountFormSchema),
		onResult({ result }) {
			if (result.type === 'success') {
				dispatch('toggle');
				toast.success('Account successfully deleted');
			}
		}
	});

	const { form: formData, enhance } = form;

	$: canDelete = $formData.usersname === usersName;
</script>

<form
	bind:this={formElement}
	method="POST"
	id="deleteAccountForm"
	action="?/deleteAccount"
	use:enhance
	class="mt-4 space-y-4"
>
	<Form.Field {form} name="usersname">
		<Form.Control let:attrs>
			<Form.Label>Type {usersName} to confirm</Form.Label>
			<Input {...attrs} placeholder={usersName} bind:value={$formData.usersname} />
		</Form.Control>
		<Form.Description>This is your public display name.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Card.Footer class="p-0">
		<Button
			variant="destructive"
			disabled={!canDelete}
			on:click={() => {
				dispatch('confirm');
			}}
		>
			Permanently Delete Account
		</Button>
	</Card.Footer>
</form>
