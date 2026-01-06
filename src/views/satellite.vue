<script setup>
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import {FY4AImgLayer, TDTBaseLayer} from "@/util/layer.js";
import {onMounted, ref} from "vue";
import {staticFile} from "@/api/public.js";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(utc)
dayjs.extend(customParseFormat)

let map = null;
let IMGLayer = null;
let satelliteList = ref(null)
const selected = ref({
  timeLength: 0,
  timeCurrent: 0,
  type: "FY4B_CHINA_AGRI_72H",
  opacity: 90
})

onMounted(() => {
  initMap();
  getSatelliteList()
})
// 初始化地图
const initMap = () => {
  map = L.map('mapWarp',{
    crs: L.CRS.EPSG4326, // 设置坐标系
    center: [33.755000, 117.408142], // 地图中心
    zoom: 5,   //缩放比列
    zoomControl: false, //禁用 + - 按钮
    doubleClickZoom: false,  // 禁用双击放大
    attributionControl: false  // 移除右下角leaflet标识
  });

  TDTBaseLayer().forEach((baseLayer) => {
    map.addLayer(baseLayer);
  })
}

const getSatelliteList = async () => {
  await staticFile('/tool/remoteSensing/fileList.json').then(res => {
    if (res) {
      console.log(res)
      satelliteList.value = res;
    }
  })

  selected.value.timeLength = satelliteList.value[selected.value.type].list.length - 1;
  addFY4Alayer();
}

const addFY4Alayer = () => {
  let url = satelliteList.value[selected.value.type].list[selected.value.timeCurrent].url;
  IMGLayer = FY4AImgLayer(url, selected.value.type);
  map.addLayer(IMGLayer);
  IMGLayer.setOpacity(selected.value.opacity / 100);
}

const changeOpacity = () => {
  IMGLayer.setOpacity(selected.value.opacity / 100);
}

const changeTime = () => {
  let url = satelliteList.value[selected.value.type].list[selected.value.timeCurrent].url;
  IMGLayer.setUrl(url);
}

const changeType = () => {
  selected.value.timeCurrent = 0;
  selected.value.timeLength = satelliteList.value[selected.value.type].list.length;
  let url = satelliteList.value[selected.value.type].list[selected.value.timeCurrent].url;
  IMGLayer.setUrl(url);
}

</script>

<template>
  <div class="contaner">
    <div class="satellite">

      <div class="tool-title">卫星云图</div>

      <div class="mapWarp" id="mapWarp"></div>

      <div class="operat">
        <t-select class="type" v-model="selected.type" @change="changeType">
          <t-option key="FY4A_CHINA_LMI" label="闪电成像LMI" value="FY4A_CHINA_LMI" />
          <t-option key="FY4B_CHINA_AGRI_72H" label="多通道成像AGRI" value="FY4B_CHINA_AGRI_72H" />
        </t-select>

        <div class="opacity slider">
          <span>透明度</span>
          <t-slider v-model="selected.opacity" :min="0" :max="100" @changeEnd="changeOpacity"/>
        </div>

        <div class="time slider">
          <span>时间</span>
          <div class="timeStr" v-if="satelliteList">
            {{dayjs.utc(satelliteList[selected.type].list[selected.timeCurrent].time, 'YYYY-MM-DD HH-mm (UTC)').format('YY-MM-DD HH:mm')}}
          </div>
          <t-slider
              v-model="selected.timeCurrent"
              :min="0" :max="selected.timeLength"
              @changeEnd="changeTime"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped lang="scss">
.contaner {
  @include container;
  .satellite {
    @include container-inner;

    .mapWarp {
      border-radius: var(--td-radius-medium);
      width: 100%;
      @include respond-to('phone') {
        height: calc(100% - 128px - $title-height);
      }

      @include respond-to('desktop') {
        height: calc(100% - 68px - $title-height);
      }
    }

    .operat {
      .slider {
        display: flex;
        align-items: center;
        width: 100%;

        background-color: var(--td-bg-color-container);
        border-radius: var(--td-radius-medium);
        padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-s);
        box-sizing: border-box;

        span {
          font-size: var(--td-font-size-body-medium);
          color: var(--td-text-color-primary);
          width: var(--td-size-14);
        }

        :deep(.t-slider__container) {
          width: calc(100% - var(--td-size-14));
        }
      }

      .time {
        justify-content: space-between;

        span {
          width: var(--td-size-9);
        }

        .timeStr {
          width: 90px;
          text-align: center;
          font-size: var(--td-font-size-link-small);
          color: var(--td-text-color-secondary);
          line-height: 100%;
        }
        :deep(.t-slider__container) {
          width: calc(100% - var(--td-size-9) - 90px - 30px);
        }
      }
      @include respond-to('phone') {
        padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingLR-xs);
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--td-size-4);


        .type {
          flex: 1;
        }

        .opacity {
          flex: 1;
        }

        .time {
          flex: 1;
        }
      }

      @include respond-to('desktop') {
        padding: var(--td-comp-paddingTB-l) var(--td-comp-paddingLR-xs);
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: var(--td-size-7);


        .type {
          flex: 1;
        }

        .opacity {
          flex: 1;
        }

        .time {
          flex: 3;
        }
      }
    }
  }
}
</style>