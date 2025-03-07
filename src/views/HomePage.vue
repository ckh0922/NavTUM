<template>
  <Page>
    <template #content>
      <p class="title">{{ $t('fakultaet') }}</p>
      <Map />
      <SliderWrapper />
      <DetailsRoomOverviewSection :rooms="rooms" />
    </template>
  </Page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import 'leaflet/dist/leaflet.css'
import { searchValue, searchlocationsRooms } from './api'
import DetailsRoomOverviewSection from './DetailsRoomOverviewSection.vue'
import Map from '../components/map.vue'
import SliderWrapper from '../components/SliderWrapper.vue'
import Page from '@/components/Page.vue'
const data = ref({})
const rooms = ref([])

onMounted(() => {
  search()
  searchlocationsRoomsFn()
})

//房间类型数组
const roomTypeArr = ref([])

const searchlocationsRoomsFn = async () => {
  const lang =  localStorage.getItem('language') // 存储用户选择的语言
  const params = {
    lang: lang,
  }
  const res = await searchlocationsRooms('mi', params)
  const data = res.data.sections.rooms_overview.usages
  rooms.value = res.data.sections.rooms_overview
  const newroomTypeArr = data.map((i) => {
    return {
      label: i.name,
      value: i.name,
      count: i.count,
    }
  })
  roomTypeArr.value = newroomTypeArr
}

const search = async () => {
  const params = {
    q: 'mi hs1',
    limit_buildings: 5,
    limit_rooms: 10,
    limit_all: 10,
    pre_highlight: '\x19',
    post_highlight: '\x17',
  }
  const res = await searchValue(params)
  data.value = res.data
}
</script>
<style scoped>
.title {
  font-family: 'Inter-Bold', Helvetica;
  font-weight: 700;
  color: var(--text-color);
  font-size: 15px;
  margin-bottom: 15px;
}
</style>
