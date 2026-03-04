<script setup>
import { onBeforeUnmount, onMounted, ref, nextTick } from "vue";
import dayjs from "dayjs";
import { staticFile, smartPingApi } from "@/api/public.js";
import * as echarts from "echarts";
import { gaugeChartOption, lineChartOption } from "@/util/chartConfig.js";
import {RefreshIcon, TimeIcon} from "tdesign-icons-vue-next";
import SvgIcon from "@/components/SvgIcon.vue";

let latestData = ref(null);
const systemctlCol = [
  { title: "服务名称", colKey: "name", width: "30%",align: "center" },
  { title: "活动状态", colKey: "active", width: "30%", align: "center" },
  { title: "服务状态", colKey: "sub", width: "30%", align: "center" }
]

const dockerCol = [
  { title: "容器名称", colKey: "name", align: "center" },
  { title: "运行状态", colKey: "status", align: "center" },
  { title: "CPU(%)", colKey: "cpu_pct", width: "20%", align: "center" },
  { title: "内存(%)", colKey: "mem_usage", width: "20%", align: "center" },
]

let smartPingData = ref([
  { name: "GitHub Asia", addr: "20.205.243.166", data: null },
  { name: "CN2 Chicago", addr: "66.102.247.84", data: null },
  { name: "IBM Quad9", addr: "9.9.9.9", data: null },
]);

// 统一管理实例（key 与 domRef 一一对应）
let echartsInstance = {
  host_cpu: null,
  host_mem: null,
  host_disk: null,
  network_1: null,
  network_2: null,
  network_3: null,
};

const refChartCpu = ref(null);
const refChartMem = ref(null);
const refChartDisk = ref(null);
const refChartNetwork1 = ref(null);
const refChartNetwork2 = ref(null);
const refChartNetwork3 = ref(null);

// ====== 全局 resize：requestAnimationFrame 合帧 ======
let rafId = 0;
let themeObserver = null;

const getEchartsTheme = () =>
    document.documentElement.getAttribute("theme-mode") === "dark" ? "dark" : null;

const resizeAllCharts = () => {
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    Object.values(echartsInstance).forEach((chart) => {
      if (!chart) return;
      const dom = chart.getDom?.();
      if (!dom) return;
      const { width, height } = dom.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      chart.resize();
    });
  });
};

const onWindowResize = () => resizeAllCharts();

// ====== 数据请求 ======
const getMonitorData = async () => {
  let statueString = "";
  let today = dayjs().format("YYYY-MM-DD");

  await staticFile(`/tool/json/monitor/metrics-${today}.jsonl`).then((res) => {
    if (res) statueString = res;
  });

  const lines = statueString.trim().split("\n");
  const data = lines.map((line) => JSON.parse(line));
  latestData.value = data[data.length - 1];

  // systemd map -> array
  const systemdObj = latestData.value.systemd;
  latestData.value.systemd = [];
  for (const key in systemdObj) {
    latestData.value.systemd.push({ name: key, ...systemdObj[key] });
  }
};

const getSmartPingData = async () => {
  const reqs = smartPingData.value.map((item) => smartPingApi({ ip: item.addr }));
  const res = await Promise.all(reqs);
  smartPingData.value.forEach((item, index) => {
    item.data = res[index];
  });
};

// ====== 图表工具函数（抽象重复） ======
const chartRefsMap = () => ({
  host_cpu: refChartCpu,
  host_mem: refChartMem,
  host_disk: refChartDisk,
  network_1: refChartNetwork1,
  network_2: refChartNetwork2,
  network_3: refChartNetwork3,
});

const disposeCharts = (keys) => {
  const list = keys?.length ? keys : Object.keys(echartsInstance);
  list.forEach((k) => {
    echartsInstance[k]?.dispose();
    echartsInstance[k] = null;
  });
};

