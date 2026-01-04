<script setup>
import {onMounted, ref} from 'vue'
import { useRouter } from 'vue-router';
import {MenuApplicationIcon, ModeDarkIcon, ModeLightIcon} from 'tdesign-icons-vue-next'

const theme = ref('light')
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

const navList = [
  {
    value: '/index',
    type: 'inner',
    label: '主页'
  },
  {
    value: 'https://smartping.makedream.site/',
    type: 'outer',
    label: '网络监测'
  },
  {
    value: 'https://pan.makedream.site/',
    type: 'outer',
    label: '存储'
  }
]
const router = useRouter()
const menuClick = (item) => {
  if (item.type === 'inner') {
    router.push(item.value)
  } else {
    window.open(item.value)
  }
}

const mobileNavOpen = ref(false)
</script>

<template>

  <div class="nav">
    <img src="@/assets/img/logo.png" class="logo" />

    <div class="navWarp" :class="mobileNavOpen? 'mobileNavOpen':'mobileNavClose'">
      <div class="navItem" v-for="item in navList" :key="item.value" @click="menuClick(item)">{{item.label}}</div>
    </div>

    <div class="meta">
      <t-radio-group variant="primary-filled" :default-value="theme" @change="themeChange">
        <t-radio-button value="light">
          <mode-light-icon :fill-color='["#ffbd2e","#ffbd2e"]' :stroke-color='["#ffbd2e","#ffbd2e"]' :stroke-width="2"/>
        </t-radio-button>
        <t-radio-button value="dark">
          <mode-dark-icon :fill-color='["#ffffff","#ffffff"]' :stroke-color='["#ffffff","#ffffff"]' :stroke-width="2"/>
        </t-radio-button>
      </t-radio-group>

      <div class="menuIcon" @click="mobileNavOpen = !mobileNavOpen">
        <menu-application-icon :stroke-width="2"/>
      </div>
    </div>
  </div>

</template>

<style scoped lang="scss">

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--td-comp-paddingLR-l);
  box-sizing: border-box;
  height: $nav-height;

  position: relative;
  z-index: 10;

  @include respond-to('phone') {
    background-color: var(--nav-bg);
  }

  @include respond-to('desktop') {
    background-color: var(--nav-bg);
    backdrop-filter: blur(7px);
  }
  .logo {
    transition: all .3s ease-in-out;
    width: auto;
    object-fit: cover;

    @include respond-to('phone') {
      height: 20px;
    }

    @include respond-to('desktop') {
      height: 30px;
    }
  }

  .mobileNavOpen {
    @include respond-to('phone') {
      top: $nav-height;
    }
  }

  .mobileNavClose {
    @include respond-to('phone') {
      top: calc(#{$nav-height} - 100vh);
    }
  }

  .navWarp {
    @include respond-to('phone') {
      display: flex;
      align-items: center;
      flex-direction: column;
      position: absolute;
      left: 0px;
      width: 100%;
      height: calc(100vh - #{$nav-height});
      overflow-y: auto;
      background-color: var(--nav-bg);
      backdrop-filter: blur(7px);
      padding: var(--td-comp-paddingTB-m) 0;
      box-sizing: border-box;
      border-top: solid 1px var(--td-component-border);
      transition: all .3s ease-in-out;
      z-index: 2;
      .navItem {
        transition: all .3s ease-in-out;
        color: var(--td-text-color-primary);
        padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-l);
        box-sizing: border-box;
        border-radius: var(--td-radius-default);
        cursor: pointer;
        width: 100%;
      }
    }

    @include respond-to('desktop') {
      display: flex;
      align-items: center;
      padding: 0 var(--td-comp-paddingLR-xxl);
      margin-right: auto;

      .navItem {
        transition: all .3s ease-in-out;
        color: var(--td-text-color-primary);
        padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-l);
        box-sizing: border-box;

        border-radius: var(--td-radius-default);
        cursor: pointer;
      }

      .navItem:not(:last-of-type) {
        margin-right: 10px;
      }

      .navItem:hover {
        color: var(--nav-item-font-color);
        background-color: var(--nav-item-bg);
      }
    }
  }

  .meta {
    display: flex;
    z-index: 3;

    .menuIcon {
      color: var(--td-text-color-primary);
      @include respond-to('phone') {
        margin-left: var(--td-comp-margin-xl);
      }

      @include respond-to('desktop') {
        display: none;
      }
    }
  }


}
</style>