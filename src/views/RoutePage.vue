<template>
    <div class="route-page">
      <h2>Find Your Route</h2>
      <label>Starting Point:</label>
      <input type="text" v-model="startPoint" placeholder="Your location" />
  
      <label>Destination:</label>
      <input type="text" v-model="endPoint" placeholder="Enter classroom" />
  
      <button @click="getRoute">Get Route</button>
  
      <div v-if="route">
        <h3>Route Details</h3>
        <p>Estimated Time: {{ route.time }}</p>
        <p>Distance: {{ route.distance }} meters</p>
        <router-link to="/navigation">
          <button>Start Navigation</button>
        </router-link>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        startPoint: '',
        endPoint: '',
        route: null
      };
    },
    methods: {
      getRoute() {
        // 调用 API 获取导航路线
        this.route = {
          time: '5 mins',
          distance: 200
        };
      }
    }
  };
  </script>
  