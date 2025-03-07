<template>
  <div>
    <div id="map" style="height: 600px;"></div>
    <div class="controls">
      <label for="start">起点:</label>
      <select v-model="startNode" @change="updateRoute">
        <option disabled value="">请选择起点</option>
        <option v-for="feature in geojsonFeatures" :key="feature.properties.id" :value="feature.properties.id">
          {{ feature.properties.name || `Feature ${feature.properties.id}` }}
        </option>
      </select>

      <label for="end">终点:</label>
      <select v-model="endNode" @change="updateRoute">
        <option disabled value="">请选择终点</option>
        <option v-for="feature in geojsonFeatures" :key="feature.properties.id" :value="feature.properties.id">
          {{ feature.properties.name || `Feature ${feature.properties.id}` }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import L from 'leaflet';
import axios from 'axios';

export default {
  name: 'GeoJSONMap',
  setup() {
    const map = ref(null);
    const geojsonFeatures = ref([]);
    const startNode = ref('');
    const endNode = ref('');
    const directionsService = ref(null);
    const directionsRenderer = ref(null);
    const routeLayer = ref(null);

    onMounted(() => {
      initMap();
      loadGeoJSON();
      initDirections();
    });

    const initMap = () => {
      map.value = L.map('map').setView([11.667, 48.263], 18); // 根据您的数据调整中心点和缩放级别

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map.value);
    };

    const loadGeoJSON = async () => {
      try {
        const response = await axios.get('/test99999.geojson'); // 确保路径正确
        const geojsonData = response.data;

        geojsonFeatures.value = geojsonData.features;

        L.geoJSON(geojsonData, {
          onEachFeature: (feature, layer) => {
            layer.bindPopup(`Feature ID: ${feature.properties.id}`);
          },
          style: {
            color: '#FF0000',
            weight: 2,
            fillOpacity: 0.35,
          },
        }).addTo(map.value);

        map.value.fitBounds(L.geoJSON(geojsonData).getBounds());
      } catch (error) {
        console.error('Error loading GeoJSON:', error);
      }
    };

    const initDirections = () => {
      // 使用 Google Maps JavaScript API 的 DirectionsService 和 DirectionsRenderer
      directionsService.value = new google.maps.DirectionsService();
      directionsRenderer.value = new google.maps.DirectionsRenderer();

      // 创建一个不可见的 Google Maps 显示器用于 DirectionsRenderer
      directionsRenderer.value.setMap(null);
      directionsRenderer.value.setPanel(null);
    };

    const updateRoute = async () => {
      if (startNode.value && endNode.value) {
        const startFeature = geojsonFeatures.value.find(f => f.properties.id === startNode.value);
        const endFeature = geojsonFeatures.value.find(f => f.properties.id === endNode.value);

        if (startFeature && endFeature) {
          const startCoords = startFeature.geometry.coordinates;
          const endCoords = endFeature.geometry.coordinates;
  const startLatLng = new google.maps.LatLng(48.26330709686446, 11.666775526186171); // 注意：LatLng 的顺序是 (纬度, 经度)
  const endLatLng = new google.maps.LatLng(48.2641870, 11.6669248);
          const request = {
            origin: startLatLng,
            destination: endLatLng,
            travelMode: google.maps.TravelMode.WALKING, // 可选: WALKING, DRIVING, BICYCLING, TRANSIT
          };

          directionsService.value.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              // 解码多边形
              const decodedPath = decodePolyline(result.routes[0].overview_polyline.points);
              console.log(decodedPath,'===>decodedPath')

              if (routeLayer.value) {
                map.value.removeLayer(routeLayer.value);
              }

              routeLayer.value = L.polyline(decodedPath, { color: 'blue' }).addTo(map.value);
              map.value.fitBounds(routeLayer.value.getBounds());

              // 添加标记
              addOrUpdateMarker('start', [startCoords[1], startCoords[0]], '起点');
              addOrUpdateMarker('end', [endCoords[1], endCoords[0]], '终点');
            } else {
              alert('无法获取导航路线: ' + status);
            }
          });
        }
      }
    };

    const markers = ref({});

    const addOrUpdateMarker = (type, coords, popupText) => {
      if (markers.value[type]) {
        markers.value[type].setLatLng(coords).setPopupContent(popupText);
      } else {
        markers.value[type] = L.marker(coords)
          .addTo(map.value)
          .bindPopup(popupText)
          .openPopup();
      }
    };

    const decodePolyline = (encoded) => {
      let points = [];
      let index = 0, len = encoded.length;
      let lat = 0, lng = 0;

      while (index < len) {
        let b, shift = 0, result = 0;
        do {
          b = encoded.charCodeAt(index++) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (b >= 0x20);
        let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        do {
          b = encoded.charCodeAt(index++) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (b >= 0x20);
        let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        points.push([lat / 1e5, lng / 1e5]);
      }

      return points;
    };

    return {
      startNode,
      endNode,
      geojsonFeatures,
      updateRoute,
    };
  }
};
</script>

<style scoped>
#map {
  height: 600px;
  width: 100%;
}

.controls {
  margin-top: 10px;
}

.controls label {
  margin-right: 10px;
}

.controls select {
  margin-right: 20px;
}
</style>
