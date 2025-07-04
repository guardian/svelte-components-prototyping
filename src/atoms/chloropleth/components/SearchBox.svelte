<!-- src/lib/components/SearchBox.svelte -->
<script>
  import { database } from  '$lib/stores/chloro';

  export let mapContainer = null;

  $: db = $database;

  /**
   * Filters items by a query string, matching the given key.
   * @param {string} query - The search string.
   * @param {Array} data - The dataset to search.
   * @param {string} key - The key to match in each object.
   * @returns {Array} Filtered array.
   */
  function autocomplete(query, data, key = 'meta') {
    const q = query.toLowerCase();
    return data.filter(item => {
      const value = item[key] || '';
      return value.toLowerCase().includes(q);
    }).slice(0, 10); // Limit results
  }

  /**
   * Converts large numbers to a nice readable format.
   * @param {number|string} num - The number to format.
   * @returns {string} Formatted number.
   */
  function niceNumber(num) {
    const n = parseFloat(num);
    if (isNaN(n)) return num;

    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'bn';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'm';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';

    return n % 1 === 0 ? n.toString() : n.toFixed(2);
  }

  function handleInput(e) {
    const query = e.target.value;
    database.update(d => {
      d.searchBlock = query;
      d.displayOverlay = query.length > 2;
      d.autocompleteArray = query.length > 2 && d.codes ? autocomplete(query, d.codes, 'meta') : [];
      return d;
    });
  }

  function handleSelect(item) {
    // Clear the search input and dropdown
    database.update(d => {
      d.searchBlock = '';
      d.autocompleteArray = [];
      d.displayOverlay = false;
      return d;
    });

    // Zoom to the selected location
    if (mapContainer) {
      // Try different possible field names for latitude and longitude
      const lat = item.lat || item.latitude || item.centreLat;
      const lng = item.lon || item.lng || item.longitude || item.centreLon;
      const postcode = item.postcode || item.postal_code || item.zip;
      
      if (lat && lng) {
        // Use postcode-based zoom if available, otherwise fall back to coordinate zoom
        if (postcode && mapContainer.zoomToPostcode) {
          mapContainer.zoomToPostcode(postcode, lat, lng);
        } else if (mapContainer.zoomToLocation) {
          mapContainer.zoomToLocation(lat, lng, 4);
        }
      }
    }
  }
</script>

<div class="search__container">
  <input
    class="search__input"
    type="text"
    placeholder="Enter a postcode"
    bind:value={db.searchBlock}
    on:input={handleInput}
    autocomplete="off"
  />
  {#if db.autocompleteArray.length > 0}
    <div class="search__dropdown">
      {#each db.autocompleteArray as item}
        <div class="search__item" on:click={() => handleSelect(item)}>
          {item.postcode} | {item.place_name}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .search__container {
    margin-top: 1em;
  }
  .search__input {
    width: 100%;
    padding: 0.5em;
    font-size: 1em;
  }
  .search__dropdown {
    background: white;
    border: 1px solid #ccc;
    margin-top: 0.2em;
    max-height: 200px;
    overflow-y: auto;
  }
  .search__item {
    padding: 0.5em;
    cursor: pointer;
  }
  .search__item:hover {
    background: #f0f0f0;
  }
</style>
