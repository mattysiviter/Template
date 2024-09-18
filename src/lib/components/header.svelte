<script lang="ts">
	import { RiMenuLine, RiAccountCircleFill } from 'svelte-remixicon';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	export let toggleSidebar: () => void;
</script>

<header
	class="box-border flex h-12 transform content-center items-center justify-between bg-green-800 pt-1 transition-all duration-300 ease-in-out"
>
	<div class="flex h-12 w-24 justify-center">
		<button on:click={toggleSidebar}><RiMenuLine size="24" color="white" /></button>
	</div>
	<div class="mr-4">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button builders={[builder]} variant="secondary" size="icon" class="rounded-full">
					<RiAccountCircleFill class="h-5 w-5" />
					<span class="sr-only">Toggle user menu</span>
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Label>My Account</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Item href="/settings/account">Settings</DropdownMenu.Item>
				<DropdownMenu.Item>Support</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item>
					<form action="/auth/logout" method="POST">
						<button>Logout</button>
					</form>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</header>
