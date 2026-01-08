<script setup>
import {onMounted, ref} from 'vue'
import gcoord from 'gcoord';
import {ApplicationIcon, DownloadIcon, FileAddIcon, FolderOpen1Icon, SwapIcon} from "tdesign-icons-vue-next";
import {MessagePlugin} from "tdesign-vue-next";

onMounted(() => {

})

const supportCRS = ref({
  columns: [
    { title: 'CRS', colKey: 'crs', width: 110 },
    { title: '坐标格式', colKey: 'format', width: 90 },
    { title: '说明', colKey: 'info', ellipsis: true },
  ],
  data: [
    {crs: 'WGS84', format: '[lng,lat]', info: 'WGS-84坐标系，GPS设备获取的经纬度坐标'},
    {crs: 'GCJ02', format: '[lng,lat]', info: 'GCJ-02坐标系，google中国地图、soso地图、aliyun地图、mapabc地图和高德地图所用的经纬度坐标'},
    {crs: 'BD09', format: '[lng,lat]', info: 'BD-09坐标系，百度地图采用的经纬度坐标'},
    {crs: 'BD09LL', format: '[lng,lat]', info: '同BD09'},
    {crs: 'BD09MC', format: '[x,y]', info: 'BD-09米制坐标，百度地图采用的米制坐标，单位：米'},
    {crs: 'BD09Meter', format: '[x,y]', info: '同BD09MC'},
    {crs: 'Baidu', format: '[lng,lat]', info: '百度坐标系，BD-09坐标系别名，同BD-09'},
    {crs: 'BMap', format: '[lng,lat]	', info: '百度地图，BD-09坐标系别名，同BD-09'},
    {crs: 'AMap', format: '[lng,lat]', info: '高德地图，同GCJ-02'},
    {crs: 'WebMercator', format: '[x,y]', info: '	Web Mercator投影，墨卡托投影，同EPSG3857，单位：米'},
    {crs: 'WGS1984', format: '[lng,lat]', info: 'WGS-84坐标系别名，同WGS-84'},
    {crs: 'EPSG4326', format: '[lng,lat]', info: 'WGS-84坐标系别名，同WGS-84'},
    {crs: 'EPSG3857', format: '[x,y]', info: 'Web Mercator投影，同WebMercator，单位：米'},
    {crs: 'EPSG900913', format: '[x,y]', info: 'Web Mercator投影，同WebMercator，单位：米'},

  ]
})

const fileInput = ref(null)

const transType = ref('coord')

const fromCoord = ref({
  crs: "WGS84",
  coord: undefined,
  geojson: null,
  fileName: ''
})

const toCoord = ref({
  crs: "WebMercator",
  coord: undefined,
  geojson: null,
  fileName: ''
})

const openFilePicker = () => {
  fileInput.value?.click()
}

const onFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  fromCoord.value.fileName = file.name
  fromCoord.value.geojson = JSON.parse(await file.text())
}

const buildOutName = (name) => {
  return name.replace(/\.geojson$|\.json$/i, '') + '_converted.geojson'
}

const downloadJSON = () => {
  const blob = new Blob(
      [JSON.stringify(toCoord.value.geojson, null, 2)],
      { type: 'application/geo+json;charset=utf-8' }
  )

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = toCoord.value.fileName
  a.click()
  URL.revokeObjectURL(url)
}

const switchCrs = () => {
  if (fromCoord.value.crs !== toCoord.value.crs) {
    let temp = toCoord.value.crs;
    toCoord.value.crs = fromCoord.value.crs;
    fromCoord.value.crs = temp;
  }
}

const transCoord = () => {
  console.log('开始转换', transType.value)
  if (transType.value === 'coord') {
    if(fromCoord.value.coord === undefined || fromCoord.value.coord === ''){
      MessagePlugin.error('请输入原始坐标');
    }else{
      let fromCoord = fromCoord.value.coord.split(',');
      let result = gcoord.transform(fromCoord, gcoord[fromCoord.value.crs], gcoord[toCoord.value.crs]);
      toCoord.value.coord = result.join(',');
    }
  }else if (transType.value === 'file') {
    if(fromCoord.value.geojson === null){
      MessagePlugin.error('请选择原始文件');
    }else{
      let result = gcoord.transform(fromCoord.value.geojson, gcoord[fromCoord.value.crs], gcoord[toCoord.value.crs]);
      toCoord.value.geojson = result;
      toCoord.value.fileName = buildOutName(fromCoord.value.fileName);
      console.log('转换结果', toCoord.value)
    }
  }
}


</script>

