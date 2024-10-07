<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Card from '$lib/components/ui/card/index';
	import { Input } from '$lib/components/ui/input';
	import { changePasswordFormSchema, type ChangePasswordFormSchema } from '$lib/schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	export let data: SuperValidated<Infer<ChangePasswordFormSchema>>;

	// Initialize the form with onResult callback
	const form = superForm(data, {
		validators: zodClient(changePasswordFormSchema)
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" action="?/newPassword" use:enhance class="space-y-4">
	<Card.Content>
		<Form.Field {form} name="currentPassword">
			<Form.Control let:attrs>
				<Form.Label>Current Password</Form.Label>
				<Input {...attrs} type="password" required bind:value={$formData.currentPassword} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="newPassword">
			<Form.Control let:attrs>
				<Form.Label>New Password</Form.Label>
				<Input {...attrs} type="password" bind:value={$formData.newPassword} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="repeatNewPassword">
			<Form.Control let:attrs>
				<Form.Label>Repeat New Password</Form.Label>
				<Input {...attrs} type="password" bind:value={$formData.repeatNewPassword} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</Card.Content>
	<Card.Footer class="border-t px-6 py-4">
		<Form.Button>Change Password</Form.Button>
	</Card.Footer>
</form>
