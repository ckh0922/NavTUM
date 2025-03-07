<template>
  <div :style="themeStyles">
    <slot></slot>
  </div>
</template>

<script>
import { provide, ref, watch, onMounted } from 'vue'
import { lightTheme, darkTheme } from '../theme.js'

export default {
  name: 'ThemeProvider',
  setup(_, { slots }) {
    const currentTheme = ref('light')

    const themeStyles = ref({})

    const applyTheme = (themeName) => {
      const theme = themeName === 'light' ? lightTheme : darkTheme
      themeStyles.value = theme
      // 应用主题变量到根元素
      Object.keys(theme).forEach((key) => {
        document.documentElement.style.setProperty(key, theme[key])
      })

      // 同步 Tailwind 的 dark 类
      if (themeName === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    // 初始化主题，优先读取本地存储
    onMounted(() => {
      const savedTheme = localStorage.getItem('theme')
      console.log(savedTheme, '==>savedTheme')
      if (savedTheme) {
        currentTheme.value = savedTheme
      } else {
        // 可选：根据用户系统偏好设置默认主题
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        currentTheme.value = prefersDark ? 'dark' : 'light'
      }
      applyTheme(currentTheme.value)
    })

    const toggleTheme = (type) => {
      console.log(currentTheme.value, type, '===>currentTheme.value')

      currentTheme.value = type
      applyTheme(currentTheme.value)
      // 将主题偏好保存到本地存储
      localStorage.setItem('theme', currentTheme.value)
    }

    // 提供主题切换函数给子组件
    provide('toggleTheme', toggleTheme)
    provide('currentTheme', currentTheme)

    return {
      themeStyles,
      slots,
    }
  },
}
</script>

<style scoped>
/* 你可以在这里添加全局样式 */
</style>
