<script lang="ts">
	import {
		RiDiscordFill,
		RiDashboardLine,
		RiHistoryLine,
		RiDownload2Line,
		RiTwitterXFill,
		RiInstagramFill
	} from 'svelte-remixicon';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { slide } from 'svelte/transition';
	import { page } from '$app/stores';

	export let isOpen: boolean = true;

	$: currentPath = $page.url.pathname;
</script>

<div
	class={`fixed z-30 box-border flex h-screen transform flex-col items-center bg-green-800 text-white transition-all duration-300 ease-in-out sm:relative ${
		isOpen
			? 'w-52 min-w-[208px] translate-x-0 items-center'
			: 'w-52 -translate-x-full sm:w-24 sm:min-w-[96px] sm:translate-x-0'
	}`}
>
	<ul class="mt-8 flex flex-col gap-6 text-xl">
		<li>
			<a
				href="/dashboard"
				class="flex items-start gap-2 hover:text-gray-500 {currentPath === '/dashboard'
					? 'text-white'
					: 'text-gray-400'}"
			>
				<RiDashboardLine class="h-6 w-6" />
				{#if isOpen}
					<span transition:slide={{ duration: 100 }} class="overflow-hidden whitespace-nowrap">
						Dashboard
					</span>
				{/if}
			</a>
		</li>
		<li>
			<a
				href="/download"
				class="flex gap-2 hover:text-gray-500 {currentPath === '/download'
					? 'text-white'
					: 'text-gray-400'}"
			>
				<RiDownload2Line class="h-6 w-6" />
				{#if isOpen}
					<span transition:slide={{ duration: 100 }} class="overflow-hidden whitespace-nowrap">
						Downloader
					</span>
				{/if}
			</a>
		</li>
		<li>
			<a
				href="/history"
				class="flex cursor-pointer gap-2 hover:text-gray-500 {currentPath === '/history'
					? 'text-white'
					: 'text-gray-400'}"
			>
				<RiHistoryLine class="h-6 w-6" />
				{#if isOpen}
					<span transition:slide={{ duration: 100 }} class="overflow-hidden whitespace-nowrap">
						History
					</span>
				{/if}
			</a>
		</li>
	</ul>

	{#if isOpen}
		<div class="mb-16 mt-auto box-border flex w-full flex-col gap-6">
			<div class="m-auto flex flex-col items-center gap-6">
				<div class="flex items-center space-x-2">
					<Switch id="dark-mode" />
					<Label for="dark-mode">Dark Mode</Label>
				</div>
				<form action="/auth/logout" method="POST">
					<Button variant="destructive" type="submit">Logout</Button>
				</form>
			</div>
			<div class="box-border flex w-full flex-col gap-2">
				<hr class="h-px border-0 bg-gray-200 dark:bg-gray-700" />
				<div class="flex h-8 flex-row items-center justify-center gap-2">
					<RiTwitterXFill class="h-5 w-5" />
					<RiDiscordFill class="h-6 w-6" />
					<RiInstagramFill class="h-5 w-5" />
				</div>
			</div>
		</div>
	{/if}
</div>
