<script>
  // Core imports
  import { onMount } from 'svelte'
  import PageSection from "$lib/components/PageSection.svelte";
  import SearchInput from '$lib/components/SearchInput.svelte';
  import { getJson, autocomplete } from '$lib/helpers/toolbelt.js';

  //import {getExampleData, exampledata} from '$lib/stores/example.svelte.js';
  //import Scrolly from '$lib/components/Scrolly.svelte'
  

  // Component props
  let { name } = $props()

  // Component lifecycle
  onMount(async() => {
    // Example data fetching (currently disabled)
    // await getExampleData()
    // setInterval(async () => {
    //   await getExampleData()
    // }, 60000)
  })

  // Search state
  let inputValue = "";

  // Search configuration
  const searchOptions = ["Andy", "Barb", "Baz", "Bazza", "Bazzaa"];

  // Search event handlers
  async function searchInputChanged(val) {
    const searchResults = await autocomplete(val, searchOptions);
    return searchResults.slice(0, 5); // Limit to 5 suggestions
  }

  function onSubmit(val) {
    if (val?.text) {
      selectSuggestion(val);
    }
  }

  function selectSuggestion(suggestion) {
    inputValue = suggestion.text;
  }

  function onClear() {
    inputValue = "";
  }

  function onFocus() {
    console.log("Input focused");
  }

  // Component styles
  const fullWidthStyles = {
    section: "_section_1xpz0_39",
    borderTop: "_borderTop_1xpz0_9",
    header: "_header",
    content: "_content_1xpz0_187",
    default: "",
    fullWidth: "_fullWidth_1xpz0_39",
  };

  // Search input styles
  const searchStyles = {
    searchContainer: "_searchContainer_1kj0x_1",
    input: "_input_1kj0x_5",
    searchIcon: "_searchIcon_1kj0x_27",
    clearButton: "_clearButton_1kj0x_36",
    suggestions: "_suggestions_1kj0x_42",
    suggestion: "_suggestion_1kj0x_42",
    selected: "_selected_6u92g_85",
    highlighted: "_highlighted_1kj0x_77"
  };
</script>


<div class="atom">

  <!-- Deault layout -->
  <PageSection
    id="national-results"
    layout="default"
    backgroundColor="var(--primary-bg-color)"
    borderTop={true}
  >
    <div slot="header">
      <h2>Headline</h2>
    </div>
    <div slot="content">
      <!-- Drop your componet here  -->
    </div>
  </PageSection>

  <!-- Full width section -->
  <PageSection
    id="map-section"
    layout="fullWidth"
    backgroundColor="var(--base-map)"
    borderTop={true}
    styles={fullWidthStyles}
  >
    <div slot="content" class="_content_yckna_51" style="position:relative;">
      <!-- Drop your componet here  -->

      <div class="_overlay_search">
        <div class="_search_yckna_47">
          <SearchInput
            placeholder="Search for something..."
            {inputValue}
            onInputChange={searchInputChanged}
            onSubmit={onSubmit}
            onSelect={selectSuggestion}
            onClear={onClear}
            {onFocus}
            styles={searchStyles}
          />
        </div>
      </div>

    </div>
  </PageSection>

  <!-- {#if exampledata.animals}
  {#each exampledata.animals as animal}
  <p>The {animal.animal} is {animal.size} and has {animal.legCount} legs.</p>
  {/each}
  {/if} -->

  <!-- <Scrolly></Scrolly> -->
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
