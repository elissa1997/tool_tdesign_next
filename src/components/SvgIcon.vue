<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 20
  },
  color: {
    type: String,
    default: ''
  },
  shadow: {
    type: Boolean,
    default: false
  },
  shadowColor: {
    type: String,
    default: 'rgba(0,0,0,.25)'
  }
})

/**
 * ⚠️ 关键点：
 * 使用 import.meta.glob 批量加载 svg
 */
const svgModules = import.meta.glob(
    '@/assets/svgIcon/*.svg',
    { as: 'raw', eager: true }
)

const svgContent = computed(() => {
  const key = `/src/assets/svgIcon/${props.name}.svg`
  return svgModules[key] || ''
})

const sizeStyle = computed(() => {
  const val = typeof props.size === 'number'
      ? `${props.size}px`
      : props.size
  return {
    width: val,
    height: val
  }
})
</script>

<template>
  <span
      class="svg-icon"
      :class="{ 'has-shadow': shadow }"
      :style="{
      color: color || undefined,
      '--shadow-color': shadowColor
    }"
      v-html="svgContent"
  />
</template>

<style scoped lang="scss">
.svg-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  :deep(svg) {
    width: 100%;
    height: 100%;
    fill: none !important;        /* ⬅️ 核心 */
  }

  :deep(svg path) {
    fill: none !important;        /* ⬅️ 核心 */
    //stroke: currentColor;
  }

  &.has-shadow {
    :deep(svg) {
      filter: drop-shadow(0 2px 6px var(--shadow-color));
    }
  }
}
</style>
