<!-- src/views/View.vue -->
<template>
  <div class="footer">
    <nav class="footer-nav" aria-label="Footer">
        <a href="https://github.com/TUM-Dev/navigatum" target="_blank" class="footer-link"
          >Source Code</a
        >
    </nav>
  </div>
</template>

<style scoped>
/* 定义通用样式 */
.footer-nav {
  margin-bottom: -6px;
  text-align: center;
  padding: 2rem 2rem 2rem 3rem;
}


.footer-item {
  padding-bottom: 6px;
  font-size: 0.875rem;
  /* text-sm */
  line-height: 1.5rem;
  /* leading-6 */
}

.footer-link {
  background-color: transparent;
  color: #0038a8;
}

.footer-link:visited {
  color: #0038a8;
}

.footer-link:hover {
  text-decoration: underline;
}

.footer {
   background: var(--footer-background-color);
}
.dark-mode .footer {
   background: var(--footer-background-color);
}
</style>