<template>
  <div class="contaner">
    <div class="coord">
      <div class="tool-title">坐标转换</div>

      <div class="tips-warp">
        <t-collapse expandIcon>
          <t-collapse-panel header="🚨在发布、展示、传播数据时，请务必遵守相关法律规定">
            <div class="law">
              <div class="main">未经批准擅自建立相对独立的平面坐标系统，或者采用不符合国家标准的基础地理信息数据建立地理信息系统的，给予警告，责令改正，可以并处五十万元以下的罚款；对直接负责的主管人员和其他直接责任人员，依法给予处分。</div>
              <div class="quote">—— 中华人民共和国测绘法（2017） ，52</div>
            </div>

            <div class="law">
              <div class="main">导航电子地图在公开出版、销售、传播、展示和使用前，必须进行空间位置技术处理。</div>
              <div class="quote">—— GB 20263―2006《导航电子地图安全处理技术基本要求》，4.1</div>
            </div>
          </t-collapse-panel>

          <t-collapse-panel header="🌐目标支持的坐标系">
            <t-table
                rowKey="crs"
                :data="supportCRS.data"
                :columns="supportCRS.columns"
                :stripe="false"
                :bordered="true"
                :hover="false"
                size="small"
                table-layout="fixed"
                :footerAffixedBottom="true"
                :showHeader="true"
                cellEmptyContent="-"
            >
            </t-table>
          </t-collapse-panel>
        </t-collapse>
      </div>

      <div class="trans-warp">
        <div class="crs-warp">
          <div class="title">原始坐标系</div>
          <t-select class="select" v-model="fromCoord.crs">
            <t-option v-for="crsObj in supportCRS.data" :key="crsObj.crs" :label="crsObj.crs" :value="crsObj.crs" />
          </t-select>
          <t-input v-if="transType === 'coord'" v-model="fromCoord.coord" clearable placeholder="使用英文逗号分隔"/>
          <input
              ref="fileInput"
              type="file"
              accept=".json,.geojson"
              style="display: none"
              @change="onFileChange"
          />
          <t-button v-if="transType === 'file'" block theme="default" variant="outline" @click="openFilePicker">
            <template #icon><folder-open-1-icon /></template>
            {{fromCoord.fileName || '打开geojson文件'}}
          </t-button>
        </div>

        <div class="btn-warp">

          <t-radio-group variant="primary-filled" v-model="transType">
            <t-radio-button value="coord">坐标转换</t-radio-button>
            <t-radio-button value="file">文件转换</t-radio-button>
          </t-radio-group>

          <t-button theme="default" @click="switchCrs">
            <template #icon><swap-icon /></template>交换
          </t-button>

          <t-button @click="transCoord">
            <template #icon><application-icon /></template>开始转换
          </t-button>
        </div>

        <div class="crs-warp">
          <div class="title">目标坐标系</div>
          <t-select class="select" v-model="toCoord.crs">
            <t-option v-for="crsObj in supportCRS.data" :key="crsObj.crs" :label="crsObj.crs" :value="crsObj.crs" />
          </t-select>
          <t-input v-if="transType === 'coord'" v-model="toCoord.coord" clearable placeholder="使用英文逗号分隔"/>
          <t-button v-if="transType === 'file'" block theme="default" variant="outline" :disabled="!toCoord.geojson" @click="downloadJSON">
            <template #icon><download-icon /></template>
            {{toCoord.fileName && toCoord.geojson ? `下载${toCoord.fileName}`:`等待转换`}}
          </t-button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped lang="scss">
.contaner {
  @include container;

  .coord {
    @include container-inner;
  }

  .tips-warp {
    margin-right: auto;
    margin-left: auto;
    @include respond-to('phone') { width: 100%; }
    @include respond-to('desktop') { width: 800px; }

    :deep(.t-collapse) {
      border-radius: var(--td-radius-medium);

    }
    .law {
      .main {
        font-size: var(--td-font-size-mark-medium);
      }

      .quote {
        font-size: var(--td-font-size-link-small);
        color: var(--td-text-color-disabled);
        margin-left: var(--td-comp-margin-s);
      }
    }

    .law:not(:last-of-type) {
      margin-bottom: var(--td-comp-margin-m);
    }
  }

  .trans-warp {
    margin-top: var(--td-comp-margin-xl);
    @include respond-to('phone') {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      gap: var(--td-size-6);
    }

    @include respond-to('desktop') {
      width: 800px;
      margin-right: auto;
      margin-left: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .crs-warp {
      @include respond-to('phone') { width: 100%; }
      @include respond-to('desktop') { width: calc((100% - 25% - (var(--td-size-2) * 2)) / 2); }

      display: flex;
      flex-direction: column;
      align-items: start;
      justify-content: space-between;
      gap: var(--td-size-4);

      padding: var(--td-size-4);
      box-sizing: border-box;
      border-radius: var(--td-radius-medium);
      background-color: var(--td-bg-color-container);

      .title {
        font-size: var(--td-font-size-body-medium);
        color: var(--td-text-color-primary);
      }
    }

    .btn-warp {
      @include respond-to('phone') { width: 100%; }
      @include respond-to('desktop') { width: 25%; }

      display: flex;
      gap: var(--td-size-4);
      flex-direction: column;
      align-items: center;
      justify-content: space-between;

      //padding: var(--td-size-4);
      //box-sizing: border-box;
      //border-radius: var(--td-radius-medium);
      //background-color: var(--td-bg-color-container);
    }
  }
}
</style>
