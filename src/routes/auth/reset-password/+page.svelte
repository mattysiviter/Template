<script lang="ts">
	import PasswordResetForm from '$lib/components/auth/password-reset-form.svelte';
	import type { ActionData, PageData } from './$types.js';
	export let data: PageData;
	export let form: ActionData;
</script>

<div class="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
	{#if !form?.success}
		<div class="flex items-center justify-center py-12">
			<div class="mx-auto grid w-[350px] gap-6">
				<div class="grid gap-2 text-center">
					<h1 class="text-3xl font-bold">Reset Password</h1>
					<p class="text-balance text-muted-foreground">
						Enter the email associated with your account to change your password.
					</p>
				</div>
				<div class="grid gap-2">
					<PasswordResetForm data={data.form} />
				</div>
				<div class="mt-4 text-center text-sm">
					Return to login?
					<a href="/auth/login" class="underline">Login</a>
				</div>
			</div>
		</div>
	{:else}
		<div class="flex items-center justify-center py-12">
			<div class="mx-auto grid w-[350px] gap-6">
				<div class="grid gap-2 text-center">
					<h1 class="text-3xl font-bold">Request Submitted ✅</h1>
					<p class="text-balance text-muted-foreground">
						If an account exists for the email address you entered, you will receive a password
						reset link shortly.
					</p>
				</div>
				<div class="grid gap-4">
					<p class="text-sm text-muted-foreground">
						Please check your email inbox, including your spam or junk folder. The reset link will
						expire in 24 hours for security reasons.
					</p>
					<p class="text-sm text-muted-foreground">
						If you don't receive an email, it may mean that no account exists for that address in
						our system.
					</p>
				</div>
				<div class="mt-4 text-center text-sm">
					Return to login?
					<a href="/auth/login" class="underline">Login</a>
				</div>
			</div>
		</div>
	{/if}
	<div class="hidden bg-muted lg:block">
		<img
			src=""
			alt="placeholder"
			class="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
		/>
	</div>
</div>
