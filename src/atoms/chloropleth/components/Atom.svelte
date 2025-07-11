<script>
  // Core imports
  import { onMount } from 'svelte'
  import { getJson } from '$lib/helpers/guardian/toolbelt.js';
  import Chloropleth from './Chloropleth.svelte';
  import Logger from './Logger.svelte';

  // Data for the maps.
  let data = $state([]);

  // Component lifecycle
  onMount(async() => {
    const url = `https://interactive.guim.co.uk/docsdata/1PGsDvvo4x9tFw8zfVP3vnfjOMtZBAcxLZNxkRGthZ3A.json`;
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
      boundary={'2025_federal_boundaries'}
      title={'My amazing map headline'}
      subtitle={'Link to <a target="_blank" href="https://docs.google.com/spreadsheets/d/1eFx2S_gpFbC1GzncQgcutPWXbj2cZEgl_dnVPKblGyc/edit?gid=807652696#gid=807652696">boundaries googledoc</a>'}
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
