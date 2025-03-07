<script setup>
import { defineComponent, defineProps } from 'vue'
import BuildingOffice2Render from '@/components/icons/BuildingOffice2Icon.js'
import BuildingOfficeRender from '@/components/icons/BuildingOfficeIcon.js'
import MagnifyingGlassRender from '@/components/icons/MagnifyingGlassIcon.js'
import MapPinRender from '@/components/icons/MapPinIcon.js'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const BuildingOffice2Icon = defineComponent({
  name: 'BuildingOffice2Icon',
  render: BuildingOffice2Render,
})

const BuildingOfficeIcon = defineComponent({
  name: 'BuildingOfficeIcon',
  render: BuildingOfficeRender,
})

const MagnifyingGlassIcon = defineComponent({
  name: 'MagnifyingGlassIcon',
  render: MagnifyingGlassRender,
})

const MapPinIcon = defineComponent({
  name: 'MapPinIcon',
  render: MapPinRender,
})
</script>

<template>
  <div class="my-auto min-w-9 md:min-w-11">
    <div
      v-if="item.type === 'room' || item.type === 'virtual_room' || item.type === 'poi'"
      class="text-zinc-900 p-2"
    >
      <MagnifyingGlassIcon v-if="item.parsed_id" class="h-5 w-5 md:h-6 md:w-6" />
      <MapPinIcon v-else class="h-5 w-5 md:h-6 md:w-6" />
    </div>
    <div v-else class="text-white bg-blue-500 rounded-full p-2">
      <BuildingOfficeIcon v-if="item.type === 'building'" class="mx-auto h-5 w-5 md:h-6 md:w-6" />
      <BuildingOffice2Icon v-else class="mx-auto h-5 w-5 md:h-6 md:w-6" />
    </div>
  </div>
</template>
