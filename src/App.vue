<!-- src/App.vue -->
<template>
  <ThemeProvider>
    <router-view />
  </ThemeProvider>
</template>

<script>
import ThemeProvider from './components/ThemeProvider.vue'

export default {
  name: 'App',
  components: {
    ThemeProvider,
  },
}
</script>

<style>
.app-container {
  background-color: var(--background-color);
  color: var(--text-color);
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition:
    background-color 0.5s ease,
    color 0.5s ease;
}

h1 {
  margin-bottom: 20px;
}

p {
  margin-top: 20px;
}
</style>
