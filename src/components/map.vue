<!-- src/views/View.vue -->
<template>
  <!-- 交互式地图 -->
  <div id="map" ref="map" class="map"></div>
</template>

<script setup>
import L from 'leaflet'
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const map = ref(null)
const marker = ref(null) // 用于存储标记的引用
const props = defineProps({
  dataDetail: Object,
})

onMounted(() => {
  // 初始化地图
  map.value = L.map('map').setView(
    [props.dataDetail?.coords?.lat ?? 48.262877, props.dataDetail?.coords?.lon ?? 11.667441],
    16,
  )

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map.value)

  // 初始化标记
  marker.value = L.marker([
    props.dataDetail?.coords?.lat ?? 48.262877,
    props.dataDetail?.coords?.lon ?? 11.667441,
  ])
    .addTo(map.value)
    .bindPopup(props.dataDetail?.name ?? 'Fakultät Mathematik & Informatik')
    .openPopup()
})

// 监听 dataDetail 的变化
watch(
  () => props.dataDetail,
  (newDetail) => {
    if (newDetail && map.value && marker.value) {
      // 更新地图中心
      map.value.setView(
        [newDetail.coords?.lat ?? 48.262877, newDetail.coords?.lon ?? 11.667441],
        16,
      )

      // 更新标记位置和弹出信息
      marker.value.setLatLng([
        newDetail.coords?.lat ?? 48.262877,
        newDetail.coords?.lon ?? 11.667441,
      ])
      marker.value.getPopup().setContent(newDetail.name ?? 'Fakultät Mathematik & Informatik')
    }
  },
  { immediate: true },
) // immediate: true 确保初始值也会触发回调
</script>

<style scoped>
.map {
  width: 100%;
  height: 200px;
  border-radius: 10px;
  margin-bottom: 15px;
}
</style>
