<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { verifyEmailFormSchema, type VerifyEmailFormSchema } from '$lib/schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	export let data: SuperValidated<Infer<VerifyEmailFormSchema>>;

	const form = superForm(data, {
		validators: zodClient(verifyEmailFormSchema)
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance>
	<Form.Field {form} name="code">
		<Form.Control let:attrs>
			<Form.Label>Verify Code</Form.Label>
			<Input {...attrs} bind:value={$formData.code} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button class="mt-2 w-full">Submit</Form.Button>
</form>
