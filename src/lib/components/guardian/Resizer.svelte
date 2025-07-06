<script>
	import { onMount } from 'svelte';

	function updateParentVarFromArticleBackground() {
		const root = window.parent.document.documentElement;
		const articleBg = getComputedStyle(root).getPropertyValue('--article-background').trim();
		root.style.setProperty('--interactive-atom-background', articleBg);
	}

	onMount(() => {
		if (window.self !== window.top) {
			setTimeout(() => {
				if (window.resize) {
					const html = document.querySelector("html");
					const body = document.querySelector("body");

					html.style.overflow = "hidden";
					html.style.margin = "0px";
					html.style.padding = "0px";

					body.style.overflow = "hidden";
					body.style.margin = "0px";
					body.style.padding = "0px";

					window.resize();
				}
			}, 100);

			const parentRoot = window.parent.document.documentElement;

			updateParentVarFromArticleBackground();

			const observer = new window.parent.MutationObserver(() => {
				updateParentVarFromArticleBackground();
			});

			observer.observe(parentRoot, {
				attributes: true,
				attributeFilter: ['style']
			});
		}

		/*
		window.parent.postMessage({
			sentinel: 'amp',
			type: 'embed-size',
			height: document.body.scrollHeight
		}, '*');
		*/
	});
</script>