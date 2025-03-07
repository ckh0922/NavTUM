<!-- src/views/View.vue -->
<template>
  <Page>
    <template #content>
      <div class="title">{{ dataDetail?.name }}</div>
      <div class="otherTitle">{{ dataDetail?.type_common_name }}</div>
      <Map :dataDetail="dataDetail" />
      <SliderWrapper :dataDetail="dataDetail" />
      <div class="btnRow">
        <button class="btn" @click="onClick">
          <img class="img" style="width: 16px" src="/public/img/turn.svg" alt="Start" />Directions
        </button>
        <button class="Start" @click="onClick">
          <img class="img" src="/public/img/Vector.svg" alt="Start" />Start
        </button>
      </div>
    </template>
  </Page>
</template>

<script setup>
import 'leaflet/dist/leaflet.css'
import Map from '../components/InnerMapDetail.vue'
import SliderWrapper from '../components/SliderWrapper.vue'
import Page from '@/components/Page.vue'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { searchlocationsRooms } from './api'
const props = defineProps({
  id: Number,
})
const dataDetail = ref()
const router = useRouter() // 使用 useRouter() 获取路由实例
const onClick = () => {
  if (dataDetail.value) {
    const params = new URLSearchParams({
      name: dataDetail.value.name,
      lat: dataDetail.value.coords.lat,
      lon: dataDetail.value.coords.lon,
      floor:dataDetail.value?.props?.computed[2]?.text
    }).toString()
    const directionsUrl = `${window.location.origin}/mapLocation?${params}`
    window.location.href = directionsUrl
  } else {
    console.error('目标位置数据未加载')
  }
}
onMounted(() => {
  console.log('coming')
  getData()
  console.log('coming')
})

const getData = async () => {
  try {
    const lang = localStorage.getItem('language') || 'en' // 设置默认语言
    const params = { lang }
    const res = await searchlocationsRooms(props.id, params)
    console.log(res, '===>res')
    if (res && res.data) {
      dataDetail.value = res.data
    } else {
      console.error('未获取到有效的数据')
    }
    console.log(dataDetail.value, '===>dataDetail.value')
  } catch (error) {
    console.error('获取数据时发生错误:', error)
  }
}
</script>

<style scoped>
.btnRow {
  display: flex;
  justify-content: space-around;
}
.btn {
  width: 10rem;
  height: 3rem;
  border-radius: 1.8rem;
  background-color: #0038a8b2;
  color: white;
}
.Start {
  width: 10rem;
  height: 3rem;
  border-radius: 2rem;
  background-color: #0038a826;
  color: #0038a8;
}
.img {
  width: 9px;
  margin-right: 10px;
}
.title {
  font-family: 'Inter-Bold', Helvetica;
  font-weight: 700;
  color: var(--text-color);
  font-size: 17px;
}
.otherTitle {
  font-size: 12px;
}
</style>
