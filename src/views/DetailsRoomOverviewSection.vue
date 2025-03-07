<!-- 你的组件 -->
<template>
  <div
    v-if="props.rooms?.usages"
    class="flex flex-col gap-3 bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 mx-5 rounded border print:!hidden transition-colors duration-500"
  >
    <p class="text-zinc-800 dark:text-zinc-200 text-lg font-semibold">rooms</p>
    <div class="flex flex-col gap-2">
      <!-- Listbox 组件 -->
      <Listbox v-model="selectedUsage" as="div" class="relative z-10">
        <ListboxButton
          class="focusable text-zinc-600 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 border-zinc-400 dark:border-zinc-600 relative w-full rounded-sm py-2 pr-10 text-left sm:text-sm h-10 transition-colors duration-300"
        >
          <span class="absolute inset-y-0 left-0 flex items-center pl-2">
            <FunnelIcon class="h-4 w-4" />
          </span>
          <span class="block truncate [padding-inline-start:27px]">{{ $t('anyusage') }}</span>
          <span class="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon class="h-5 w-5" />
          </span>
        </ListboxButton>

        <Transition
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <ListboxOptions
            class="ring-black/5 bg-zinc-200 dark:bg-zinc-700 absolute mt-1 max-h-60 w-full overflow-auto rounded-md text-base shadow-lg ring-1 focus:outline-none sm:text-sm p-0 m-0 transition-colors duration-300"
          >
            <!-- Any Usage Option -->
            <ListboxOption
              v-slot="{ active, selected }"
              :key="-1"
              :value="-1"
              as="li"
              class="cursor-pointer select-none list-none p-0 m-0"
            >
              <div
                class="flex flex-row justify-start gap-3 px-3 py-2"
                :class="[active ? 'text-blue-900 bg-blue-100' : 'text-zinc-900 dark:text-zinc-200']"
              >
                <span v-if="selected" class="text-blue-600 my-auto">
                  <CheckIcon class="h-5 w-5" />
                </span>
                <div class="flex flex-grow flex-row justify-between gap-3">
                  <span
                    class="text-zinc-600 my-auto block truncate"
                    :class="[selected ? 'font-medium' : 'ms-10 font-normal']"
                  >
                    {{ $t('any_usage') }}
                  </span>
                  <span
                    class="bg-blue-300 rounded-md px-2 py-1 text-sm text-blue-950 dark:bg-blue-600 dark:text-white"
                  >
                    {{ $t('rooms', combined_list.length) }}
                  </span>
                </div>
              </div>
            </ListboxOption>

            <!-- Usage Options -->
            <ListboxOption
              v-for="(usage, i) in props.rooms.usages"
              v-slot="{ active, selected }"
              :key="i"
              :value="i"
              as="li"
              class="cursor-pointer select-none list-none p-0 m-0"
            >
              <div
                class="flex flex-row justify-start gap-3 px-3 py-2"
                :class="[active ? 'text-blue-900 bg-blue-100' : 'text-zinc-900 dark:text-zinc-200']"
              >
                <span v-if="selected" class="text-blue-600 my-auto">
                  <CheckIcon class="h-5 w-5" />
                </span>
                <div class="flex flex-grow flex-row justify-between gap-3">
                  <span
                    class="text-zinc-600 my-auto block truncate"
                    :class="[selected ? 'font-medium' : 'ms-10 font-normal']"
                  >
                    {{ usage.name }}
                  </span>
                  <span
                    class="bg-blue-300 rounded-md px-2 py-1 text-sm text-blue-950 dark:bg-blue-600 dark:text-white"
                  >
                    {{ $t('rooms', usage.count) }}
                  </span>
                </div>
              </div>
            </ListboxOption>
          </ListboxOptions>
        </Transition>
      </Listbox>

      <!-- 搜索框 -->
      <div
        class="bg-zinc-200 dark:bg-zinc-700 border-zinc-400 dark:border-zinc-600 z-0 flex w-full shrink items-center border transition-colors duration-300"
      >
        <MagnifyingGlassIcon
          class="text-zinc-600 dark:text-zinc-300 h-4 w-6 pl-2 h-10"
          aria-hidden="true"
        />
        <textarea
          id="search-input"
          v-model="search"
          :title="$t('durchsuchen')"
          :aria-label="$t('search_rooms_of_building')"
          rows="1"
          aria-autocomplete="both"
          aria-haspopup="false"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          maxlength="2048"
          type="text"
          class="focusable text-zinc-800 dark:text-zinc-200 bg-zinc-200 dark:bg-zinc-700 w-full flex-grow resize-none rounded-sm py-2 ps-6 font-semibold placeholder:text-zinc-800 dark:placeholder:text-zinc-300 focus-within:placeholder:text-zinc-500 placeholder:font-normal placeholder-[font-size:16px] title-[font-size:16px] border-none transition-colors duration-300"
          :placeholder="$t('durchsuchen')"
        />
        <img
          src="/img/camera.svg"
          style="padding-right: 8px"
          alt="Camera"
          @click="onChange"
          class="camera"
        />
        <a-upload
          v-show="isSHow"
          v-model:file-list="fileList"
          class="upload"
          list-type="picture-card"
          @preview="handlePreview"
        >
          <div v-if="fileList.length < 1" class="uploadcont">
            <div style="margin-top: 8px">Drag & drop your photo here</div>
            <img :src="folderplus" style="width: 60px; padding-top: 16px" />

          </div>
        </a-upload>
            <button @click='click'  v-show="isSHow" class='btn'>Search</button>
        <a-modal :open="previewVisible" style="margin-top: 181px;" :title="previewTitle" :footer="null" @cancel="handleCancel">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
      </div>
    </div>

    <!-- 房间列表 -->
    <div class="text-zinc-600 dark:text-zinc-300">
      <div
        v-if="filteredList.length > 0"
        v-bind="containerProps"
        class="bg-zinc-100 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-700 max-h-96 overflow-y-scroll border p-2 transition-colors duration-300"
      >
        <ul v-bind="wrapperProps" class="list-none p-0 m-0">
          <li v-for="(room, index) in list" :key="index">
            <router-link
              :to="`/view/${room.data.id}`"
              class="flex h-[36px] max-h-[36px] min-h-[36px] flex-row gap-2 p-1.5 px-3 text-black dark:text-white dark:bg-zinc-700 hover:text-white hover:bg-blue-500 transition-colors duration-300"
            >
              <MapPinIcon class="my-auto h-4 w-4" aria-hidden="true" />
              {{ room.data.name }}
            </router-link>
          </li>
        </ul>
      </div>
      <div v-else class="flex flex-row items-baseline">
        {{ $t('no_results_with_these_filters') }}
        <Btn
          size="sm"
          variant="linkButton"
          @click="
            () => {
              search = ''
              selectedUsage = -1
            }
          "
          >{{ $t('clear_filter') }}
        </Btn>
      </div>
      <small class="p-4">
        {{ $t('results', filteredList.length) }}
      </small>
    </div>
  </div>
