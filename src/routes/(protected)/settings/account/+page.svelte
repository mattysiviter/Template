<script lang="ts">
	import type { ActionData, PageData } from './$types.js';
	import * as Card from '$lib/components/ui/card/index';
	import { Alert, AlertDescription } from '$lib/components/ui/alert/index';
	import { RiAlertFill } from 'svelte-remixicon';
	import DeleteAccountForm from '../../../../lib/components/delete-account-form.svelte';
	import ConfirmCard from '../../../../lib/components/confirm-card.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import EditProfileForm from '$lib/components/settings/edit-profile-form.svelte';
	import UpdateEmailForm from '$lib/components/settings/update-email-form.svelte';
	import { invalidateAll } from '$app/navigation';
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";

	export let data: PageData;
	let deleteAccountForm: DeleteAccountForm;
	let showConfirmCard = false;
	let isOpen = false;
	let emailUpdateInitiated = false;

	$: if (!isOpen) {
		emailUpdateInitiated = false;
	}

	function handleEditProfileResult(event: CustomEvent<{ emailUpdateInitiated: boolean }>) {
		if (event.detail.emailUpdateInitiated) {
			emailUpdateInitiated = true;
		} else {
			isOpen = false;
			invalidateAll();
		}
	}

	function handleConfirmDelete() {
		if (deleteAccountForm) {
			deleteAccountForm.submitForm();
		}
		showConfirmCard = false;
	}

	function toggleConfirmCard() {
		showConfirmCard = !showConfirmCard;
	}
</script>

<div class="flex min-h-screen w-full flex-col">
	<main
		class="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10"
	>
		<div class="mx-auto grid w-full max-w-6xl gap-2">
			<h1 class="text-3xl font-semibold">Account Settings</h1>
			<Breadcrumb.Root>
				<Breadcrumb.List>
					<Breadcrumb.Item>
						<Breadcrumb.Link href="/dashboard">Dashboard</Breadcrumb.Link>
					</Breadcrumb.Item>
					<Breadcrumb.Separator />
					<Breadcrumb.Item>
						<Breadcrumb.Page>Account Settings</Breadcrumb.Page>
					</Breadcrumb.Item>
				</Breadcrumb.List>
			</Breadcrumb.Root>
		</div>
		<div
			class="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]"
		>
			<nav
				class="grid gap-4 text-sm text-muted-foreground"
				data-x-chunk-container="chunk-container after:right-0"
			>
				<a href="/settings/account" class="font-semibold text-primary">Account</a>
				<a href="/settings/billing">Billing</a>
				<a href="/settings/security">Security</a>
			</nav>
			<div class="grid gap-6">
				<Card.Root class="w-full">
					<Card.Header>
						<Card.Title>Personal Information</Card.Title>
						<Card.Description>Update your personal details here.</Card.Description>
					</Card.Header>
					<Card.Content class="flex flex-col gap-4">
						<div>
							<Card.Title>Email</Card.Title>
							<Card.Description>{data.email}</Card.Description>
						</div>
						<div>
							<Card.Title>Name</Card.Title>
							<Card.Description>{data.name}</Card.Description>
						</div>
						<Dialog.Root bind:open={isOpen}>
							<Dialog.Trigger
								class={buttonVariants({ variant: 'outline' })}
								on:click={() => {
									console.log('Edit Profile button clicked');
									isOpen = true;
								}}
							>
								Edit Profile
							</Dialog.Trigger>
							<Dialog.Content class="h-[400px] overflow-y-auto sm:max-w-[425px]">
								<Dialog.Header>
									<Dialog.Title>Edit profile</Dialog.Title>
									<Dialog.Description>
										{#if emailUpdateInitiated}
											A verification email has been sent to your new email address. Please check
											your inbox and follow the instructions to complete the email update.
										{:else}
											Make changes to your profile here. Click save when you're done.
										{/if}
									</Dialog.Description>
								</Dialog.Header>
								{#if !emailUpdateInitiated}
									<EditProfileForm
										data={data.editProfileForm}
										name={data.name}
										email={data.email}
										on:close={() => (isOpen = false)}
										on:emailUpdate={handleEditProfileResult}
									/>
								{:else}
									<UpdateEmailForm data={data.updateEmailForm} on:close={() => (isOpen = false)} />
								{/if}
							</Dialog.Content>
						</Dialog.Root>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header>
						<Card.Title>Delete Account</Card.Title>
						<Card.Description>
							Permanently delete your account and all associated data.
						</Card.Description>
					</Card.Header>
					<Card.Content>
						<Alert variant="destructive">
							<AlertDescription class="flex items-center gap-2">
								<RiAlertFill class="h-4 w-4" />
								Warning: This action is irreversible. All your data will be permanently deleted.
							</AlertDescription>
						</Alert>
						<DeleteAccountForm
							bind:this={deleteAccountForm}
							usersName={data.name}
							data={data.deleteAccountForm}
							on:confirm={toggleConfirmCard}
						/>
					</Card.Content>
				</Card.Root>
				{#if showConfirmCard}
					<ConfirmCard on:cancel={toggleConfirmCard} onDelete={handleConfirmDelete} />
				{/if}
			</div>
		</div>
	</main>
</div>