
<script>
  import { onMount } from 'svelte'
  import PageSection from "$lib/components/PageSection.svelte";

  //import {getExampleData, exampledata} from '$lib/stores/example.svelte.js';
  //import Scrolly from '$lib/components/Scrolly.svelte'
  const fullWidthStyles = {
    section: "_section_1xpz0_39",
    borderTop: "_borderTop_1xpz0_9",
    header: "_header",
    content: "_content_1xpz0_187",
    default: "",
    fullWidth: "_fullWidth_1xpz0_39",
  };

onMount(async() =>{
  // await getExampleData()
  // setInterval(async () => {
  //   await getExampleData()
  // }, 60000)

})
  let { name } = $props()


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
