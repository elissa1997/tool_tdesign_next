<script setup>
import {onMounted, ref} from "vue";
import dayjs from 'dayjs'
import { staticFile } from '@/api/public.js'

let latestData = ref('null');
let historyData = ref('null');

onMounted(() => {
  getMonitorData()
})

const getMonitorData = async () => {
  let statueString = '';
  let today = dayjs().format('YYYY-MM-DD');
  await staticFile(`/tool/json/monitor/metrics-${today}.jsonl`).then(res => {
    if (res) {
      statueString = res;
    }
  })

  const lines = statueString.trim().split("\n");
  const data = lines.map(line => JSON.parse(line));
  console.log(data);
  latestData.value = data[data.length - 1];
}

</script>

<template>
  <div class="contaner">
    <div class="monitor">
      <div class="tool-title">服务监测</div>

<!--      主机信息+systemctl服务-->
      <t-row :gutter="[8,8]">
        <t-col :xs="12" :sm="12" :md="6" :lg="4" :xl="4">
          <div class="card">Col</div>
        </t-col>
        <t-col :xs="12" :sm="12" :md="6" :lg="8" :xl="8">
          <div class="card">Col</div>
        </t-col>

        <t-col :xs="12" :sm="12" :md="6" :lg="7" :xl="7">
          <div class="card">Col</div>
        </t-col>

        <t-col :xs="12" :sm="12" :md="6" :lg="5" :xl="5">
          <div class="card">Col</div>
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
    }
  }
}
</style>
