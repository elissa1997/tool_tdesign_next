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
    <t-row v-td-row-fix :gutter="[20, 24]">
      <t-col :xs="12" :sm="6" :md="3" :lg="3" :xl="3"  v-for="item in toolList" :key="item.name">

        <div class="card">
          <div class="header">
            <svgIcon class="icon" :name="item.icon"/>
            <div class="name">{{ item.title }}</div>
          </div>

          <div class="body">

          </div>
        </div>

      </t-col>
    </t-row>


  </div>
</template>

<style scoped lang="scss">
  .index {
    @include respond-to('phone') {
      padding: var(--td-pop-padding-xl);
    }

    @include respond-to('desktop') {
      padding: var(--td-size-12) var(--td-size-16);
    }

    box-sizing: border-box;
    .card {
      width: 100%;
      padding: var(--td-pop-padding-xxl);
      box-sizing: border-box;
      border-radius: var(--td-radius-medium);
      background-color: var(--td-bg-color-container);
      border: 1px solid var(--td-brand-color-2);
      .header {
        display: flex;
        align-items: center;
        .icon {
          width: 40px;
          height: 40px;
          color: var(--td-brand-color-8);
          margin-right: var(--td-comp-paddingLR-l);
        }

        .name {
          color: var(--td-text-color-primary);
          font-size: var(--td-font-size-title-large);
          font-weight: bold;
        }
      }


    }
  }
</style>