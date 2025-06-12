<script>
    let { 
      id = "",
      layout = "default",
      borderTop = false,
      backgroundColor = "transparent",
      styles = {
        section: "_section_1xpz0_39",
        borderTop: "_borderTop_1xpz0_9", 
        header: "_header_1xpz0_150",
        content: "_content_1xpz0_187",
        default: "",
        fullWidth: "_fullWidth_1xpz0_39"
      }
    } = $props();
  
    let headerEl;
    let minHeight = $state("auto");
  
    function measureHeader() {
      if (headerEl) {
        minHeight = headerEl.offsetHeight + "px";
      }
    }
  
    $effect(() => {
      measureHeader();
    });
</script>
  
<section
    {id}
    class="{styles.section} {styles[layout]}"
    style="background-color: {backgroundColor}; min-height: {minHeight};"
>
    {#if borderTop}
      <div class={styles.borderTop}></div>
    {/if}
  
    <!-- Header slot -->
    <div class="{styles.header} {styles[layout]}" bind:this={headerEl}>
      <slot name="header" />
    </div>
  
    <!-- Content slot -->
    <div class="{styles.content} {styles[layout]}">
      <slot name="content" />
    </div>
</section>
  