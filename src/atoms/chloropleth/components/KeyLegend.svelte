<!-- src/lib/components/KeyLegend.svelte -->
<script>
  import { database } from  '$lib/stores/chloro';
  import { get } from 'svelte/store';

  $: db = get(database);
  $: legendValues = db.mapping?.[db.currentIndex]?.values?.split(',') || [];
  $: legendColors = db.mapping?.[db.currentIndex]?.colours?.split(',') || [];
  $: currentLabel = db.mapping?.[db.currentIndex]?.keyText || '';
  
  // Calculate dimensions dynamically
  $: itemWidth = 25;
  $: itemHeight = 15;
  $: itemSpacing = 2;
  $: totalWidth = Math.max(300, (legendValues.length * (itemWidth + itemSpacing)) + 20);
  $: svgHeight = 45;
  
  // Calculate positions for each legend item
  $: legendItems = legendValues.map((value, i) => ({
    value: value.trim(),
    color: legendColors[i]?.trim() || '#ccc',
    x: 10 + (i * (itemWidth + itemSpacing)),
    textX: 10 + (i * (itemWidth + itemSpacing)) + (itemWidth / 2)
  }));
</script>

{#if db.showKey && legendValues.length === legendColors.length && legendValues.length > 0}
  <div class="keyBox">
    <div class="keyText">{currentLabel}</div> 
    <div class="keyContainer">
      <svg width={totalWidth} height={svgHeight} id="keySvg">
        <!-- Color rectangles -->
        {#each legendItems as item, i}
          <rect 
            x={item.x} 
            y="5" 
            width={itemWidth} 
            height={itemHeight} 
            fill={item.color} 
            stroke="#dcdcdc"
            stroke-width="0.5"
          />
        {/each}
        
        <!-- Value labels -->
        {#each legendItems as item, i}
          <text 
            x={item.textX} 
            y={svgHeight - 10} 
            text-anchor="middle" 
            class="keyLabel"
          >
            {item.value}
          </text>
        {/each}
      </svg>
    </div>
  </div>
{/if}

<style>
  .keyBox {
    margin: 15px 0;
    width: 100%;
  }

  .keyText {
    font-family: 'Guardian Text Sans Web', Arial, sans-serif;
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 5px;
    color: #333;
  }

  .keyContainer {
    width: 100%;
    overflow-x: auto;
  }

  .keyLabel {
    font-family: 'Guardian Text Sans Web', Arial, sans-serif;
    font-size: 9px;
    fill: #767676;
  }

  /* Responsive design */
  @media (max-width: 480px) {
    .keyContainer {
      overflow-x: scroll;
    }
  }
</style>
