<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { backupCodesFormSchema, type BackupCodesFormSchema } from '$lib/schema';
	import { toast } from 'svelte-sonner';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	export let data: SuperValidated<Infer<BackupCodesFormSchema>>;

	const form = superForm(data, {
		validators: zodClient(backupCodesFormSchema),
		onResult({result}) {
			if(result.type === 'success'){
				toast.success("Logging in...")
			}
		},
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" action="?/verifyBackupCode" use:enhance>
	<Form.Field {form} name="backupCode">
		<Form.Control let:attrs>
			<Form.Label>Backup Codes</Form.Label>
			<Input {...attrs} bind:value={$formData.backupCode} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button class="mt-2 w-full">Submit</Form.Button>
</form>
