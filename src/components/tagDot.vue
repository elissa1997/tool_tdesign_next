<script setup>
import { computed } from 'vue'

const props = defineProps({
  theme: {
    type: String,
    default: 'primary'
  },
  size: {
    type: [Number, String],
    default: 8
  }
})

const colors = {
  primary: '--td-brand-color',
  success: '--td-success-color',
  warning: '--td-warning-color',
  error: '--td-error-color'
}

const dotStyle = computed(() => {
  const cssVar = colors[props.theme] || colors.primary
  const size = typeof props.size === 'number' ? `${props.size}px` : props.size

  return {
    '--dot-color': `var(${cssVar})`,
    '--dot-size': size
  }
})
</script>

<template>
  <span class="tagDot" :style="dotStyle"></span>
</template>

<style scoped lang="scss">
.tagDot {
  position: relative;
  display: inline-block;
  width: var(--dot-size);
  height: var(--dot-size);
  border-radius: 50%;
  background-color: var(--dot-color);
  vertical-align: middle;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background-color: var(--dot-color);
    animation: tag-dot-ripple 1.6s ease-out infinite;
  }
}

@keyframes tag-dot-ripple {
  0% {
    transform: scale(1);
    opacity: 0.45;
  }

  70% {
    transform: scale(2.8);
    opacity: 0;
  }

  100% {
    transform: scale(2.8);
    opacity: 0;
  }
}
</style>
