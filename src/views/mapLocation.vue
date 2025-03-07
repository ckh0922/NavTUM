<!-- src/views/View.vue -->
<template>
  <Page>
    <template #content>
      <!-- 搜索栏 -->
      <div v-show="visibleStart" class="searchBar">
        <div class="coupimg">
          <img :src="circle" style="width: 15px" />
          <img class="slh" :src="slh" />
          <img style="width: 15px" :src="mappin" />
        </div>
        <div class="coupSearch">
          <input class="search" style="padding-left: 13px" disabled v-model="yourLocation" />
          <input class="search" style="padding-left: 13px" disabled v-model="roomLocation" />
        </div>
        </div>
      <!-- 地图组件 -->
      <Map :visibleStart ='visibleStart' :isNavigating="isNavigating" class="map" :isSelecting="isSelecting" @pointSelected="handlePointSelected" />
      <img v-show="visibleStart" :src="Start" class="btn" @click="startNavigation" />
        <div style='    position: relative;
    width: 100%;
    bottom: -162px;
}' 
 @click="exitonClick" >   <img  v-show="!visibleStart" class="btn exit" :src="exit"/>
                  <img style='
    position: absolute;
    /* top: 68px; */
    /* height: 28px; */
    /* left: -145px; */
    left: 5px;
    height: 50px;
    top: 0px;
' v-show="!visibleStart" class="btn" :src="exitItem"/></div>
           
      <!-- 权限弹窗 -->
      <div v-if="showPermissionModal" class="modal-overlay">
        <div class="modal">
          <h3>定位权限未授权</h3>
          <p>请授权应用访问您的位置信息，以便正常使用地图功能。</p>
          <button @click="requestPermission">重新授权</button>
          <button @click="closeModal">取消</button>
        </div>
      </div>
    </template>
  </Page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

// 导入组件和图片
import Page from '@/components/Page.vue'
import Map from '../components/InnerMap.vue'
import circle from '/img/circle.svg'
import mappin from '/img/mappin.svg'
import slh from '/img/slh.svg'
import repeat from '/img/repeat.svg'
import Start from '/img/Start.svg'
import navigation from '@/imgs/navigation.svg'
import mapPin from '@/imgs/map-pin.svg'
import exit from '@/imgs/Start.png'
import exitItem from '@/imgs/exit.png'
// 响应式变量
const route = useRoute()
const selectedOption = ref('your-location')
const isSelecting = ref(false)
const yourLocation = ref('')
const roomLocation = ref(route?.query.name || '')
const watchId = ref(null)
const dynamicOptions = ref([])
const userPosition = ref({ lat: null, lon: null })
const positionValue = ref('')
const paramValue = route.query
const visibleStart = ref(true)
// 控制弹窗显示
const showPermissionModal = ref(false)

// 导航状态
const isNavigating = ref(false)

// 处理选项变化
const handleOptionChange = () => {
  if (selectedOption.value === 'choose-on-map') {
    isSelecting.value = true
  } else {
    isSelecting.value = false
    // getPoint()
  }
}

// 处理地图点选
const handlePointSelected = (point) => {
  yourLocation.value = `Lat: ${point.lat.toFixed(5)}, Lon: ${point.lon.toFixed(5)}`
  // isSelecting.value = false // 可选：如果需要在选择后关闭选择模式
}

// 请求地理位置权限
const requestGeolocation = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      // 成功获取位置
      const positionJSON = JSON.stringify(position, null, 2)
      positionValue.value = positionJSON
          userPosition.value.lat = position.coords.latitude
          userPosition.value.lon = position.coords.longitude
      yourLocation.value = `Lat: ${userPosition.value.lat.toFixed(5)}, Lon: ${userPosition.value.lon.toFixed(5)}`
      console.log(yourLocation.value, '==>yourLocation.value')
    },
    (error) => {
      console.error('Geolocation error:', error)
      if (error.code === error.PERMISSION_DENIED) {
        showPermissionModal.value = true
      }
      // 根据错误类型提供用户提示或采取其他措施
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  )
}

// 检查权限状态
const checkPermission = async () => {
  if (navigator.permissions) {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' })
      if (permissionStatus.state === 'granted') {
        // getPoint()
      } else if (permissionStatus.state === 'prompt') {
        requestGeolocation()
      } else if (permissionStatus.state === 'denied') {
        showPermissionModal.value = true
      }

      // 监听权限变化
      permissionStatus.onchange = () => {
        if (permissionStatus.state === 'granted') {
          showPermissionModal.value = false
          // getPoint()
        }
      }
    } catch (error) {
      console.error('Error checking geolocation permissions:', error)
      // 处理不支持的情况
      requestGeolocation()
    }
  } else {
    // 浏览器不支持 Permissions API
    requestGeolocation()
  }
}

