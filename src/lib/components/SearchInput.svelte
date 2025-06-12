<script>
  import { onMount } from 'svelte';
  import SearchIcon from '$lib/components/SearchIcon.svelte';
  import CloseButton from '$lib/components/CloseButton.svelte';

  // Props (with defaults where applicable)
  export let placeholder = "";
  export let inputValue = "";
  export let maxSuggestions = 5;
  export let onInputChange = async (val) => [];
  // Note: onSubmit now expects to receive either a suggestion object (if available)
  // or false if there are no matching items.
  export let onSubmit = (val) => {};
  export let onSelect = (suggestion) => {};
  export let onClear = () => {};
  export let onFocus = () => {};
  export let styles = {
    searchContainer: "_searchContainer_1kj0x_1",
    input: "_input_1kj0x_5",
    searchIcon: "_searchIcon_1kj0x_27",
    clearButton: "_clearButton_1kj0x_36",
    suggestions: "_suggestions_1kj0x_42",
    suggestion: "_suggestion_1kj0x_42",
    selected: "_selected_1kj0x_73",
    highlighted: "_highlighted_1kj0x_77"
  };

  // Local state
  let value = inputValue;
  let selectedIndex = -1;
  let suggestions = [];
  let showSuggestions = true;
  let inputRef;

  async function inputChanged(newValue) {
    value = newValue;
    let sugg = await onInputChange(newValue);
    suggestions = sugg ? sugg.slice(0, maxSuggestions) : [];
    selectedIndex = -1;
    if (newValue.trim() !== "") {
      showSuggestions = true;
    }
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      // Update onSubmit behavior:
      // If any suggestions exist, return the first item in the array,
      // otherwise, return false.
      if (suggestions.length > 0) {
        onSubmit(suggestions[selectedIndex] || suggestions[0]);
        handleClear();
      } else {
        onSubmit(false);
        handleClear();
      }
    }
  }

  function onSelectSuggestion(suggestion) {
    onSelect(suggestion);
    value = suggestion.text;
    inputRef.blur();
  }

  function handleClear() {
    console.log("Clearing search input");
    showSuggestions = false;
    value = "";

    inputChanged("");
    inputRef.focus();
    onClear();
  }

  function handleBlur() {
    showSuggestions = false;
  }

  function handleFocus(event) {
    event.target.select();
    showSuggestions = true;
  }

  // Compute whether to show the clear button
  $: showClearButton = value && value !== "";
</script>

<div class={styles.searchContainer}>
  <input
    name="search"
    placeholder={placeholder}
    bind:this={inputRef}
    type="text"
    aria-label="Search input"
    bind:value
    on:keydown={handleKeyDown}
    on:input={(e) => inputChanged(e.target.value)}
    on:blur={handleBlur}
    on:focus={handleFocus}
    class={styles.input}
  />
  <div class={styles.searchIcon}>
    <SearchIcon />
  </div>
  {#if showClearButton}
    <div class={styles.clearButton}>
      <CloseButton border={false} on:close={handleClear} />
    </div>
  {/if}
  {#if showSuggestions && suggestions.length}
    <ul class={styles.suggestions} aria-label="Search suggestions">
      {#each suggestions as suggestion, index}
        <li
          aria-label={suggestion.text}
          class="{styles.suggestion} {index === selectedIndex ? styles.selected : ''}"
          on:mousedown|preventDefault
          on:mouseover={() => { selectedIndex = index; }}
          on:click={() => onSelectSuggestion(suggestion)}
          style={`${index === selectedIndex ? 'background-color: var(--highlight-color);' : ''}`}
        >
          {#each suggestion.text.split(new RegExp(`(${value})`, "ig")) as part, i}
            {#if i % 2 === 1}
              <span class={styles.highlighted}>{part}</span>
            {:else}
              {part}
            {/if}
          {/each}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>

</style>
