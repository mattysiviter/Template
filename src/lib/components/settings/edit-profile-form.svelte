<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { editProfileFormSchema, type EditProfileFormSchema } from '$lib/schema';
	import { type SuperValidated, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { createEventDispatcher } from 'svelte';
	import { type Infer } from 'sveltekit-superforms/server';

	interface EditProfileActionResult {
		nameUpdated: any;
		success: boolean;
		emailUpdateInitiated?: boolean;
	}

	const dispatch = createEventDispatcher<{
		close: void;
		emailUpdate: { emailUpdateInitiated: boolean };
	}>();

	export let data: SuperValidated<Infer<EditProfileFormSchema>>;
	export let name: string;
	export let email: string;

	const form = superForm(data, {
		validators: zodClient(editProfileFormSchema),
		onResult({ result }) {
			if (result.type === 'success') {
				const actionResult = result.data as EditProfileActionResult;
				if (actionResult.emailUpdateInitiated && actionResult.nameUpdated) {
					toast.success('Name Updated');
					toast.success('Email verification sent');
				} else if (actionResult.emailUpdateInitiated) {
					toast.success('Email verification sent');
				} else if (actionResult.nameUpdated) {
					toast.success('Profile Updated');
				}

				if (actionResult.emailUpdateInitiated) {
					dispatch('emailUpdate', { emailUpdateInitiated: true });
				}

				if (actionResult.success) {
					dispatch('close');
				}
			} else if (result.type === 'error') {
				toast.error('An error occurred while updating the profile');
			}
		}
	});

	const { form: formData, enhance } = form;

	$: if (!$formData.name) {
		$formData.name = name;
	}
	$: if (!$formData.email) {
		$formData.email = email;
	}
</script>

<!-- Form HTML remains the same -->

<form method="POST" action="?/editProfile" use:enhance>
	<div class="grid gap-4 py-4">
		<!-- Name field -->
		<Form.Field {form} name="name">
			<Form.Control let:attrs>
				<div class="grid grid-cols-4 items-center gap-4">
					<Form.Label for="name" class="text-right">Name</Form.Label>
					<Input {...attrs} id="name" bind:value={$formData.name} class="col-span-3" />
				</div>
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Email field -->
		<Form.Field {form} name="email">
			<Form.Control let:attrs>
				<div class="grid grid-cols-4 items-center gap-4">
					<Form.Label for="email" class="text-right">Email</Form.Label>
					<Input {...attrs} id="email" bind:value={$formData.email} class="col-span-3" />
					<span class="col-span-1"></span>
					<Form.Description class="col-span-3 text-left">
						New emails must be verified
					</Form.Description>
				</div>
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Password field -->
		<Form.Field {form} name="password">
			<Form.Control let:attrs>
				<div class="grid grid-cols-4 items-center gap-4">
					<Form.Label for="password" class="text-right">Password</Form.Label>
					<Input
						{...attrs}
						id="password"
						type="password"
						placeholder="Confirm Password"
						bind:value={$formData.password}
						class="col-span-3"
					/>
				</div>
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Submit button -->
		<Dialog.Footer>
			<Form.Button type="submit">Save changes</Form.Button>
		</Dialog.Footer>
	</div>
</form>
