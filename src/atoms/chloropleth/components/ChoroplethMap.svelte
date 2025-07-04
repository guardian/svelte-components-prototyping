<!-- src/lib/components/ChoroplethMap.svelte -->
<script>
  import { onMount } from 'svelte';
  import { database } from '$lib/stores/chloro';
  import { get } from 'svelte/store';

  import MapContainer from './MapContainer.svelte';
  import DropdownSelect from './DropdownSelect.svelte';
  import KeyLegend from './KeyLegend.svelte';
  import SearchBox from './SearchBox.svelte';
  import ZoomControls from './ZoomControls.svelte';
  import MapTooltip from './MapTooltip.svelte';

  let db;

  $: db = $database;

  export let data;
  export let boundaries;
  export let overlay;
  export let basemap;
  export let places;
  export let key;
  export let codes;
  export let place;

  let mapContainer;

  onMount(() => {
    database.set({
      ...data,
      codes: codes
    });
  });

</script>

<div class="map__wrapper">


  {#if db.title}
    <div class="choloropleth_title_block">
      <div class='chartTitle'>{db.title}</div>
      <div class='subTitle'>{@html db.subtitle}</div>
    </div>
  {/if}

  <div id="controls">
    {#if db.dropdown}
      <DropdownSelect bind:selectedIndex={db.currentIndex} options={db.mapping} label="Currently showing" />
    {/if}

    {#if db.relocate}
      <DropdownSelect bind:selectedIndex={db.locationIndex} options={db.locations} label="Zoom to" />
    {/if}
  </div>

  {#if db.displaySearch}
    <SearchBox {mapContainer} />
  {/if}

  {#if db.showKey}
    <KeyLegend />
  {/if}

  <div id="mapContainer">
    <ZoomControls {mapContainer} />
    <MapContainer bind:this={mapContainer} {boundaries} {overlay} {basemap} {places} />
    <!--MapTooltip /-->
  </div>

  {#if db.footnote}
    <div class="notes"><div>{@html db.footnote}</div></div>
  {/if}

  {#if db.source}
    <div class="notes"><small>Source: {@html db.source}</small></div>
  {/if}

  {#if db.version}
    <div class="notes"><small>{db.version}</small></div>
  {/if}

</div>

<style lang="scss">

  #mapContainer {
    position: relative;
  }

  .choloropleth_title_block {
    margin-bottom: 10px;
    width: 100%;
  }

  .chartTitle {
    font-size: 20px;
    line-height: 28px;
    font-weight: 600;
    -webkit-font-smoothing: antialiased;
    color: #333333;
    font-family: "GH Guardian Headline", Georgia, serif;
    margin-bottom: 2px;
  }

  .subTitle {
    font-size: 16px;
    line-height: 20px;
    color: #333333;
    font-family: "Guardian Egyptian Web", Georgia, serif;
  }

  .notes {
    font-family: 'Guardian Text Sans Web',Arial;
    font-size:11px;
    color:#767676;
  }
</style>