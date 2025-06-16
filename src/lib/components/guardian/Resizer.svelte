<script>
	import { onMount } from 'svelte';

	/** @type {string} - The selector for the atom element to resize */
	export let atomName;

	/**
	 * Detects height changes of an element and calls a callback when changes occur
	 * @param {HTMLElement} element - The element to watch
	 * @param {() => void} callback - Function to call when height changes
	 */
	function onElementHeightChange(element, callback) {
		let lastHeight = element.clientHeight;
		
		function run() {
			const newHeight = element.clientHeight;
			if (lastHeight !== newHeight) {
				callback();
				lastHeight = newHeight;
			}

			if (element.onElementHeightChangeTimer) {
				clearTimeout(element.onElementHeightChangeTimer);
			}
			element.onElementHeightChangeTimer = setTimeout(run, 200);
		}

		run();
	}

	onMount(() => {
		if (!window.frameElement) return;

		const target = document.querySelector(atomName);
		if (!target) {
			console.warn(`Resizer: Could not find element with selector "${atomName}"`);
			return;
		}

		// Post message to parent window to adjust the height
		window.parent.postMessage({
			sentinel: 'amp',
			type: 'embed-size',
			height: document.body.scrollHeight
		}, '*');

		// Hide the overflow to avoid scrollbars
		document.body.style.overflow = 'hidden';

		// Set the initial height of the iframe
		window.frameElement.height = target.offsetHeight;

		// Watch for changes in the target's height
		onElementHeightChange(target, () => {
			window.frameElement.height = target.offsetHeight;
		});
	});
</script>