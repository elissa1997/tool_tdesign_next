<script setup>
import { ref } from "vue";
import {
  CheckRectangleIcon,
  ClearIcon,
  FileAddIcon,
  LockOffIcon,
  LockOnIcon,
  SecuredIcon,
  Share1Icon
} from "tdesign-icons-vue-next";
import { encrypt, decrypt, DECRYPT_FAILED  } from '@/crypto/index.js'
import {MessagePlugin} from "tdesign-vue-next";

const cryptoData = ref({
  type: [
    { label: 'shift', value: 'shift' },
    { label: 'segment', value: 'segment' },
    { label: 'emoji', value: 'emoji' }
  ],
  isOn: false,
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
          <div class="btn-warp">
            <t-button>
              <template #icon><file-add-icon /></template>
              创建
            </t-button>
            <t-button>
              <template #icon><share-1-icon /></template>
              分享
            </t-button>
            <t-button>
              <template #icon><check-rectangle-icon /></template>
              获取
            </t-button>

            <t-button  :theme="cryptoData.isOn?'primary':'default'" shape="circle" variant="base" @click="cryptoData.isOn = !cryptoData.isOn"><secured-icon/></t-button>
          </div>

          <t-alert class="tips" theme="success" message="加解密功能已打开"  v-if="cryptoData.isOn"/>
        </div>


      <div class="tool-bar crypto-warp" v-if="cryptoData.isOn">

        <div class="line">
          <div class="form-warp crypto-algos">
            <div class="label">加密算法：</div>
            <t-select v-model="cryptoData.typeSelected" class="type-select">
              <t-option v-for="type in cryptoData.type" :key="type.value" :label="type.label" :value="type.value" />
            </t-select>
          </div>

          <t-button variant="outline" @click="cryptoText('enc')">
            <template #icon><lock-on-icon /></template>
            加密
          </t-button>

          <t-button variant="outline" @click="cryptoText('dec')">
            <template #icon><lock-off-icon /></template>
            解密
          </t-button>
        </div>

        <div class="line">
          <div class="form-warp crypto-key-input">
            <div class="label">密钥：</div>
            <t-input v-model="key" class="key-input" placeholder="请输入密钥" />
          </div>
        </div>

      </div>


      <div class="io-warp">

        <div class="text-area-warp">
          <div class="text-tool-bar">
            <div class="name">输入内容</div>
            <div class="btn-warp">
              <t-button size="small" theme="warning">清空</t-button>
            </div>
          </div>
          <t-textarea class="text-area" v-model="inputText" :autosize="{ minRows: 4, maxRows: 7}"  placeholder="请输入内容" />
        </div>

        <div class="text-area-warp" v-if="cryptoData.isOn">
          <div class="text-tool-bar">
            <div class="name">加密输出</div>
            <div class="btn-warp">
              <t-button size="small" theme="success">复制</t-button>
            </div>
          </div>
          <t-textarea class="text-area" v-model="outputText" :autosize="{ minRows: 4, maxRows: 7}" readonly/>
        </div>
      </div>

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

      .form-warp {
        display: flex;
        align-items: center;
        gap: var(--td-size-4);
        .label {
          font-size: var(--td-font-size-body-medium);
          color: var(--td-text-color-primary);
          width: 70px;
          text-align: start;
        }
      }

    }

    .type {
      border: 1px solid var(--td-border-level-1-color);
      .btn-warp{
        display: flex;
        align-items: center;
        justify-content: space-around;
        @include respond-to('phone') {
          gap: var(--td-size-4);
        }

        @include respond-to('desktop') {
          gap: var(--td-size-8);
        }
      }
      .tips {
        padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-l);
        @include respond-to('phone') {
          gap: var(--td-size-4);
          margin-top: var(--td-comp-margin-s);

        }

        @include respond-to('desktop') {
          gap: var(--td-size-8);
          margin-top: var(--td-comp-margin-xl);
        }
      }

    }

    .crypto-warp {
      border: 1px solid var(--td-border-level-1-color);
      border-radius: var(--td-radius-medium);
      //display: flex;
      //align-items: center;
      //justify-content: space-between;

      .line {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;

        @include respond-to('phone') { gap: var(--td-size-4); }
        @include respond-to('desktop') { gap: var(--td-size-8); }

        .crypto-algos {
          @include respond-to('phone') { width: calc(100% - 82px * 2 - var(--td-size-4) * 2); }
          @include respond-to('desktop') { width: calc(100% - 82px * 2 - var(--td-size-8) * 2); }
          .type-select {
            width: calc(100% - 70px - var(--td-size-4));
          }
        }

        .crypto-key-input {
          width: 100%;
          .key-input {
            width: calc(100% - 70px - var(--td-size-4));
          }
        }
      }

      .line:not(:last-of-type) {
        @include respond-to('phone') {
          margin-bottom: var(--td-comp-margin-s);

        }
        @include respond-to('desktop') {
          margin-bottom: var(--td-comp-margin-xl);
        }
      }
    }



    .io-warp {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--td-size-6);

      .text-area-warp {
        padding: var(--td-size-4);
        box-sizing: border-box;
        border-radius: var(--td-radius-medium);
        background-color: var(--td-bg-color-container);

        @include respond-to('phone') {
          width: 100%;
        }

        @include respond-to('desktop') {
          width: 600px;
        }

        .text-tool-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--td-comp-margin-s);
          .name {
            font-size: var(--td-font-size-body-small);
            color: var(--td-text-color-secondary);
          }
        }

        .text-area {
          width: 100%;
        }
      }
    }
  }
}
</style>
