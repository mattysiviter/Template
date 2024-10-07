<script lang="ts">
	import { Button } from '$lib/components/ui/button/index';
	import * as Card from '$lib/components/ui/card/index';
	import { Input } from '$lib/components/ui/input/index';
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
</script>

<div class="flex min-h-screen w-full flex-col">
	<main
		class="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10"
	>
		<div class="mx-auto grid w-full max-w-6xl gap-2">
			<h1 class="text-3xl font-semibold">Billing Settings</h1>
			<Breadcrumb.Root>
				<Breadcrumb.List>
					<Breadcrumb.Item>
						<Breadcrumb.Link href="/dashboard">Dashboard</Breadcrumb.Link>
					</Breadcrumb.Item>
					<Breadcrumb.Separator />
					<Breadcrumb.Item>
						<Breadcrumb.Page>Billing Settings</Breadcrumb.Page>
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
				<a href="/settings/billing" class="font-semibold text-primary">Billing</a>
				<a href="/settings/security">Security</a>
			</nav>
			<div class="grid gap-6">
				<Card.Root>
					<Card.Header>
						<Card.Title>Payment Method</Card.Title>
						<Card.Description>Manage your payment details and billing address.</Card.Description>
					</Card.Header>
					<Card.Content>
						<form class="space-y-4">
							<div>
								<label for="card" class="text-sm font-medium">Card Number</label>
								<Input id="card" placeholder="**** **** **** ****" />
							</div>
							<div class="grid grid-cols-2 gap-4">
								<div>
									<label for="expiry" class="text-sm font-medium">Expiry Date</label>
									<Input id="expiry" placeholder="MM/YY" />
								</div>
								<div>
									<label for="cvc" class="text-sm font-medium">CVC</label>
									<Input id="cvc" placeholder="123" />
								</div>
							</div>
						</form>
					</Card.Content>
					<Card.Footer class="border-t px-6 py-4">
						<Button>Update Payment Method</Button>
					</Card.Footer>
				</Card.Root>
			</div>
		</div>
	</main>
</div>