const initChart = (key, domRef) => {
  if (!domRef?.value) return null;
  const theme = getEchartsTheme();
  const ins = echarts.init(domRef.value, theme);
  echartsInstance[key] = ins;
  return ins;
};

const setGauge = (chart, title, value) => {
  if (!chart) return;
  chart.setOption(gaugeChartOption(title, value));
};

const setLine = (chart, title, lastcheck, avgdelay, losspk) => {
  if (!chart) return;
  chart.setOption(lineChartOption(title, lastcheck, avgdelay, losspk));
};

// ====== renderChart：只负责「根据当前数据渲染」 ======
const renderChart = () => {
  if (!latestData.value) return;

  // 主题变化或刷新时，直接全量重建（简单稳定）
  disposeCharts();

  const refs = chartRefsMap();

  // init
  const cpu = initChart("host_cpu", refs.host_cpu);
  const mem = initChart("host_mem", refs.host_mem);
  const disk = initChart("host_disk", refs.host_disk);
  const n1 = initChart("network_1", refs.network_1);
  const n2 = initChart("network_2", refs.network_2);
  const n3 = initChart("network_3", refs.network_3);

  // setOption
  setGauge(cpu, "CPU使用率", latestData.value.cpu.usage_pct);
  setGauge(mem, "内存使用率", latestData.value.mem.usage_pct);
  setGauge(disk, "磁盘使用率", latestData.value.disk.usage_pct);

  const d1 = smartPingData.value?.[0]?.data;
  const d2 = smartPingData.value?.[1]?.data;
  const d3 = smartPingData.value?.[2]?.data;

  if (d1) setLine(n1, smartPingData.value[0].name, d1.lastcheck, d1.avgdelay, d1.losspk);
  if (d2) setLine(n2, smartPingData.value[1].name, d2.lastcheck, d2.avgdelay, d2.losspk);
  if (d3) setLine(n3, smartPingData.value[2].name, d3.lastcheck, d3.avgdelay, d3.losspk);
};

// ====== 1) 初始化/刷新统一入口 ======
const initOrRefresh = async () => {
  await getMonitorData();
  await getSmartPingData();
  await nextTick();
  renderChart();
  resizeAllCharts();
};

