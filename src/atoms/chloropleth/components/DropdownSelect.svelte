<!-- src/lib/components/DropdownSelect.svelte -->
<script>
  import { database } from '$lib/stores/chloro';
  export let selectedIndex;
  export let options = [];
  export let label = '';
  export let changeType = '';
  export let mapContainer = '';

  function handleChange(event) {
    selectedIndex = +event.target.value;
    let target = options[selectedIndex];
    if (changeType === 'changeData') {
      database.update(d => {
        d.currentIndex = selectedIndex;
        d.currentKey = target.data || null;
        return d;
      });
    } else if (changeType === 'changeLocation') {
      mapContainer.zoomToLocation(+target.centreLat, +target.centreLon, +target.zoomScale);
    }
  }
</script>

<div class="dropdown">
  <label>{label}</label>
  <select on:change={handleChange} bind:value={selectedIndex}>
    {#each options as opt, i}
      <option value={i}>{opt.display}</option>
    {/each}
  </select>
</div>

<style>
  .dropdown {
    margin-bottom: 5px;
    width: 100%;
  }
  
  label {
    font-family: 'Guardian Text Sans Web', Arial, sans-serif;
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 10px;
    color: #333;
  }
  
  select {
    padding: 0.4em;
    margin-top: 5px;
    width: 100%;
  }
</style>
