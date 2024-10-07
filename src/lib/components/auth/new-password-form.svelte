<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { newPasswordFormSchema, type NewPasswordFormSchema } from '$lib/schema';
	import { toast } from 'svelte-sonner';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	export let data: SuperValidated<Infer<NewPasswordFormSchema>>;

	const form = superForm(data, {
		validators: zodClient(newPasswordFormSchema),
		onResult({ result }) {
			if (result.type === 'redirect') {
				toast.success('Password Changed');
			}
		}
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance>
	<Form.Field {form} name="newPassword">
		<Form.Control let:attrs>
			<Form.Label>New Password</Form.Label>
			<Input {...attrs} bind:value={$formData.newPassword} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="newPassword">
		<Form.Control let:attrs>
			<Form.Label>Repeat New Password</Form.Label>
			<Input {...attrs} bind:value={$formData.repeatNewPassword} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button class="mt-4 w-full">Submit</Form.Button>
</form>
