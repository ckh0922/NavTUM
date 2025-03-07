<!-- src/components/ThemeToggleButton.vue -->
<template>
  <button @click="toggleTheme" class="toggle-button">切换到 {{ oppositeTheme }} 主题</button>
</template>

<script>
import { inject, computed } from 'vue'

export default {
  name: 'ThemeToggleButton',
  setup() {
    const toggleTheme = inject('toggleTheme')
    const currentTheme = inject('currentTheme')

    const oppositeTheme = computed(() => (currentTheme.value === 'light' ? 'light' : '亮'))

    return {
      toggleTheme,
      oppositeTheme,
    }
  },
}
</script>

<style scoped>
.toggle-button {
  padding: 10px 20px;
  cursor: pointer;
  background-color: var(--background-color);
  color: var(--text-color);
  border: none;
  border-radius: 5px;
  font-size: 16px;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
  position: absolute;
  z-index: 9999;
}

.toggle-button:hover {
  opacity: 0.8;
}
</style>