</template>

<script setup>
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import {
  CheckIcon,
  ChevronUpDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
} from '@heroicons/vue/24/outline'
import { useVirtualList } from '@vueuse/core'
import { ref, computed } from 'vue'
import folderplus from '@/imgs/folder-plus.svg'

const props = defineProps({
  rooms: {
    type: Object,
    required: false,
  },
})

const fileList = ref([])
const isSHow = ref(false)
const selectedUsage = ref(-1)
const search = ref('')
const combined_list = computed(() => {
  const usages = props.rooms?.usages || []
  const combinedList = []
  usages.forEach((usage) => {
    combinedList.push(...usage.children)
  })
  return combinedList
})

const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
  const handlePreview = async (file) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj));
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};
const handleCancel =()=>{
  previewVisible.value = false;
}
const click =()=>{
  console.log('coming')
}
const selectedRooms = computed(() => {
  if (selectedUsage.value === -1) {
    return { rooms: combined_list.value, label: 'any_usage' }
  }
  const rooms_usgage = props.rooms?.usages || []
  return {
    rooms: rooms_usgage[selectedUsage.value]?.children || [],
    label: rooms_usgage[selectedUsage.value]?.name || 'Usage Out of Range',
  }
})

const onChange = () => {
  isSHow.value = !isSHow.value
}

const filteredList = computed(() => {
  const search_term = new RegExp(`.*${search.value}.*`, 'i') // i ^= case-insensitive
  return selectedRooms.value.rooms.filter((f) => search_term.test(f.name))
})

const { list, containerProps, wrapperProps } = useVirtualList(filteredList, {
  itemHeight: 36,
})
</script>

<style scoped>
/* 确保过渡效果 */
.upload {
  margin-top: 16px;
  /* position: relative; */
  position: absolute;
  left: 35px;
  border: 1px solid #ccc;
  background-color: #ccc;
  height: 250px;
  width: 335px;
  text-align: center;
  /* align-items: center; */
  padding-top: 70px;
  top: 950px;
}
.uploadcont {
  margin-top: 16px;
  /* position: relative; */
  position: absolute;
  left: 0px;
  border: 1px solid #ccc;
  background-color: #ccc;
  height: 250px;
 width: 335px;
  text-align: center;
  /* align-items: center; */
  padding-top: 70px;
  top: 0px;
}
.btn{
      position: absolute;
      bottom: -530px;
      left: 160px;
      border-radius: 16px;
      background: #0038A826;
      color: #0038A8;
      z-index: 99999999;
}
.ant-upload-list-item .ant-upload-list-item-error{
    border-color:unset;
}
.ant-upload-list-item-container{
      width: 160px;
    height: 134px;
}
</style>
