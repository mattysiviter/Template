<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import {
		codeTwoFactorAuthenticationFormSchema,
		type CodeTwoFactorAuthenticationFormSchema
	} from '$lib/schema';
	import { createEventDispatcher } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	export let data: SuperValidated<Infer<CodeTwoFactorAuthenticationFormSchema>>;
	const dispatch = createEventDispatcher();

	const form = superForm(data, {
		validators: zodClient(codeTwoFactorAuthenticationFormSchema),
		async onResult({ result }) {
			if (result.type === 'success') {
				dispatch('setupSuccess'), toast.success('Enabled 2FA');
			}
		}
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance action="?/verify2FA">
	<Form.Field {form} name="code">
		<Form.Control let:attrs>
			<Form.Label>Verify 2-Factor Authentication Code</Form.Label>
			<Input {...attrs} bind:value={$formData.code} class="w-72" />
		</Form.Control>
		<Form.Description>Please Verify your 2-Factor Authentication Code</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button>Verify</Form.Button>
</form>
