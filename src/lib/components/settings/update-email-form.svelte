<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { updateEmailFormSchema, type UpdateEmailFormSchema } from '$lib/schema';
	import { createEventDispatcher } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	export let data: SuperValidated<Infer<UpdateEmailFormSchema>>;
	const dispatch = createEventDispatcher();

	const form = superForm(data, {
		validators: zodClient(updateEmailFormSchema),
		onResult({ result }) {
			if (result.type === 'success') {
				toast.success('Email Verified');
				dispatch('close');
			}
		}
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" action="?/updateEmail" use:enhance>
	<Form.Field {form} name="code">
		<Form.Control let:attrs>
			<Form.Label>Verify Code</Form.Label>
			<Input {...attrs} bind:value={$formData.code} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button class="mt-2 w-full">Submit</Form.Button>
</form>
