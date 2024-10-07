<script lang="ts">
	import * as Card from '$lib/components/ui/card/index';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Checkbox } from '$lib/components/ui/checkbox/index';
	import Label from '$lib/components/ui/label/label.svelte';
	import type { ActionData, PageData } from './$types';
	import ChangePasswordForm from '$lib/components/settings/change-password-form.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';
	import CodeTwoFactorAuthenticationForm from '$lib/components/settings/code-two-factor-authentication-form.svelte';
	import DialogFooter from '$lib/components/ui/dialog/dialog-footer.svelte';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";

	export let data: PageData;
	export let form: ActionData;
	let isOpen = false;
	let checked = data.enabled;
	let setupKey: boolean = false;
	let error: string | null = null;
    let success: boolean = false;
	$: currentStage = 'initial';

	$: if (!isOpen) {
		if(currentStage === '2FAsuccess'){
			currentStage = 'initial';
		} else if((currentStage === 'verify2FA' || currentStage === 'setup') && !data.enabled){
			invalidateAll();
			currentStage = 'initial';
			cancel2FA();
			
		}
	}

	function toggleCheckbox(event: { preventDefault: () => void }) {
		event.preventDefault();
	}

	function toggleQRCode() {
		setupKey = !setupKey;
	}

	function handleFormSubmission() {
		currentStage = 'setup';
	}
	function handleSetupSubmission() {
		currentStage = '2FAsuccess';
		checked = true;
	}

	function handleDisable2FASubmission(){
		isOpen = false;
		checked = false;
		toast.success("Disabled 2FA")
	}

	function copyCode() {
		const backupCode = data?.backupCode; // Assuming `data` holds the backup code

		if (backupCode) {
			navigator.clipboard
				.writeText(backupCode)
				.then(() => {
					toast.success('Backup code copied to clipboard');
				})
				.catch((err) => {
					console.error('Failed to copy: ', err);
					toast.error('Failed to copy backup code');
				});
		} else {
			toast.error('No backup code to copy');
		}
	}

	async function cancel2FA(){
		error = null;
        success = false;
        try {
            const response = await fetch('/api/cancel-two-factor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();

            if (!response.ok) {
                error = result.message || 'Something went wrong';
            } else {
                success = result.success;
				console.log("2FA Cancelled")
            }
        } catch (err) {
            error = 'Network error or server is unavailable';
        }
    }

</script>

<div class="flex min-h-screen w-full flex-col">
	<main
		class="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10"
	>
		<div class="mx-auto grid w-full max-w-6xl gap-2">
			<h1 class="text-3xl font-semibold">Security Settings</h1>
			<Breadcrumb.Root>
				<Breadcrumb.List>
					<Breadcrumb.Item>
						<Breadcrumb.Link href="/dashboard">Dashboard</Breadcrumb.Link>
					</Breadcrumb.Item>
					<Breadcrumb.Separator />
					<Breadcrumb.Item>
						<Breadcrumb.Page>Security Settings</Breadcrumb.Page>
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
				<a href="/settings/account">Account</a>
				<a href="/settings/billing">Billing</a>
				<a href="/settings/security" class="font-semibold text-primary">Security</a>
			</nav>
			<div class="grid gap-6">
				<Card.Root>
					<Card.Header>
						<Card.Title>Two-Factor Authentication</Card.Title>
						<Card.Description>Add and extra layer of security to your account</Card.Description>
					</Card.Header>
					<Card.Content class="flex flex-col gap-4">
						<div class="flex flex-row gap-4">
						<Dialog.Root bind:open={isOpen}>
							<Dialog.Trigger>
								<div class="flex items-center space-x-2">
									<Checkbox id="terms" bind:checked on:click={toggleCheckbox} />
									<Label
										for="terms"
										class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										Enable Two-Factor Authentication
									</Label>
								</div>
							</Dialog.Trigger>
							<Dialog.Content class="sm:max-w-[425px]">
								{#if data.enabled && currentStage != "2FAsuccess"}
									<Dialog.Header>
										<Dialog.Title>Disable Two-Factor Authentication</Dialog.Title>
										<Dialog.Description>
											Are you sure you want to disable two-factor authentication? This will make your account
											less secure.
										</Dialog.Description>
									</Dialog.Header>
									<Dialog.Footer>
										<form action="?/disableTwoFA" method="POST" use:enhance={handleDisable2FASubmission}>
											<Button class="w-full" variant="destructive" type="submit">Disable</Button>
										</form>
									</Dialog.Footer>
								{:else if currentStage === 'initial'}
									<Dialog.Header>
										<Dialog.Title>Two-Factor Authentication</Dialog.Title>
										<Dialog.Description>
											Set up two-factor authentication for your account
										</Dialog.Description>
									</Dialog.Header>
									<Dialog.Footer>
										<form action="?/setUpTwoFA" method="POST" use:enhance={handleFormSubmission}>
											<Button type="submit">Get Started</Button>
										</form>
									</Dialog.Footer>
								{:else if currentStage === 'setup'}
									<Dialog.Header>
										<Dialog.Title>Two-Factor Authentication</Dialog.Title>
										<Dialog.Description>
											Use your authentication app to scan this QR code. If you don't have an
											authentication app on your device, you'll need to install one now.
										</Dialog.Description>
									</Dialog.Header>
									{#if !setupKey}
										<div class="flex h-56 flex-col items-center justify-center gap-0">
											<img
												src={data.twoFASetupData?.qrcode}
												alt="2FA QR Code"
												class="mx-auto h-48 w-48"
											/>
											<Button variant="link" on:click={toggleQRCode}>Can't Scan QR Code?</Button>
										</div>
									{:else}
										<div class="flex h-20 flex-col items-center justify-center bg-slate-100">
											<p class="font-mono text-sm">
												Setup Key: {data.twoFASetupData?.manualEntryCode}
											</p>
										</div>
										<Button variant="link" on:click={toggleQRCode}>Use QR Code?</Button>
									{/if}
									<DialogFooter>
										<Button
											on:click={() => {
												currentStage = 'verify2FA';
												setupKey = false;
											}}
										>
											Next</Button
										>
									</DialogFooter>
								{:else if currentStage === 'verify2FA'}
									<Dialog.Header>
										<Dialog.Title>Two-Factor Authentication</Dialog.Title>
										<Dialog.Description>
											Please use the code outputed by your chosen authentator app
											<Button
												on:click={() => {
													currentStage = 'setup';
												}}
												variant="link">Return to Setup</Button
											>
										</Dialog.Description>
									</Dialog.Header>

									<CodeTwoFactorAuthenticationForm
										data={data.codeTwoFactorAuthenticationForm}
										on:setupSuccess={handleSetupSubmission}
									/>
								{:else if currentStage === '2FAsuccess'}
									<Dialog.Header>
										<Dialog.Title>Backup Code</Dialog.Title>
										<Dialog.Description>
											If you ever lose access to your device, you can use this code to verify your
											identity.
											<br />
											<br />
											Write it down, or take a screenshot, and keep it some place safe. This code can
											only be used once.
										</Dialog.Description>
									</Dialog.Header>
									<div class="mb-10 mt-10 text-center">
										<p class="text-3xl font-bold tracking-wider">{form?.backupCode}</p>
									</div>
								
								{/if}
							</Dialog.Content>
						</Dialog.Root>

						<div>
							{#if data.enabled}
								<Badge variant="secondary" class="flex items-center space-x-1 bg-opacity-50">
									<span class="h-2 w-2 rounded-full bg-green-500"></span>
									<span>Enabled</span>
								</Badge>
							{:else}
								<Badge variant="secondary" class="flex items-center space-x-1 bg-opacity-50">
									<span class="h-2 w-2 rounded-full bg-red-500"></span>
									<span>Disabled</span>
								</Badge>
							{/if}
						</div>
						</div>
						<Dialog.Root>
							<div class="flex flex-row items-center">
				
								<Dialog.Trigger class={`${buttonVariants({ variant: "ghost" })} w-32`}
								>View Backup Code</Dialog.Trigger
							  >
							</div>
							
							<Dialog.Content class="sm:max-w-[425px]">
							  <Dialog.Header>
								<Dialog.Title>Backup Code</Dialog.Title>
								<Dialog.Description>
									If you ever lose access to your device, you can use this code to verify your
									identity.
									<br />
									<br />
									Write it down, or take a screenshot, and keep it some place safe. This code can
									only be used once.
								</Dialog.Description>
							</Dialog.Header>
								<div class="mb-10 mt-10 text-center bg-slate-50">
									{#if data.backupCode}
									<p class="text-3xl font-bold tracking-wider">{data.backupCode}</p>
									{:else}
									<p class="text-sm">A code will appear here once 2FA has been setup.</p>
									{/if}
								</div>
	
								<div class="flex flex-col space-y-4">
									<Button on:click={copyCode} variant="default" class="w-full">
										Copy code
									</Button>
	
									<form action="?/newBackupCode" method="POST" use:enhance>
										<Button type="submit" variant="outline" class="w-full text-blue-500">
											Generate a new code
										</Button>
									</form>
							
							
							</Dialog.Content>
						  </Dialog.Root>
					</Card.Content>
				</Card.Root>
				
					
					

				<Card.Root>
					<Card.Header>
						<Card.Title>Change Password</Card.Title>
						<Card.Description>
							Ensure your account is using a long, random password to stay secure.
						</Card.Description>
					</Card.Header>
					<ChangePasswordForm data={data.changePasswordForm} />
				</Card.Root>
			</div>
		</div>
	</main>
</div>
