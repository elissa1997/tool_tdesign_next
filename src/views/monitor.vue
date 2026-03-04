<script setup>
import { onBeforeUnmount, onMounted, ref, nextTick } from "vue";
import dayjs from "dayjs";
import { staticFile, smartPingApi } from "@/api/public.js";
import * as echarts from "echarts";
import { gaugeChartOption, lineChartOption } from "@/util/chartConfig.js";
import SvgIcon from "@/components/SvgIcon.vue";

let latestData = ref(null);
let historyData = ref(null);

let smartPingData = ref([
  { name: 'GitHub Asia', addr: "20.205.243.166", data: null },
  { name: 'CN2 Chicago', addr: "66.102.247.84", data: null },
  { name: 'IBM Quad9', addr: "9.9.9.9", data: null },
]);

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

const systemctlCol = [
  { title: "服务名称", colKey: "name", width: "20%", },
  { title: "活动状态", colKey: "active", width: "20%", },
  { title: "服务状态", colKey: "sub", width: "20%", }
]

const dockerCol = [
  { title: "容器名称", colKey: "name", align: "center" },
  { title: "运行状态", colKey: "status", align: "center" },
  { title: "CPU", colKey: "cpu_pct", width: "20%", align: "center" },
  { title: "内存", colKey: "mem_usage", width: "20%", align: "center" },
]

// ====== 全局 resize：requestAnimationFrame 合帧 ======
let rafId = 0;
let themeObserver = null;

const getEchartsTheme = () =>
  document.documentElement.getAttribute("theme-mode") === "dark" ? "dark" : null;

const resizeAllCharts = () => {
  // 统一在下一帧 resize，避免一秒触发几十次
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    Object.values(echartsInstance).forEach((chart) => {
      if (!chart) return;

      // 可选：容器为 0 时跳过（如被 v-if/v-show 隐藏）
      const dom = chart.getDom?.();
      if (!dom) return;
      const { width, height } = dom.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;

      chart.resize();
    });
  });
};

const onWindowResize = () => {
  resizeAllCharts();
};

onMounted(async () => {
  await getMonitorData();
  await getSmartPingData();
  await nextTick(); // 确保 DOM/布局已完成
  renderChart();

  // 初次手动触发一次，避免首屏尺寸还没算准
  resizeAllCharts();

  // 全局监听
  window.addEventListener("resize", onWindowResize, { passive: true });
  themeObserver = new MutationObserver((mutations) => {
    if (mutations.some((m) => m.attributeName === "theme-mode")) {
      renderChart();
      resizeAllCharts();
    }
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["theme-mode"],
  });
});

const getMonitorData = async () => {
  let statueString = "";
  let today = dayjs().format("YYYY-MM-DD");

  await staticFile(`/tool/json/monitor/metrics-${today}.jsonl`).then((res) => {
    if (res) statueString = res;
  });

  const lines = statueString.trim().split("\n");
  const data = lines.map((line) => JSON.parse(line));
  latestData.value = data[data.length - 1];
  let systemdObj = latestData.value.systemd
  latestData.value.systemd = []
  for (const systemdObjKey in systemdObj) {
    latestData.value.systemd.push({name: systemdObjKey, ...systemdObj[systemdObjKey]})
  }
};

const getSmartPingData = async () => {
  let axiosArr = [];
  smartPingData.value.forEach((item) => {
    axiosArr.push(smartPingApi({ip: item.addr}))
  });
  await Promise.all(axiosArr).then((res) => {
    smartPingData.value.forEach((item, index) => {
      item.data = res[index]
    })
  });
};

const renderChart = () => {
  // 如果重复进入/切换路由回来，避免重复 init
  echartsInstance.host_cpu?.dispose();
  echartsInstance.host_mem?.dispose();
  echartsInstance.host_disk?.dispose();
  echartsInstance.network_1?.dispose();
  echartsInstance.network_2?.dispose();
  echartsInstance.network_3?.dispose();

  const theme = getEchartsTheme();
  echartsInstance.host_cpu = echarts.init(refChartCpu.value, theme);
  echartsInstance.host_mem = echarts.init(refChartMem.value, theme);
  echartsInstance.host_disk = echarts.init(refChartDisk.value, theme);
  echartsInstance.network_1 = echarts.init(refChartNetwork1.value, theme);
  echartsInstance.network_2 = echarts.init(refChartNetwork2.value, theme);
  echartsInstance.network_3 = echarts.init(refChartNetwork3.value, theme);

  echartsInstance.host_cpu.setOption(
      gaugeChartOption("CPU使用率", latestData.value.cpu.usage_pct)
  );
  echartsInstance.host_mem.setOption(
      gaugeChartOption("内存使用率", latestData.value.mem.usage_pct)
  );
  echartsInstance.host_disk.setOption(
      gaugeChartOption("磁盘使用率", latestData.value.disk.usage_pct)
  );
  echartsInstance.network_1.setOption(
      lineChartOption(smartPingData.value[0].name, smartPingData.value[0].data.lastcheck, smartPingData.value[0].data.avgdelay, smartPingData.value[0].data.losspk)
  );
  echartsInstance.network_2.setOption(
      lineChartOption(smartPingData.value[1].name, smartPingData.value[1].data.lastcheck, smartPingData.value[1].data.avgdelay, smartPingData.value[1].data.losspk)
  );
  echartsInstance.network_3.setOption(
      lineChartOption(smartPingData.value[2].name, smartPingData.value[2].data.lastcheck, smartPingData.value[2].data.avgdelay, smartPingData.value[2].data.losspk)
  );
};




onBeforeUnmount(() => {
  window.removeEventListener("resize", onWindowResize);
  cancelAnimationFrame(rafId);
  themeObserver?.disconnect();
  themeObserver = null;

  Object.values(echartsInstance).forEach((chart) => chart?.dispose());
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
            <div class="tableWarp">
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
            <div class="tableWarp">
              <t-base-table row-key="name" :data="latestData.docker.containers" :columns="dockerCol" size="small">
                <template #cpu_pct="{ col, row }">
                  {{row.cpu_pct.trim().replace('%', '')}}
                </template>

                <template #mem_usage="{ col, row }">
                  {{(row.mem_usage.split('/')[0].trim().replace('MiB', '') / 1907.349).toFixed(2)}}
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
        height: 180px;
      }
    }

    .docker {
      .tableWarp {
        width: 100%;
        height: calc(100vh - $nav-height - var(--td-size-12)*2 - 2px - $title-height - var(--td-pop-padding-m)*2 - 22px - 180px - 8px - var(--td-pop-padding-m)*2 - 22px - 16px);
      }
    }

    .globalNet {
      .chartWarp {
        width: 100%;
        @include respond-to('phone') {
          height: 600px;
        }

        @include respond-to('desktop') {
          height: calc(100vh - $nav-height - var(--td-size-12)*2 - 2px - $title-height - var(--td-pop-padding-m)*2 - 22px - 180px - 8px - var(--td-pop-padding-m)*2 - 22px - 16px);
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
</style>
