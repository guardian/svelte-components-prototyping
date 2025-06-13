<script>
    export let label = "Read more";
    export let colour = "#ffe500";
    export let background = "#121212";
    export let onClick = () => {};

    let width = 0
</script>
  
<button class="guardian-button button-sm" on:click={onClick} style="background-color: {background}; width: {width + 15}px;">
    <div class="_button_wrap" bind:clientWidth={width}>
        <div class="label" style="color:{colour}">{label}</div>
        <div class="icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="{colour}" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M.033 10.823h16.575l-6.5 7.779.845.845 9.035-9.057v-.867L10.953.467l-.845.845 6.5 7.778H.033v1.733z" fill={colour} />
        </svg>
        </div>
    </div>
</button>
  
<style lang="scss">
    .guardian-button {
        padding: 0 5px;
        border: none;
        border-radius: 36px;
        margin-top: 12px;
        height: 36px;
        cursor: pointer;

        div {
            float: left;
        }

        svg {
            //rotate: 90deg;
        }

        ._button_wrap {
            display: flex;
            align-items: center;
            height: 100%;
            padding: 0 5px;
        }
        
        .label {
            display: flex;
            vertical-align: middle;
            font-family: var(--text-sans);
            font-size: var(--sans-small);
            line-height: var(--sans-line-height);
            font-weight: 700;
            padding: 0 4px;
        }
        
        .icon {
            display: flex;
        }
        
        &.button-md {
            height: 44px;
            padding: 0 12px;
        }
        
    }
</style>
  