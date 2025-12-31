<template>
  <div ref="container" class="gradient-bg"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { GradientBackground } from './gradient'

const container = ref(null)
let instance = null

onMounted(() => {
  instance = new GradientBackground(container.value, 30)
})

onBeforeUnmount(() => {
  instance?.stop()
})
</script>

<style scoped lang="scss">
.gradient-bg {
  background-color: var(--td-bg-color-page);
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  //filter: blur(60px);
}
</style>
