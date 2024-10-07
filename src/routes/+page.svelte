<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import { writable, type Writable } from 'svelte/store';

	const isChecked: Writable<boolean> = writable(false);

	function handleCheckedChange(checked: boolean | 'indeterminate') {
		if (typeof checked === 'boolean') {
			isChecked.set(checked);
		}
	}
</script>

<div class="flex items-center space-x-2">
	<Dialog>
		<DialogTrigger>
			<div class="flex items-center space-x-2">
				<Checkbox id="terms" checked={$isChecked} />
				<Label
					for="terms"
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					Open Dialog
				</Label>
			</div>
		</DialogTrigger>
		<DialogContent class="sm:max-w-[425px]">
			<DialogHeader>
				<DialogTitle>Dialog Title</DialogTitle>
				<DialogDescription
					>This is a dialog triggered by a checkbox. You can add any content here.</DialogDescription
				>
			</DialogHeader>
			<div class="py-4">
				<p>
					Dialog content goes here. You can add forms, buttons, or any other components as needed.
				</p>
			</div>
		</DialogContent>
	</Dialog>
</div>
