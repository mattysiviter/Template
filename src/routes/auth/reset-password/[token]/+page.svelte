<script lang="ts">
	import NewPasswordForm from '$lib/components/new-password-form.svelte';
	import type { PageData } from './$types.js';
	export let data: PageData;
</script>

<div class="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
	<div class="flex items-center justify-center py-12">
		<div class="mx-auto grid w-[350px] gap-6">
			<div class="grid gap-2 text-center">
				<h1 class="text-3xl font-bold">Reset Password</h1>
				<p class="text-balance text-muted-foreground">
					Enter the email associated with your account to change your password.
				</p>
			</div>
			<div class="grid gap-2">
				<NewPasswordForm data={data.form} />
			</div>
			<div class="mt-4 text-center text-sm">
				Return to login?
				<a href="/auth/login" class="underline">Login</a>
			</div>
		</div>
	</div>
	<div class="hidden bg-muted lg:block">
		<img
			src=""
			alt="placeholder"
			class="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
		/>
	</div>
</div>