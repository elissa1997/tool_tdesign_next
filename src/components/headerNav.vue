<script setup>
import {onMounted, ref} from 'vue'
import { useRouter, useRoute } from 'vue-router'

import {ModeDarkIcon, ModeLightIcon} from 'tdesign-icons-vue-next'

const theme = ref('light')
const route = useRoute()

const themeChange = (val) => {
  console.log(val)
  if (val === 'light') {
    theme.value = 'light'
    document.documentElement.removeAttribute("theme-mode");
  } else {
    theme.value = 'dark'
    document.documentElement.setAttribute("theme-mode", "dark");
  }
}
</script>

<template>
  <t-head-menu :value="route.path" @change="val => router.push(val)">
    <template #logo>
      <img src="@/assets/img/logo.png" class="logo" />
    </template>
    <t-menu-item value="/index">主页</t-menu-item>
    <template #operations>
      <t-radio-group variant="primary-filled" :default-value="theme" @change="themeChange">
        <t-radio-button value="light">
          <mode-light-icon :fill-color='["#ffbd2e","#ffbd2e"]' :stroke-color='["#ffbd2e","#ffbd2e"]' :stroke-width="2"/>
        </t-radio-button>
        <t-radio-button value="dark">
          <mode-dark-icon :fill-color='["#ffffff","#ffffff"]' :stroke-color='["#ffffff","#ffffff"]' :stroke-width="2"/>
        </t-radio-button>
      </t-radio-group>
    </template>
  </t-head-menu>
</template>

<style scoped lang="scss">
  .logo {
    width: auto;
    height: 30px;
    object-fit: cover;
  }
</style>