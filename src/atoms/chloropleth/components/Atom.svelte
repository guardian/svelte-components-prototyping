<script>
  // Core imports
  import { onMount } from 'svelte'
  import { getJson } from '$lib/helpers/guardian/toolbelt.js';
  import Chloropleth from './Chloropleth.svelte';

  

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

</script>


<div class="atom">

      <Chloropleth 

      />

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
