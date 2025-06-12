<script>
    import { createEventDispatcher } from 'svelte';
  
    export let checked = false;
    export let label1 = 'By 2PP';
    export let label2 = 'By 2CP';
  
    export let sliderColor = '#8b0000'; // default background color
    export let sliderCheckedColor = '#880c0c'; // background when checked
    export let thumbColor = 'red'; // thumb color
  
    const dispatch = createEventDispatcher();
  
    function handleChange(event) {
      dispatch('change', event.target.checked);
    }
  </script>
  
  
  <div
  class="switch-container"
  style="
    --slider-color: {sliderColor};
    --slider-checked-color: {sliderCheckedColor};
    --thumb-color: {thumbColor};
  ">
  <div class="switch-label">{label1}</div>
  <div class="switch-box">
    <label class="switch">
      <input type="checkbox" bind:checked={checked} on:change={handleChange} />
      <span class="slider round"></span>
    </label>
  </div>
  <div class="switch-label">{label2}</div>
</div>
  
<style lang="scss">

.switch-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-family: 'Guardian Text Sans Web', 'Agate Sans', sans-serif;
  font-size: 12px;
  color: #000;

  .switch-label {
    flex: 1;
    height: 50px;
    line-height: 50px;
    padding: 0 10px;

    &:first-child {
      text-align: right;
    }

    &:last-child {
      text-align: left;
    }
  }

  .switch-box {
    width: 60px;
    height: 50px;
    padding-top: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;

    input {
      display: none;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--slider-color, #8b0000);
      transition: 0.4s;
      border-radius: 34px;

      &::before {
        content: '';
        position: absolute;
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: var(--thumb-color, red);
        transition: 0.4s;
        border-radius: 50%;
      }
    }

    input:checked + .slider {
      background-color: var(--slider-checked-color, #880c0c);
    }

    input:checked + .slider::before {
      transform: translateX(26px);
    }

    input:focus + .slider {
      box-shadow: 0 0 1px var(--slider-checked-color, #880c0c);
    }
  }
}


  </style>
  