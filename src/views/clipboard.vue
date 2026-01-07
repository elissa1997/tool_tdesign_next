<script setup>
import { ref } from "vue";
import {CheckRectangleIcon, ClearIcon, FileAddIcon, LockOffIcon, LockOnIcon, Share1Icon} from "tdesign-icons-vue-next";
import { encrypt, decrypt, DECRYPT_FAILED  } from '@/crypto/index.js'
import {MessagePlugin} from "tdesign-vue-next";

const cryptoData = ref({
  type: [
    { label: 'shift', value: 'shift' },
    { label: 'segment', value: 'segment' },
    { label: 'emoji', value: 'emoji' }
  ],
  isOn: true,
  typeSelected: 'shift'
})

// 输入
const inputText = ref('')
// 输出
const outputText = ref('')
// 密钥
const key = ref('')

const cryptoText = (type) => {
  if (!inputText.value) {
    MessagePlugin.warning('请输入内容');
     return
  }
  if (!key.value){
    MessagePlugin.warning('请输入密钥');
     return
  }
  if (type === 'enc') {
    outputText.value = encrypt(inputText.value, key.value, cryptoData.value.typeSelected)
  } else if (type === 'dec') {
    let result = decrypt(inputText.value, key.value, cryptoData.value.typeSelected)
    if (result === DECRYPT_FAILED) {
      MessagePlugin.warning('密钥错误或内容损坏')
    }else{
      outputText.value = result
    }
  }
}

</script>

<template>
  <div class="contaner">
    <div class="clipboard">
      <div class="tool-title">剪贴板</div>

        <div class="tool-bar type">
          <t-button block>
            <template #icon><file-add-icon /></template>
            创建
          </t-button>
          <t-button block>
            <template #icon><share-1-icon /></template>
            分享
          </t-button>
          <t-button block>
            <template #icon><check-rectangle-icon /></template>
            获取
          </t-button>
        </div>


      <div class="tool-bar crypto-warp">
        <div class="crypto-switch-warp">
          <div class="label">加解密</div>
          <t-switch v-model="cryptoData.isOn" />
        </div>

        <t-select v-model="cryptoData.typeSelected" class="type-select">
          <t-option v-for="type in cryptoData.type" :key="type.value" :label="type.label" :value="type.value" />
        </t-select>

        <t-button variant="outline" @click="cryptoText('enc')">
          <template #icon><lock-on-icon /></template>
          加密
        </t-button>

        <t-button variant="outline" @click="cryptoText('dec')">
          <template #icon><lock-off-icon /></template>
          解密
        </t-button>
      </div>


      <t-textarea v-model="inputText"  placeholder="请输入内容" />

      <t-textarea v-model="outputText" readonly placeholder="请输入内容" />

      <t-input v-model="key" placeholder="请输入密钥" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.contaner {
  @include container;

  .clipboard {
    @include container-inner;

    .tool-bar {


      @include respond-to('phone') {
        width: 100%;
        padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-s);
        margin-bottom: var(--td-comp-margin-s);
      }

      @include respond-to('desktop') {
        width: 600px;
        margin-left: auto;
        margin-right: auto;
        padding: var(--td-comp-paddingTB-xl) var(--td-comp-paddingLR-xl);
        margin-bottom: var(--td-comp-margin-xl);
      }

      background-color: var(--td-bg-color-container);
      border-radius: var(--td-radius-medium);
      box-sizing: border-box;

    }

    .type {
      display: flex;
      align-items: center;
      justify-content: space-around;
      @include respond-to('phone') {
        gap: var(--td-size-4);
        margin-bottom: var(--td-comp-margin-s);

      }

      @include respond-to('desktop') {
        gap: var(--td-size-10);
        margin-bottom: var(--td-comp-margin-xl);
      }
    }

    .crypto-warp {
      border: 1px solid var(--td-border-level-1-color);
      border-radius: var(--td-radius-medium);
      display: flex;
      align-items: center;
      justify-content: space-between;

      .crypto-switch-warp {
        display: flex;
        align-items: center;
        .label {
          font-size: var(--td-font-size-body-small);
          color: var(--td-text-color-primary);
          line-height: calc(var(--td-font-size-body-small) * 1.5);
          margin-right: var(--td-size-2);
        }
      }

      .type-select {
        width: 100px;
      }
    }
  }
}
</style>