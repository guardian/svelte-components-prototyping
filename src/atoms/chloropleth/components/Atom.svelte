<script>
  // Core imports
  import { onMount } from 'svelte'
  import { getJson } from '$lib/helpers/guardian/toolbelt.js';
  import Chloropleth from './Chloropleth.svelte';
  import Logger from '$lib/components/guardian/Logger.svelte';

  // Data for the maps.
  let data = $state([]);

  // Component lifecycle
  onMount(async() => {
    const url = `https://interactive.guim.co.uk/docsdata/1to_mCAULU5VxjkgEIRRGvVapcjDu0trb77xNnOVXCN4.json`;
    const json = await getJson(url);
    let keys = Object.keys(json.sheets);
    data = json.sheets[keys[0]];
  })

</script>

<div class="atom">

  <Logger testing={false} />

  {#if data.length > 0}
    <Chloropleth 
      {data}
      boundary={'sa3'}
      title={'My amazing map headline'}
      subtitle={''}
      footnote={''}
      source={'The Guardian'}
    />
  {:else}
    <h1>No data</h1>
  {/if}
</div>

<style lang="scss">

  .atom {
    width:100%;
    position: relative;
  }

  h2 {
    @include f-headline();
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
  }
</style>
