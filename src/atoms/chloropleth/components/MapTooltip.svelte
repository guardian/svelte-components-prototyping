<script>
  import { tooltipStore } from '$lib/stores/chloro';
  $: tooltip = $tooltipStore;

  function closeTooltip() {
    tooltipStore.update(t => {
      t.visible = false;
      t.touch = false;
      return t;
    });
  }
</script>

{#if tooltip.visible}
  <div
    class="tooltip"
    class:touch-enabled={tooltip.touch}
    style="top: {tooltip.y}px; left: {tooltip.x}px"
  >
    {#if tooltip.touch}
      <button 
        class="close-button"
        on:click={closeTooltip}
        aria-label="Close tooltip"
        title="Close"
      >
        ×
      </button>
    {/if}
    
    <div class="tooltip-content">
      {@html tooltip.html}
    </div>
  </div>
{/if}

<style>
  .tooltip {
    position: fixed;
    z-index: 1000;
    background: white;
    border: 1px solid #ccc;
    padding: 0.5em;
    pointer-events: none;
    max-width: 200px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    font-size: 14px;
    border-radius: 4px;
  }

  .tooltip.touch-enabled {
    pointer-events: auto;
    padding: 0.5em 1.5em 0.5em 0.5em; /* Extra padding on right for close button */
  }

  .close-button {
    position: absolute;
    top: 2px;
    right: 2px;
    background: none;
    border: none;
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    color: #666;
    padding: 2px 4px;
    border-radius: 2px;
    transition: all 0.2s ease;
    z-index: 1001;
  }

  .close-button:hover {
    background: #f0f0f0;
    color: #333;
  }

  .close-button:active {
    background: #e0e0e0;
  }

  .tooltip-content {
    position: relative;
  }
</style>
