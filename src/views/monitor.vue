<script setup>
import { onBeforeUnmount, onMounted, ref, nextTick } from "vue";
import dayjs from "dayjs";
import { staticFile, smartPingApi } from "@/api/public.js";
import * as echarts from "echarts";
import { gaugeChartOption, lineChartOption } from "@/util/chartConfig.js";
import {RefreshIcon, TimeIcon} from "tdesign-icons-vue-next";
import SvgIcon from "@/components/SvgIcon.vue";
import TagDot from "@/components/tagDot.vue";
import {getAssetsImg} from "@/util/tool.js";

let latestData = ref(null);

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

const comDockerUsage = (item) => {
  let mem = parseFloat(item.mem_usage.split('/')[0].trim().replace('MiB', '')) / parseFloat(item.mem_usage.split('/')[1].trim().replace('MiB', ''))
  let cpu = parseFloat(item.cpu_pct.trim().replace('%', ''))
  return {
    mem: Math.round(mem * 100) / 100,
    cpu: Math.round(cpu * 100) / 100
  };
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
            <div class="listWarp" v-else>

              <div class="item" v-for="(item, index) in latestData.systemd" :key="item.name">
                <div class="title">
                  <svgIcon class="icon" name="powershell" :shadow="true"/>
                  <span class="text">{{item.name}}</span>
                </div>

                <div class="infoItem">
                  <tagDot :theme="item.active === 'active'? 'success' : 'danger'"/>
                  <span>{{item.active}}</span>
                </div>

                <div class="infoItem">
                  <tagDot :theme="item.sub === 'running'? 'success' : 'danger'"/>
                  <span>{{item.sub}}</span>
                </div>
              </div>
            </div>
          </div>
        </t-col>

        <!--      Docker      -->
        <t-col :xs="12" :sm="12" :md="6" :lg="7" :xl="7">
          <div class="card docker">
            <div class="cardTitle">Docker容器</div>
            <t-loading v-if="!latestData"/>
            <div class="listWarp">

              <div class="item" v-for="(item, index) in latestData.docker.containers" :key="item.id">
                <div class="baseInfo">
                  <img class="dockerIcon" :src="getAssetsImg('monitor_docker_icon.png')"/>
                  <div class="right">
                    <div class="name">{{item.name}}</div>
                    <div class="info">
                      <div class="infoItem">
                        <tagDot :theme="item.status.includes('Up')? 'success' : 'danger'"/>
                        <span>{{item.status.includes('Up')? '运行中' : '已停止'}}</span>
                      </div>

                      <div class="infoItem">
                        <t-tag :theme="item.status.includes('Up')? 'success' : 'danger'" size="small">{{item.status}}</t-tag>
                      </div>

                      <div class="infoItem">
                        <svgIcon class="icon" name="id" :shadow="true"/>
                        <span>{{item.id}}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="usage">
                  <div class="usageItem">
                    <div class="text">
                      <span>内存</span>
                      <span>{{comDockerUsage(item).mem}} %</span>
                    </div>
                    <t-progress theme="line" :color="{ from: '#0052D9', to: '#00A870' }" :percentage="comDockerUsage(item).mem" :status="'active'" :label="false"/>
                  </div>
                  <div class="usageItem">
                    <div class="text">
                      <span>CPU</span>
                      <span>{{comDockerUsage(item).cpu}} %</span>
                    </div>
                    <t-progress theme="line" :color="{ from: '#0052D9', to: '#00A870' }" :percentage="comDockerUsage(item).cpu" :status="'active'" :label="false"/>
                  </div>
                </div>
              </div>

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
      background-color: var(--card-glass-bg);
      border: 1px solid var(--td-brand-color-3);
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
      .listWarp {
        width: 100%;
        height: 180px;
        border-radius: var(--td-radius-medium);

        display: flex;
        align-items: center;
        gap: var(--td-size-6);
        .item {
          padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-m);
          box-sizing: border-box;
          background: var(--gradient-glass);
          border-radius: var(--td-radius-medium);
          border: 1px solid var(--gradient-border);
          width: 120px;
          height: 120px;

          .title {
            font-size: var(--td-font-size-body-large);
            display: flex;
            align-items: center;
            gap: var(--td-size-4);
            margin-bottom: var(--td-comp-margin-s);
          }

          .infoItem {
            font-size: var(--td-font-size-body-small);
            display: flex;
            align-items: center;
            gap: var(--td-size-3);
          }
        }
      }
    }

    .docker {
      .listWarp {
        width: 100%;
        @include respond-to('phone') {
          height: 300px;
        }

        @include respond-to('desktop') {
          height: calc(100vh - $nav-height - var(--td-size-12)*2 - 2px - $title-height - var(--td-pop-padding-m)*2 - 30px - 180px - 8px - var(--td-pop-padding-m)*2 - 30px - 2px - 16px - 4px);
        }
        overflow-y: auto;

        .item {
          border-radius: var(--td-radius-medium);
          border: 1px solid var(--gradient-border);
          padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-m);
          box-sizing: border-box;
          margin-bottom: var(--td-comp-margin-m);
          background: var(--gradient-glass);
          @include respond-to('phone') {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--td-size-6);
          }

          @include respond-to('desktop') {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .baseInfo {

            @include respond-to('phone') {
              width: 100%;
            }

            @include respond-to('desktop') {
              width: 360px;
            }
            display: flex;
            align-items: center;
            justify-content: space-between;

            .dockerIcon {
              object-fit: cover;
              @include respond-to('phone') {
                width: 30px;
                height: 30px;
              }

              @include respond-to('desktop') {
                width: 40px;
                height: 40px;
              }
            }

            .right {
              @include respond-to('phone') {
                width: calc(100% - 25px - var(--td-comp-margin-l));
              }

              @include respond-to('desktop') {
                width: calc(100% - 40px - var(--td-comp-margin-l));
              }
              .name {
                font-size: var(--td-font-size-body-large);
                margin-bottom: var(--td-comp-margin-m);
                font-weight: bold;
              }

              .info {
                display: flex;
                align-items: center;
                justify-content: space-between;
                .infoItem {
                  font-size: var(--td-font-size-body-small);
                  display: flex;
                  align-items: center;
                  gap: var(--td-size-3);
                }
              }
            }

          }

          .usage {
            @include respond-to('phone') {
              width: 100%;
            }
            @include respond-to('desktop') {
              width: calc(100% - 360px - 20px - var(--td-comp-paddingLR-m));
            }

            .usageItem {
              .text {
                font-size: var(--td-font-size-body-small);
                display: flex;
                align-items: center;
                justify-content: space-between;
              }
            }
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
          height: calc(100vh - $nav-height - var(--td-size-12)*2 - 2px - $title-height - var(--td-pop-padding-m)*2 - 30px - 180px - 8px - var(--td-pop-padding-m)*2 - 30px - 0px - 16px - 4px);
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
