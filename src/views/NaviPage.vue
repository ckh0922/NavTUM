<template>
    <div>
      <l-map :zoom="18" :center="[48.2622, 11.6673]" style="height: 500px;">
        <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <l-marker :lat-lng="[userLat, userLng]"></l-marker>
        <l-polyline :lat-lngs="routePath" color="blue" />
      </l-map>
      <p>Distance to destination: {{ distance }} meters</p>
      <button @click="endNavigation">End Navigation</button>
    </div>
  </template>
  
  <script>
  import { LMap, LTileLayer, LMarker, LPolyline } from 'vue2-leaflet';
  import 'leaflet/dist/leaflet.css';
  
  export default {
    components: { LMap, LTileLayer, LMarker, LPolyline },
    data() {
      return {
        userLat: 48.2622,
        userLng: 11.6673,
        routePath: [[48.2622, 11.6673], [48.2630, 11.6680]],
        distance: 200
      };
    },
    methods: {
      endNavigation() {
        this.$router.push('/');
      }
    }
  };
  </script>
  