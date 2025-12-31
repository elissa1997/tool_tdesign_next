<script setup>
import svgIcon from '@/components/SvgIcon.vue'
const toolList = [
  {
    name: 'satellite',
    title: '卫星云图',
    icon: 'satellite'
  },
  {
    name: 'coord',
    title: '坐标转换',
    icon: 'coord'
  },
  {
    name: 'monitor',
    title: '服务监测',
    icon: 'monitor'
  },
  {
    name: 'clipboard',
    title: '剪贴板',
    icon: 'clipboard'
  },
]

</script>

<template>

  <div class="index">
    <div class="card" v-for="item in toolList" :key="item.name">
      <svgIcon class="icon" :name="item.icon"/>
      <div class="name">{{ item.title }}</div>
    </div>


  </div>
</template>

<style scoped lang="scss">
  .index {
    .card {
      .icon {
        width: 40px;
        height: 40px;
        color: #4fd6ff;
      }
    }
  }
</style>