// 获取位置信息并监视位置变化
const getPoint = () => {  
  watchId.value = navigator.geolocation.watchPosition(
    (position) => {
      const positionJSON = JSON.stringify(position, null, 2) 
      positionValue.value = positionJSON
      userPosition.value.lat = position.coords.latitude
          userPosition.value.lon = position.coords.longitude
      yourLocation.value = `Lat: ${userPosition.value.lat.toFixed(5)}, Lon: ${userPosition.value.lon.toFixed(5)}`
      console.log(yourLocation.value, '==>yourLocation.value')
    },
    (error) => {
      console.error('Geolocation error:', error)
      if (error.code === error.PERMISSION_DENIED) {
        showPermissionModal.value = true
      }
      // 根据错误类型提供用户提示或采取其他措施
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  )
}

// 在组件挂载时检查权限
onMounted(() => {
  checkPermission()
})

// 处理弹窗按钮点击 - 重新请求权限
const requestPermission = () => {
  showPermissionModal.value = false
  requestGeolocation()
}

// 关闭弹窗
const closeModal = () => {
  showPermissionModal.value = false
}

// 交换位置
const onClick = () => {
  const temp = yourLocation.value
  yourLocation.value = roomLocation.value
  roomLocation.value = temp
}

// 开始导航
const startNavigation = () => {
  // if (userPosition.value.lat && userPosition.value.lon && paramValue) {
    isNavigating.value = true
    navigateToRoom(userPosition.value, paramValue)
    visibleStart.value =!visibleStart.value
  // } else {
  //   alert('无法获取当前位置或目标位置')
  // }
}

const exitonClick=()=>{
    window.location.href = '/'
}

// 导航逻辑
const navigateToRoom = (start, end) => {
  console.log(start)
  // 实现导航逻辑，例如绘制路径或提供方向
  console.log(`导航从 ${start} 到 ${end}`)
  // 计算距离和时间
  const distance = calculateDistance(start.lat, start.lon, end.lat, end.lon)
  const time = calculateTime(distance)
  console.log(`距离: ${distance} 米, 时间: ${time} 分钟`)
}

// 计算距离（米）
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3 // 地球半径（米）
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const distance = R * c // 距离（米）
  return distance
}

// 计算时间（分钟）
const calculateTime = (distance) => {
  const speed = 80 // 假设速度为80米/分钟
  const time = distance / speed
  return time.toFixed(2)
}
</script>

<style scoped>
/* 保持现有样式不变 */
.search {
    width: calc(100vw - 106px);
  border-radius: 8px;
  height: 28px;
  border: 1px solid #0038a8b2;
}
.coupimg {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 20px;
}
.coupSearch {
  display: flex;
  flex-direction: column;
  gap: 21px;
}
.searchBar {
  display: flex;
}
.slh {
  height: 33px;
}
.exchange {
  padding-left: 13px;
  height: 26px;
  margin-top: 50px;
}
.map {
  position: relative;
  margin-top: 38px;
  height: calc(100vh - 440px);
}
.option-your-location {
  background: url('@/imgs/navigation.svg') no-repeat left center;
  padding-left: 30px; /* 为图标留出空间 */
}

.option-choose-on-map {
  background: url('@/imgs/map-pin.svg') no-repeat left center;
  padding-left: 30px;
}
.mapInfo {
  display: flex;
  justify-content: space-between;
}
.mapInfoTextTitle {
  font-size: 18px;
  font-weight: 600;
}
.mapInfoText {
  color: #0038a8b2;
  font-size: 16px;
  font-weight: 600;
}
.btn {
  height: 46px;
  padding-left: 114px;
  margin-top: 8px;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
}

.modal h3 {
  margin-bottom: 10px;
}

.modal p {
  margin-bottom: 20px;
}

.modal button {
  margin: 10px;
  padding: 8px 16px;
  border: none;
  background-color: #0038a8;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.modal button:hover {
  background-color: #002c80;
}

.btn.exit {
  width: 60px; /* 调整为需要的宽度 */
  height: 60px; /* 调整为需要的高度 */
  position: absolute; /* 使用绝对定位 */
  bottom: 20px; /* 距离底部的距离 */
  right: 20px; /* 距离右侧的距离 */
  z-index: 100; /* 确保按钮在最前面 */
}


.btn.exitItem {
  width: 60px; /* 修改大小 */
  height: 60px;
  position: absolute;
  bottom: 90px; /* 相对于 exit 的偏移 */
  right: 20px;
  z-index: 100;
  }
</style>
