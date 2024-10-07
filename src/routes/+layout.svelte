<script context="module">
	import '../app.css';
	// @ts-ignore
	import { Toaster, toast } from 'svelte-sonner';

	export { toast };
</script>

<Toaster />
<slot></slot>
