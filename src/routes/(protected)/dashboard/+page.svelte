<script>
	import DashboardCard from '$lib/components/dashboard-card.svelte';
	import { RiDownload2Fill, RiTerminalWindowFill, RiEraserFill } from 'svelte-remixicon';
</script>

<div
	class="container mx-auto box-border flex min-h-screen flex-1 flex-col gap-4 bg-gray-800 p-4 sm:p-8"
>
	<h1 class="font-crang text-3xl text-white sm:text-4xl">Tool Suite</h1>
	<h2 class="text-lg text-white sm:text-xl md:text-2xl">
		Your Digital Tool Suite: Download, Scrape, and Automate the Web
	</h2>
	<div
		class="flex flex-shrink cursor-pointer flex-col items-center gap-4 sm:flex-row sm:items-start"
	>
		<DashboardCard
			link="/download"
			content="Downloader"
			description="Download Videos from Various Social Media Sites"
			icon={RiDownload2Fill}
		/>
		<DashboardCard
			link="/scraper"
			content="Account Scraper"
			description="Scrape Content from Social Media Accounts"
			icon={RiTerminalWindowFill}
		/>
		<DashboardCard
			link="/scrub-metadata"
			content="Scrub Video Metadata"
			description="Scrub Metadata from your videos"
			icon={RiEraserFill}
		/>
	</div>
</div>
