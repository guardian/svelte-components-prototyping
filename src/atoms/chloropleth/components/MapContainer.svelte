<!-- src/lib/components/MapContainer.svelte -->
<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { database } from  '$lib/stores/chloro';
  import { get } from 'svelte/store';
  import * as d3 from 'd3';
  import * as topojson from 'topojson-client';

  export let boundaries;
  export let overlay;
  export let basemap;
  export let places;

  const dispatch = createEventDispatcher();

  let mapEl;
  let svgEl;
  let width = 0;
  let height = 0;
  let projection;
  let path;
  let zoom;
  let zoomTransform = d3.zoomIdentity;
  let initialZoomApplied = false;

  // Reactive declarations for map dimensions and projection
  $: if (mapEl && width > 0) {
    const db = get(database);
    height = width < 500 ? width * 0.8 : width * 0.6;
    
    // Use first location coordinates if available, otherwise use defaults
    let centerLat = db.centreLat || -28;
    let centerLon = db.centreLon || 135;
    
    if (db.locations && db.locations.length > 0) {
      const firstLocation = db.locations[0];
      centerLat = +firstLocation.centreLat || centerLat;
      centerLon = +firstLocation.centreLon || centerLon;
    }
    
    projection = d3.geoMercator()
      .center([centerLon, centerLat])
      .scale(width * 0.85)
      .translate([width / 2, height / 2]);

    path = d3.geoPath().projection(projection);
  }

  // Reactive declarations for processing topojson data
  $: basemapFeatures = basemap ? 
    topojson.feature(basemap, basemap.objects[Object.keys(basemap.objects)[0]]).features : 
    [];

  $: boundaryFeatures = boundaries ? 
    topojson.feature(boundaries, boundaries.objects[Object.keys(boundaries.objects)[0]]).features : 
    [];

  function setupZoom() {
    if (!svgEl || !width || !height) return;

    // Create zoom behavior
    zoom = d3.zoom()
      .scaleExtent([0.5, 8]) // Min and max zoom levels
      .on('zoom', handleZoom);

    // Apply zoom behavior to SVG
    d3.select(svgEl).call(zoom);
  }

  // Reactive statement to set up zoom when SVG is ready
  $: if (svgEl && width && height) {
    setupZoom();
  }

  function handleZoom(event) {
    zoomTransform = event.transform;
    // The transform will be applied reactively to the g element
  }

  // Public functions for zoom controls
  export function zoomIn() {
    if (zoom && svgEl) {
      d3.select(svgEl)
        .transition()
        .duration(300)
        .call(zoom.scaleBy, 1.5);
    }
  }

  export function zoomOut() {
    if (zoom && svgEl) {
      d3.select(svgEl)
        .transition()
        .duration(300)
        .call(zoom.scaleBy, 1 / 1.5);
    }
  }

  export function resetZoom() {
    if (zoom && svgEl) {
      d3.select(svgEl)
        .transition()
        .duration(500)
        .call(zoom.transform, d3.zoomIdentity);
    }
  }

  onMount(() => {
    // Set initial width from the container
    width = mapEl.clientWidth;
  });

  // Apply initial zoom after zoom behavior is set up
  $: if (zoom && svgEl && !initialZoomApplied) {
    applyInitialZoomIfNeeded();
  }

  function applyInitialZoomIfNeeded() {
    if (!initialZoomApplied && zoom && svgEl && projection) {
      const db = get(database);
      
      if (db.locations && db.locations.length > 0) {
        const firstLocation = db.locations[0];
        const zoomScale = +firstLocation.zoomScale || db.zoomScale || 1;
        const centerLat = +firstLocation.centreLat || db.centreLat || -28;
        const centerLon = +firstLocation.centreLon || db.centreLon || 135;
        
        if (zoomScale > 1) {
          // Convert lat/lng to pixel coordinates
          const centerPoint = projection([centerLon, centerLat]);
          
          if (centerPoint) {
            // Calculate the transform to center on this point with the desired scale
            const transform = d3.zoomIdentity
              .translate(width / 2, height / 2)
              .scale(zoomScale)
              .translate(-centerPoint[0], -centerPoint[1]);
            
            d3.select(svgEl)
              .call(zoom.transform, transform);
            initialZoomApplied = true;
          }
        }
      }
    }
  }

  // Reactive database access
  $: db = $database;
  $: currentMapping = db.mapping?.[db.currentIndex] || {};
  $: legendValues = currentMapping.values?.split(',') || [];
  $: legendColors = currentMapping.colours?.split(',') || [];
  $: scaleType = (currentMapping.scale || '').toLowerCase();
  $: currentKey = db.currentKey;

  // Reactive color scale
  $: colorScale = scaleType === "threshold" && legendValues.length > 0 && legendColors.length > 0
    ? d3.scaleThreshold().domain(legendValues.slice(1, -1)).range(legendColors)
    : null;

  // Reactive color function
  $: setColour = (feature) => {
    if (colorScale && currentKey && feature.properties && !isNaN(feature.properties[currentKey])) {
      return colorScale(feature.properties[currentKey]);
    }
    return '#eee';
  };

  // Calculate stroke width based on zoom level for consistent visual thickness
  $: baseStrokeWidth = 1; // Base stroke width for boundaries
  $: basemapStrokeWidth = 0.5; // Base stroke width for basemap (thinner)
  $: adjustedBoundaryStrokeWidth = baseStrokeWidth / zoomTransform.k;
  $: adjustedBasemapStrokeWidth = basemapStrokeWidth / zoomTransform.k;
  
</script>

<div bind:this={mapEl} bind:clientWidth={width} class="map">
  {#if width > 0 && height > 0 && path}
    <svg bind:this={svgEl} {width} {height}>
      <g transform={zoomTransform.toString()}>
        <!-- Basemap layer -->
        {#if basemap && basemapFeatures.length > 0}
          <g class="basemap">
            {#each basemapFeatures as feature, i}
              <path
                d={path(feature)}
                fill="#eee"
                stroke="#ccc"
                stroke-width={adjustedBasemapStrokeWidth}
                data-feature-index={i}
              />
            {/each}
          </g>
        {/if}

        <!-- Boundaries layer -->
        {#if boundaries && boundaryFeatures.length > 0}
          <g class="boundaries">
            {#each boundaryFeatures as feature, i}
              <path
                d={path(feature)}
                fill={setColour(feature)}
                stroke="#eee"
                stroke-width={adjustedBoundaryStrokeWidth}
                data-feature-index={i}
              />
            {/each}
          </g>
        {/if}
      </g>
    </svg>
  {:else}
    <div style="padding: 20px; color: #666;">
      Loading map... (width: {width}, height: {height}, path: {path ? 'ready' : 'not ready'})
    </div>
  {/if}
</div>

<style>
  .map {
    width: 100%;
    position: relative;
    cursor: grab;
  }
  
  .map:active {
    cursor: grabbing;
  }
</style>
