<script setup>
import svgIcon from '@/components/SvgIcon.vue'
const toolList = [
  {
    name: 'satellite',
    title: '卫星云图',
    icon: 'satellite',
    public: true,
    describe: '缓存风云4号AGRI载荷可见光通道、LMI载荷对地观测数据，数据来源国家卫星气象中心'
  },
  {
    name: 'coord',
    title: '坐标转换',
    icon: 'coord',
    public: true,
    describe: '提供GCJ-02、BD09、WebMercator、WGS1984等坐标系互转'
  },
  {
    name: 'monitor',
    title: '服务监测',
    icon: 'monitor',
    public: true,
    describe: '服务器系统状态，宿主机服务与Docker状态，国际网络链路 可视化检测'
  },
  {
    name: 'clipboard',
    title: '剪贴板',
    icon: 'clipboard',
    public: true,
    describe: '在线可加密网络剪贴板，跨平台、跨设备复制粘贴'
  },
  {
    name: 'waterline',
    title: '水路图',
    icon: 'waterline',
    public: false,
    describe: '仅内部使用，水路拓扑图速查'
  },
]

</script>

<template>

  <div class="index">
    <t-row :gutter="[20, 24]">
      <t-col :xs="12" :sm="6" :md="6" :lg="4" :xl="4"  v-for="item in toolList" :key="item.name">

        <div class="card">
          <div class="header">
            <svgIcon class="icon" :name="item.icon" :shadow="true"/>
            <div class="name">{{ item.title }}</div>
            <t-tag :theme="item.public ? 'success' : 'warning'" size="small" variant="light" style="margin-left: auto">{{item.public ? 'Public' : 'Private'}}</t-tag>
          </div>

          <div class="body">
            <div class="describe">{{ item.describe }}</div>
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
      padding: var(--td-size-12) calc((100% - 1040px) / 2);
    }

    box-sizing: border-box;
    .card {
      width: 100%;
      padding: var(--td-pop-padding-xxl);
      box-sizing: border-box;
      border-radius: var(--td-radius-medium);
      background-color: var(--td-bg-color-container);
      border: 1px solid var(--td-brand-color-2);
      box-shadow: var(--card-shadow);
      transition: all .3s ease-in-out;
      cursor: pointer;
      .header {
        display: flex;
        align-items: center;
        .icon {
          width: 40px;
          height: 40px;
          color: var(--home-icon);
          margin-right: var(--td-comp-paddingLR-l);
        }

        .name {
          color: var(--td-text-color-primary);
          font-size: var(--td-font-size-title-large);
          font-weight: bold;
        }
      }

      .body {
        .describe {
          margin-top: var(--td-comp-margin-l);
          height: 40px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2; /* 限制为3行 */
          -webkit-box-orient: vertical;

          font-size: var(--td-font-size-link-small);
          color: var(--td-text-color-secondary);
        }
      }
    }

    .card:hover {
      box-shadow: var(--card-shadow-hover);
    }
  }
</style>