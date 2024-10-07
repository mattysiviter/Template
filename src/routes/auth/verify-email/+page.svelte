<script lang="ts">
	import type { ActionData, PageData } from './$types.js';
	import SignUpForm from '$lib/components/auth/sign-up-form.svelte';
	import VerifyEmailForm from '$lib/components/auth/verify-email-form.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { enhance } from '$app/forms';

	export let data: PageData;
</script>

<div class="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
	<div class="flex items-center justify-center py-12">
		<div class="mx-auto grid w-[350px] gap-6">
			<div class="grid gap-2 text-center">
				<h1 class="text-3xl font-bold">Email Verification</h1>
				<p class="text-balance text-muted-foreground">
					We've sent a verification email to your account. Please check your inbox and follow the
					instructions to verify your email address.
				</p>
			</div>
			<div class="grid gap-4">
				<VerifyEmailForm data={data.verifyEmailform} />
			</div>
			<div class="mt-4 text-center text-sm">
				Didn't receive the email?
				<form method="POST" action="?/resendEmailVerification">
					<Button variant="link" type="submit">Resend verification email</Button>
				</form>
			</div>
		</div>
	</div>
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
