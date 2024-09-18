<script lang="ts">
	import DropdownMenu from '$lib/components/Dropdown.svelte';
	import { RiTwitterXFill, RiYoutubeFill, RiInstagramFill, RiTiktokFill } from 'svelte-remixicon';

	interface SocialMediaOption {
		value: string;
		label: string;
		icon: any; // You might want to use a more specific type here if possible
		bgColor: string;
	}

	const socialMediaOptions: SocialMediaOption[] = [
		{ value: 'youtube', label: 'Youtube', icon: RiYoutubeFill, bgColor: '#FF0000' },
		{ value: 'twitter', label: 'Twitter', icon: RiTwitterXFill, bgColor: '#000000' },
		{
			value: 'instagram',
			label: 'Instagram',
			icon: RiInstagramFill,
			bgColor: 'linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)'
		},
		{ value: 'tiktok', label: 'TikTok', icon: RiTiktokFill, bgColor: '#FE2C55' }
	];

	let selectedPlatform: SocialMediaOption = socialMediaOptions[0]; // Pre-select YouTube

	function handleSelect(event: CustomEvent<SocialMediaOption>) {
		selectedPlatform = event.detail;
		console.log('Selected platform:', selectedPlatform);
	}
</script>

<div class="container mx-auto min-h-screen bg-gray-800 p-4">
	<h1 class="mb-4 text-2xl font-bold text-white">Download Page</h1>

	<div class="mb-4">
		<h2 class="mb-2 text-xl text-white">Select a Social Media Platform</h2>
		<DropdownMenu
			options={socialMediaOptions}
			on:select={handleSelect}
			bind:selectedOption={selectedPlatform}
		/>
	</div>

	{#if selectedPlatform && selectedPlatform.value === 'instagram'}
		<div class="mt-4 text-white">
			<p>Reels and Video</p>
		</div>
	{/if}

	{#if selectedPlatform && selectedPlatform.value === 'twitter'}
		<div class="mt-4 text-white">
			<p>Tweets and Threads</p>
		</div>
	{:else if selectedPlatform && selectedPlatform.value === 'facebook'}
		<div class="mt-4 text-white">
			<p>Posts and Stories</p>
		</div>
	{:else if selectedPlatform && selectedPlatform.value === 'linkedin'}
		<div class="mt-4 text-white">
			<p>Articles and Updates</p>
		</div>
	{/if}
</div>
