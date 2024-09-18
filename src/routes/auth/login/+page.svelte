<script lang="ts">
	import type { PageData } from './$types.js';
	import LoginForm from '$lib/components/login-form.svelte';
	export let data: PageData;
</script>

<div class="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
	<div class="flex items-center justify-center py-12">
		<div class="mx-auto grid w-[350px] gap-6">
			<div class="grid gap-2 text-center">
				<h1 class="text-3xl font-bold">Login</h1>
				<p class="text-balance text-muted-foreground">
					Enter your email below to login to your account
				</p>
			</div>
			<div class="grid gap-4">
				<LoginForm data={data.form} />
			</div>
			<div class="mt-4 text-center text-sm">
				Don&apos;t have an account?
				<a href="/auth/sign-up" class="underline"> Sign up </a>
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
