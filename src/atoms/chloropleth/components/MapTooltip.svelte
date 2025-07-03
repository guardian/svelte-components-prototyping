<script>
  import { tooltipStore } from '$lib/stores/chloro';
  $: tooltip = $tooltipStore;
</script>

{#if tooltip.visible}
  <div
    class="tooltip"
    style="top: {tooltip.y}px; left: {tooltip.x}px"
  >
    {@html tooltip.html}
  </div>
{/if}

<style>
  .tooltip {
    position: absolute;
    z-index: 10;
    background: white;
    border: 1px solid #ccc;
    padding: 0.5em;
    pointer-events: none;
    max-width: 200px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }
</style>
