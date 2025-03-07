<template>
  <div id="map" ref="mapContainer" class="map">
    <select class="floor-selector" v-model="currentFloor" @change="changeFloor(currentFloor)">
      <option v-for="floor in floors" :key="floor" :value="floor">{{ floor }}</option>
    </select>
  </div>
</template>

<script setup>
import L from 'leaflet'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import KalmanFilter from 'kalmanjs' // 确保已安装 kalmanjs
import floor1 from '../imgs/floor1.png'
import floor2 from '../imgs/floor2.jpg'
import floor3 from '../imgs/floor3.jpg'
import floor4 from '../imgs/floor4.jpg'
import floor5 from '../imgs/floor5.jpg'
import floor6 from '../imgs/floor6.jpg'
import { useRoute } from 'vue-router'

const props = defineProps({
  dataDetail: Object,
  isSelecting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['pointSelected'])

const map = ref(null)
const marker = ref(null)
const roomMarker = ref(null)
const route = useRoute()
const currentFloor = ref('1')
const floors = ['-1', '0', '1', '2', '3', '4']
const paramValue = route.params


const floorImages = {
  '-1': floor5,
  0: floor4,
  1: floor6,
  2: floor2,
  3: floor3,
  4: floor1,
}

// 定义地理边界
const latMin = 48.26177576
const latMax = 48.26330389
const lonMin = 11.6664429
const lonMax = 11.66950414

const userPosition = ref({ lat: null, lon: null })
const watchId = ref(null)

const mapWidth = 3366
const mapHeight = 2517

// 初始化卡尔曼滤波器
const kalmanFilterLat = new KalmanFilter()
const kalmanFilterLon = new KalmanFilter()

const kalmanFilterLatRoom = new KalmanFilter()
const kalmanFilterLonRoom = new KalmanFilter()

// 校准参数（根据标定点调整）
const scaleX = mapWidth / (lonMax - lonMin)
const scaleY = mapHeight / (latMax - latMin)
const offsetX = 0 // 根据标定点调整
const offsetY = 0 // 根据标定点调整

function convertLatLonToMap(lat, lon) {
  const x = (lon - lonMin) * scaleX + offsetX
  const y = (lat - latMin) * scaleY + offsetY
  return [y, x]
}

const deviceHeading = ref(0)

function handleOrientation(event) {
  if (event.alpha !== null) {
    deviceHeading.value = event.alpha
    updateMarkerRotation(deviceHeading.value)
  }
}

function updateMarkerRotation(angle) {
  if (marker.value) {
    const iconElement = marker.value.getElement()
    if (iconElement) {
      iconElement.style.transform = `rotate(${angle}deg)`
    }
  }
}

function loadFloor(floor) {
  const imageUrl = floorImages[floor]
  const imageBounds = [
    [0, 0],
    [mapHeight, mapWidth],
  ]

  // 移除现有的 ImageOverlay 层
  map.value.eachLayer((layer) => {
    if (layer instanceof L.ImageOverlay) {
      map.value.removeLayer(layer)
    }
  })

  // 添加新的 ImageOverlay
  const imageOverlay = L.imageOverlay(imageUrl, imageBounds).addTo(map.value)

  // 在图片加载完成后应用旋转
  imageOverlay.on('load', () => {
    const img = imageOverlay.getElement()
    if (img) {
      img.style.transformOrigin = 'center center'
      img.style.transition = 'transform 0.5s' // 可选：添加过渡效果
    }

    // 根据旋转角度调整地图的边界或视图
    map.value.fitBounds(imageBounds, {
      padding: [100, 100],
      maxZoom: 2,
      minZoom: -1,
    })
  })

  // 使用 fitBounds 自动调整视图和缩放级别
  map.value.fitBounds(imageBounds, {
    padding: [50, 50],
    maxZoom: 2,
    minZoom: -1,
  })
}
function convertLatLonToMapRoom(lat, lon) {
  const x = (lon - lonMin) * scaleX + offsetX
  const y = (lat - latMin) * scaleY + offsetY
  return [y, x]
}
function drawRooms(lat, lon) {
  // 过滤和平滑位置数据
  const filteredLat = kalmanFilterLatRoom.filter(lat)
  const filteredLon = kalmanFilterLonRoom.filter(lon)

  const [userMapY, userMapX] = convertLatLonToMapRoom(filteredLat, filteredLon)
  if (roomMarker.value) {
    roomMarker.value.setLatLng([userMapY, userMapX])
  } else {
    roomMarker.value = L.marker([userMapY, userMapX]).addTo(map.value)
  }
}

function changeFloor(floor) {
  loadFloor(floor)

}


onMounted(() => {
  // 初始化地图
  map.value = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 3,
    zoomSnap: 0.5,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    dragging: true,
  }).setView([mapHeight / 2, mapWidth / 2], 1)

  // 添加比例尺
  L.control.scale().addTo(map.value)

  // 加载初始楼层
  loadFloor(currentFloor.value)
  console.log(props.dataDetail,'===>dataDetail222')
// drawRooms()
  // 添加设备方向监听
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', handleOrientation, true)
  } else {
  }
})
const floorChange = (floor) => {
  switch (floor) {
    case '1st basement floor':
      return '-1'
    case 'Ground floor':
      return '0'
    case 'First Floor':
      return '1'
    case '2nd upper floor':
      return '2'
    case '3rd upper floor':
      return '3'
    case '4th upper floor':
      return '4'
    default:
      return 'Invalid Floor'
  }
}
watch(() => props.dataDetail, (newDataDetail) => {
  console.log('Data Detail updated:', newDataDetail,);
  // 这里可以触发任何依赖 dataDetail 的处理
  if(newDataDetail){
    console.log('Data Detail updated:props', newDataDetail.props.computed[2].text,);
    
    currentFloor.value =floorChange(newDataDetail.props?.computed[2]?.text)
    loadFloor(currentFloor.value)
  drawRooms(newDataDetail.coords.lat,newDataDetail.coords.lon)

  }
}, { immediate: true });


onUnmounted(() => {
  if (watchId.value !== null) {
    navigator.geolocation.clearWatch(watchId.value)
  }
  window.removeEventListener('deviceorientation', handleOrientation, true)
})
</script>

<style scoped>
.map {
  width: 100%;
  height: 240px; /* 调整为适合的高度 */
  border-radius: 10px;
  margin-bottom: 15px;
  position: relative;
  background: #fff;
}

.floor-selector {
  position: absolute;
  top: 10px;
  right: 7px;
  z-index: 1000;
  padding: 5px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
}

/* 可选：调整标记图标和弹出窗口的样式 */
.leaflet-marker-icon {
  /* 保持标记图标的正向显示 */
  transform: rotate(0deg) !important;
}

.leaflet-popup-content-wrapper,
.leaflet-popup-tip {
  /* 保持弹出窗口的正向显示 */
  transform: rotate(0deg) !important;
}
</style>
                                                                              