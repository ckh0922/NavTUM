<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { IndoorControl, MapServerHandler } from 'maplibre-gl-indoor'
import { Map } from 'maplibre-gl'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// Define props if needed

const map = ref<Map | null>(null)

function initMap(containerId: string): Map {
  const mapInstance = new Map({
    container: containerId,
    center: [11.5748, 48.14],
    zoom: 11,
    attributionControl: false,
  })

  mapInstance.addControl(new maplibregl.NavigationControl(), 'top-left')

  mapInstance.addControl(new maplibregl.FullscreenControl())

  const mapServerHandler = MapServerHandler.manage(
    `${runtimeConfig.public.apiURL}/api/maps/indoor`,
    map,
    indoorOptions,
  )

  // Add the specific control

  mapInstance.addControl(
    new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    }),
  )
  mapInstance.map.addControl(new IndoorControl(), 'bottom-left')

  return mapInstance
}

onMounted(() => {
  nextTick(() => {
    const mapContainer = document.getElementById('map')
    if (mapContainer) {
      map.value = initMap('map')
    } else {
      console.error('Map container not found')
    }
  })
})
</script>

<template>
  <div
    id="map-container"
    class="map-container"
    :class="{
      'dark:bg-black bg-white border-zinc-300 border': true, // Adjust classes as needed
    }"
  >
    <div id="map" class="map"></div>
  </div>
</template>

<style lang="postcss">
@import 'maplibre-gl/dist/maplibre-gl.css';

.map-container {
  width: 100%;
  height: 500px; /* Set desired height */
  position: relative;
}

.map {
  width: 100%;
  height: 100%;
}
</style>
