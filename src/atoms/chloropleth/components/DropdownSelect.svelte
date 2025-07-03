<!-- src/lib/components/DropdownSelect.svelte -->
<script>
  export let selectedIndex;
  export let options = [];
  export let label = '';

  function handleChange(event) {
    selectedIndex = +event.target.value;
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
    margin-bottom: 1em;
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
