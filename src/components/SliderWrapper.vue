<!-- src/views/View.vue -->
<template>
  <div class="photo-slider-wrapper">
    <div v-if="!dataDetail" class="photo-slider">
      <img
        src="/img/chevron-left.svg"
        alt="Left Arrow"
        class="arrow left-arrow"
        @click="prevPhoto"
      />
      <img :src="photos[currentPhotoIndex]" alt="Photo" class="photo" />
      <img
        src="/img/chevron-right.svg"
        alt="Right Arrow"
        class="arrow right-arrow"
        @click="nextPhoto"
      />
    </div>
    <div class="photo-details" v-if="!dataDetail">
      <p style='    border: 1px solid #0038A8B2;
    padding: 16px;
'>
        <strong style="font-weight: 700">{{ $t('buildingCodes') }}</strong
        ><br />
        560x, 561x<br /><br />
        <strong style="font-weight: 700">{{ $t('address') }}</strong
        ><br />
        Boltzmannstr. 3, 85748 Garching b. München<br /><br />
        <strong style="font-weight: 700">{{ $t('numberOfRooms') }}</strong
        ><br />
        1907
      </p>
    </div>
    <div class="photo-details" v-if="dataDetail">
      <p style='    border: 1px solid #0038A8B2;
    padding: 16px;
'>
        <strong style="font-weight: 700">{{ $t('Roomcode') }}</strong
        ><br />
        {{ dataDetail.id }}<br /><br />
        <strong style="font-weight: 700">{{ $t('Architectsname') }}</strong
        ><br />
        {{ dataDetail.props.computed.find((prop) => prop.name === 'Architekten-Name')?.text
        }}<br /><br />
        <strong style="font-weight: 700">{{ $t('Floor') }}</strong
        ><br />
        {{ dataDetail.props.computed.find((prop) => prop.name === 'Stockwerk').text }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  id: Number,
  dataDetail: Object,
})

const photos = ['/img/mi_3.webp', '/img/mi_2.webp', '/img/mi_1.png', '/img/mi_0.webp']
const currentPhotoIndex = ref(0)
const nextPhoto = () => {
  currentPhotoIndex.value =
    currentPhotoIndex.value < photos.length - 1 ? currentPhotoIndex.value + 1 : 0
}

const prevPhoto = () => {
  currentPhotoIndex.value =
    currentPhotoIndex.value > 0 ? currentPhotoIndex.value - 1 : photos.length - 1
}
</script>

<style scoped>
.photo-slider-wrapper {
  margin-bottom: 15px;
}

.photo-slider {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 10px;
  overflow: hidden;
}

.photo-slider .photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.arrow {
  position: absolute;
  width: 30px;
  height: 30px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}
.left-arrow {
  left: 10px;
}

.right-arrow {
  right: 10px;
}

.photo-details {
  padding: 10px 0;
  font-size: 14px;
}
</style>
