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
      console.log(res)
      statueString = res;
    }
  })

  const lines = statueString.trim().split("\n");
  const data = lines.map(line => JSON.parse(line));

  latestData.value = data[data.length - 1];
}

</script>

<template>
  <div class="contaner">
    <div class="monitor">
      <div class="tool-title">服务监测</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.contaner {
  @include container;

  .monitor {
    @include container-inner;

  }
}
</style>