// mount：调用一次 initOrRefresh + 绑定监听
onMounted(async () => {
  await initOrRefresh();

  window.addEventListener("resize", onWindowResize, { passive: true });

  themeObserver = new MutationObserver((mutations) => {
    if (mutations.some((m) => m.attributeName === "theme-mode")) {
      // 主题变化：重渲染 + resize
      renderChart();
      resizeAllCharts();
    }
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["theme-mode"],
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onWindowResize);
  cancelAnimationFrame(rafId);
  themeObserver?.disconnect();
  themeObserver = null;
  disposeCharts();
});

</script>

<template>
  <div class="contaner">
    <div class="monitor" v-if="latestData">
      <div class="tool-title">服务监测</div>

      <t-row :gutter="[8,8]">
        <!--      主机信息      -->
        <t-col :xs="12" :sm="12" :md="6" :lg="4" :xl="4">
          <div class="card host">
            <div class="cardTitle">主机状态</div>
            <t-row :gutter="[6,6]" style="height: 100%">
              <t-col  class="chartWarp" :xs="6" :sm="6" :md="3" :lg="3" :xl="3">
                <div class="chart" ref="refChartCpu"></div>
                <t-statistic class="statistic" :value="latestData.cpu.usage_pct" unit="%" />
                <div class="title">
                  <svgIcon class="icon" name="cpu" :shadow="true"/>
                  <span>CPU</span>
                </div>
              </t-col>

              <t-col  class="chartWarp" :xs="6" :sm="6" :md="3" :lg="3" :xl="3">
                <div class="chart" ref="refChartMem"></div>
                <t-statistic class="statistic" :value="latestData.mem.usage_pct" unit="%" />
                <div class="title">
                  <svgIcon class="icon" name="memory" :shadow="true"/>
                  <span>内存</span>
                </div>
              </t-col>

              <t-col  class="chartWarp" :xs="6" :sm="6" :md="3" :lg="3" :xl="3">
                <div class="chart" ref="refChartDisk"></div>
                <t-statistic class="statistic" :value="latestData.disk.usage_pct" unit="%" />
                <div class="title">
                  <svgIcon class="icon" name="harddrive" :shadow="true"/>
                  <span>硬盘</span>
                </div>
              </t-col>

              <t-col  class="chartWarp" :xs="6" :sm="6" :md="3" :lg="3" :xl="3">
                <div class="acme">
                  <t-statistic title="证书有效期" :value="latestData.https.certs[0].days_left" unit="天" />
                  <t-tag class="status" :theme="latestData.https.available? 'success' : 'danger'">{{latestData.https.available? '证书有效' : '证书过期'}}</t-tag>
                </div>
                <div class="title">
                  <svgIcon class="icon" name="certificate" :shadow="true"/>
                  <span>证书</span>
                </div>
              </t-col>
            </t-row>
          </div>
        </t-col>

        <!--      systemctl服务      -->
        <t-col :xs="12" :sm="12" :md="6" :lg="8" :xl="8">
          <div class="card systemctl">
            <div class="cardTitle">系统服务</div>
            <t-loading v-if="!latestData"/>
            <div class="tableWarp" v-else>
              <t-base-table row-key="name" :data="latestData.systemd" :columns="systemctlCol" height="100%" size="small">
                <template #active="{ col, row }">
                  <t-tag :theme="row.active === 'active'? 'success' : 'danger'">{{row.active}}</t-tag>
                </template>
                <template #sub="{ col, row }">
                  <t-tag :theme="row.sub === 'running'? 'success' : 'danger'">{{row.sub}}</t-tag>
                </template>
              </t-base-table>
            </div>
          </div>
        </t-col>

        <!--      Docker      -->
        <t-col :xs="12" :sm="12" :md="6" :lg="7" :xl="7">
          <div class="card docker">
            <div class="cardTitle">Docker容器</div>
            <t-loading v-if="!latestData"/>
            <div class="tableWarp" v-else>
              <t-base-table row-key="name" :data="latestData.docker.containers" :columns="dockerCol" height="100%" size="small">
                <template #status="{ col, row }">
<!--                  {{row.status.includes('Up')? '运行中' : '已停止'}}-->
                  <t-tag :theme="row.status.includes('Up')? 'success' : 'danger'">{{row.status}}</t-tag>
                </template>

                <template #cpu_pct="{ col, row }">
                  {{row.cpu_pct.trim().replace('%', '')}}
                </template>

                <template #mem_usage="{ col, row }">
                  {{(parseFloat(row.mem_usage.split('/')[0].trim().replace('MiB', '')) / parseFloat(row.mem_usage.split('/')[1].trim().replace('MiB', ''))).toFixed(2)}}
                </template>
              </t-base-table>
            </div>

          </div>
        </t-col>

        <!--      国际网络监测      -->
        <t-col :xs="12" :sm="12" :md="6" :lg="5" :xl="5">
          <div class="card globalNet">
            <div class="cardTitle">国际网络监测</div>
            <div class="chartWarp">
              <div class="chart" ref="refChartNetwork1"></div>
              <div class="chart" ref="refChartNetwork2"></div>
              <div class="chart" ref="refChartNetwork3"></div>
            </div>
          </div>
        </t-col>
      </t-row>

    </div>
  </div>

  <div class="operat">
    <div class="item" @click="initOrRefresh">
      <refresh-icon/>
      <div class="text">刷新</div>
    </div>
  </div>


</template>

<style scoped lang="scss">
.contaner {
  @include container;

  .monitor {
    @include container-inner;

    .card {
      padding: var(--td-pop-padding-m);
      box-sizing: border-box;
      border-radius: var(--td-radius-medium);
      background-color: var(--td-bg-color-container);

      .cardTitle {
        font-size: var(--td-font-size-body-large);
        font-weight: bold;
        color: var(--td-text-color-primary);
        padding-bottom: var(--td-comp-paddingTB-s);

      }
    }

    .host {
      .chartWarp {
        height: 180px;
        @include respond-to('phone') {
          height: 150px;
        }

        @include respond-to('desktop') {
          height: 180px;
        }
        text-align: center;
        .chart {
          height: calc(100% - 80px);
          width: 100%;
        }
        .statistic {
          height: 37px;
        }
        .title {
          margin-top: var(--td-comp-margin-s);
          display: flex;
          align-items: center;
          justify-content: center;
          .icon {
            width: 20px;
            height: 20px;
            color: var(--home-icon);
            margin-right: var(--td-comp-paddingLR-s);
          }

          span {
            font-size: var(--td-font-size-link-medium);
            line-height: 0;
            color: var(--td-text-color-secondary);
          }
        }

        .acme {
          height: calc(100% - 80px + 37px);
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          .status {
            margin-top: var(--td-comp-margin-l);
          }
        }
      }
    }

    .systemctl {
      .tableWarp {
        width: 100%;
        height: calc(180px - 2px);
        border-radius: var(--td-radius-medium);
        border: 1px solid var(--td-component-border);
        :deep(.t-table) {
          border-radius: var(--td-radius-medium);
          .t-table__content {
            border-radius: var(--td-radius-medium);
          }
        }
      }
    }

    .docker {
      .tableWarp {
        width: 100%;
        //height: calc(100vh - $nav-height - var(--td-size-12)*2 - 2px - $title-height - var(--td-pop-padding-m)*2 - 30px - 180px - 8px - var(--td-pop-padding-m)*2 - 30px - 8px - 16px);

        @include respond-to('phone') {
          height: 300px;
        }

        @include respond-to('desktop') {
          height: calc(100vh - $nav-height - var(--td-size-12)*2 - 2px - $title-height - var(--td-pop-padding-m)*2 - 30px - 180px - 8px - var(--td-pop-padding-m)*2 - 30px - 2px - 16px);
        }

        border-radius: var(--td-radius-medium);
        border: 1px solid var(--td-component-border);
        :deep(.t-table) {
          border-radius: var(--td-radius-medium);
          .t-table__content {
            border-radius: var(--td-radius-medium);
          }
        }
      }
    }

    .globalNet {
      .chartWarp {
        width: 100%;
        @include respond-to('phone') {
          height: 600px;
        }

        @include respond-to('desktop') {
          height: calc(100vh - $nav-height - var(--td-size-12)*2 - 2px - $title-height - var(--td-pop-padding-m)*2 - 30px - 180px - 8px - var(--td-pop-padding-m)*2 - 30px - 0px - 16px);
        }

        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 8px;
        .chart {
          height: 100%;
          width: 100%;
        }
      }
    }
  }
}

.operat {
  position: absolute;
  right: var(--td-size-12);
  bottom: var(--td-size-12);
  display: flex;
  padding: var(--td-pop-padding-m);
  box-sizing: border-box;
  background-color: var(--td-bg-color-container);
  border-radius: var(--td-radius-default);
  box-shadow: var(--td-shadow-2);
  .item {
    padding: var(--td-pop-padding-s);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    width: 60px;
    height: 60px;
    border-radius: var(--td-radius-default);
    color: var(--td-text-color-primary);
    transition: all 0.3s;
    &:hover {
      background-color: var(--td-bg-color-container-hover);
      color: var(--home-icon);
      .text {
        color: var(--home-icon);
      }
    }
    .text{
      font-size: var(--td-font-size-body-small);
      margin-top: var(--td-comp-margin-xs);
      color: var(--td-text-color-secondary);
      transition: all 0.3s;
    }
  }
}
</style>
