<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';

	interface Option {
		value: string;
		label: string;
		icon: any; // You might want to use a more specific type here if possible
		bgColor: string;
	}

	export let options: Option[] = [];
	export let placeholder: string = 'Select a platform';
	export let selectedOption: Option | null = null;

	let isOpen: boolean = false;
	let dropdownRef: HTMLDivElement;
	const dispatch = createEventDispatcher<{ select: Option }>();

	function toggleDropdown(): void {
		isOpen = !isOpen;
	}

	function selectOption(option: Option): void {
		selectedOption = option;
		isOpen = false;
		dispatch('select', option);
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter' || event.key === ' ') {
			toggleDropdown();
		} else if (event.key === 'Escape' && isOpen) {
			isOpen = false;
		} else if (isOpen && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
			event.preventDefault();
			const currentIndex = options.indexOf(selectedOption!);
			const newIndex =
				event.key === 'ArrowDown'
					? (currentIndex + 1) % options.length
					: (currentIndex - 1 + options.length) % options.length;
			selectOption(options[newIndex]);
		}
	}

	function getBackground(bgColor: string): string {
		return bgColor.includes('gradient')
			? `background: ${bgColor};`
			: `background-color: ${bgColor};`;
	}
</script>

<div class="relative w-[200px]" bind:this={dropdownRef}>
	<button
		type="button"
		on:click={toggleDropdown}
		on:keydown={handleKeydown}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
		class="flex w-full items-center justify-between rounded-md border border-white px-4 py-2 text-left text-white focus:outline-none focus:ring-2 focus:ring-white"
		style={selectedOption ? getBackground(selectedOption.bgColor) : 'background-color: black;'}
	>
		{#if selectedOption}
			<div class="flex items-center">
				<svelte:component this={selectedOption.icon} class="mr-2 h-5 w-5" />
				<span>{selectedOption.label}</span>
			</div>
		{:else}
			<span>{placeholder}</span>
		{/if}
		<span class="ml-2" aria-hidden="true">▼</span>
	</button>

	{#if isOpen}
		<ul
			transition:fade
			role="listbox"
			tabindex="-1"
			class="absolute z-10 mt-1 max-h-60 w-full overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg"
		>
			{#each options as option}
				<li
					role="option"
					aria-selected={option === selectedOption}
					on:click={() => selectOption(option)}
					on:keydown={(e) => e.key === 'Enter' && selectOption(option)}
					tabindex="0"
					class="cursor-pointer hover:opacity-90 focus:bg-opacity-80 focus:outline-none"
				>
					<div
						class="flex h-[40px] w-full flex-row items-center justify-start pl-4 text-white"
						style={getBackground(option.bgColor)}
					>
						<svelte:component this={option.icon} class="mr-2 h-5 w-5" />
						<span>{option.label}</span>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
