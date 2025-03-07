<!-- src/views/View.vue -->
<template>
  <div class="header">
    <div class="logo" @click="goHome">
      <img src="/img/map-pin.svg" alt="Map Pin" class="map-pin" />
      <div class="instaclass-TUM">{{ $t('institaclassTUM') }}</div>
    </div>
    <img src="/img/sliders.svg" alt="Sliders" class="sliders" @click="toggleSidebar" />
  </div>

  <!-- 设置弹出窗口 -->
  <div v-if="showSettings" class="settings-modal" ref="settingsModal" @click.stop>
    <div class="settings-content">
      <h2>{{ $t('preferences') }}</h2>
      <div class="setting-item">
        <label for="colorMode" class="bold-label">{{ $t('theme') }}:</label>
        <select id="colorMode" v-model="colorMode" @change="changeColorMode" class="select-box">
          <option value="light">{{ $t('light') }}</option>
          <option value="dark">{{ $t('dark') }}</option>
        </select>
      </div>
      <div class="setting-item">
        <label for="language" class="bold-label">{{ $t('language') }}:</label>
        <select id="language" v-model="language" @change="changeLanguage" class="select-box">
          <option value="en">English</option>
          <option value="de">Deutsch</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { inject, computed } from 'vue'

const { locale } = useI18n()

const toggleTheme = inject('toggleTheme')
const currentTheme = inject('currentTheme')

const oppositeTheme = computed(() => (currentTheme.value === 'light' ? 'light' : 'dark'))

const goHome = () => {
  window.location.href = '/'
}
const showSettings = ref(false) // 控制设置弹出窗口的显示与隐藏
const colorMode = ref('light') // 默认浅色模式
// 获取弹出框的 DOM 元素引用
const settingsModal = ref(null)

const language = ref(localStorage.getItem('language') || 'en') // 默认
// 打开/关闭设置弹窗
const toggleSidebar = () => {
  // 阻止点击事件传播
  event.stopPropagation()
  showSettings.value = !showSettings.value
}
// 监听点击外部关闭弹出框
const handleClickOutside = (event) => {
  // 检查点击的位置是否在弹出框外部
  if (settingsModal.value && !settingsModal.value.contains(event.target) && showSettings.value) {
    showSettings.value = false
  }
}
// 在组件挂载时添加事件监听器
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// 在组件卸载时移除事件监听器
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 更改颜色模式
const changeColorMode = (e) => {
  console.log(e?.target?.value, 'TGHIStype')
  toggleTheme(e?.target?.value) // 使用 ThemeProvider 提供的主题切换功能
  localStorage.setItem('theme', oppositeTheme.value) // 存储用户选择的
}

// 初始化语言模式和主题
onMounted(() => {
  const mode = localStorage.getItem('theme') || 'light' // 存储用户选择的
  changeColorMode({ target: { value: mode } })
  locale.value = language.value
})

// 更改语言
const changeLanguage = () => {
  locale.value = language.value
  localStorage.setItem('language', language.value) // 存储用户选择的语言
  console.log('Language changed to:', language.value)
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: var(--head-background-color);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 2000;
}
.dark-mode .header {
  background: var(--head-background-color);
}
.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.map-pin {
  width: 30px;
  height: 30px;
  margin-right: 10px;
}
.instaclass-TUM {
  font-family: 'Inter-Bold', Helvetica;
  font-weight: 700;
  color: #0038a8b2;
  font-size: 20px;
}
.sliders {
  width: 25px;
  height: 25px;
  cursor: pointer;
}
/* 设置弹出窗口 */
.settings-modal {
  position: fixed;
  top: 60px;
  right: 10px;
  width: 90%;
  max-width: 250px;
  background: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 9999;
}
.settings-content h2 {
  font-size: 18px;
  color: #8c8a8a;
  font-weight: bold;
  margin-bottom: 15px;
}
.setting-item {
  margin-bottom: 10px;
}
.select-box {
  width: 100%;
  padding: 8px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.bold-label {
  font-weight: bold;
  font-size: 16px;
}
</style>
