<script context="module">
	import '../app.css';
	import toast, { Toaster } from 'svelte-french-toast';

	// Exporting a custom error toast function
	/**
	 * @param {import("svelte-french-toast").Renderable} message
	 */
	export function errorToast(message) {
		// Dismiss any existing toasts
		toast.dismiss();

		// Show the new error toast
		toast.error(message, {
			duration: 2000
		});
	}

	export { toast };
</script>

<Toaster />
<slot></slot>
