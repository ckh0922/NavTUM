<template>
  <div class="mobile">
    <Header />
    <div class="content">
      <slot name="content"></slot>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import Header from '../components/Header.vue'
import Footer from '@/components/Footer.vue'
</script>
<style scoped>
/* 通用样式 */
.mobile {
  background-color: var(--background-color);
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  overflow:unset
}

.content {
  margin-top: 70px;
  padding: 15px;
  flex: 1; /* 使 content 区域填充剩余空间 */
}
</style>
