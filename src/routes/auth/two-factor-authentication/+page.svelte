<script lang="ts">
	import type { PageData } from './$types.js';
	import LoginForm from '$lib/components/auth/login-form.svelte';
	import TwoFactorAuthenticationForm from '$lib/components/auth/two-factor-authentication-form.svelte';
	import BackupCodesForm from '$lib/components/auth/backup-codes-form.svelte';
	import VerifyEmailForm from '$lib/components/auth/verify-email-form.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	export let data: PageData;
	let backupCodes: boolean = false;

	function backupCodesForm() {
		backupCodes = !backupCodes;
	}
</script>

<div class="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
	{#if !backupCodes}
		<div class="flex items-center justify-center py-12">
			<div class="mx-auto grid w-[350px] gap-6">
				<div class="grid gap-2 text-center">
					<h1 class="text-3xl font-bold">2-Factor Authentication</h1>
					<p class="text-balance text-muted-foreground">Enter your 2-Factor Authentication Code</p>
				</div>
				<div class="grid gap-4">
					<TwoFactorAuthenticationForm data={data.twoFactorAuthenticationForm} />
				</div>
				<div class="mt-4 text-center text-sm">
					Not Working?

					<Button
						type="button"
						variant="link"
						on:click={() => backupCodesForm()}
						
					>
						Use backup codes
				</Button>
				</div>
			</div>
		</div>
	{:else}
		<!-- Backup Codes Form -->
		<div class="flex items-center justify-center py-12">
			<div class="mx-auto grid w-[350px] gap-6">
				<div class="grid gap-2 text-center">
					<h1 class="text-3xl font-bold">Backup Codes</h1>
					<p class="text-balance text-muted-foreground">Enter a Backup Code</p>
				</div>
				<div class="grid gap-4">
					<BackupCodesForm data={data.backupCodesForm} />
				</div>
				<div class="mt-4 text-center text-sm">
					Back to two-factor-authentication

					<Button
						type="button"
						variant="link"
						on:click={() => backupCodesForm()}
						
					>
					Use 2-Factor Authentication
				</Button>
				</div>
			</div>
		</div>
	{/if}
	<div class="hidden bg-muted lg:block">
		<img
			src=""
			alt="placeholder"
			width="1920"
			height="1080"
			class="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
		/>
	</div>
</div>
