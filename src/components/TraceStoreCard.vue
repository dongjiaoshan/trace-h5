<template>
  <!-- 销售门店卡（果蔬 / 猪肉追溯共用）：绿描边卡 + 门头照 + 名称/地址 + 底部店长微信二维码块 -->
  <div v-if="show" class="sc">
    <TraceSectionTitle title="销售门店" />
    <img class="sc__img" :src="image" alt="门店" />
    <div class="sc__rows">
      <div v-if="store?.name" class="sc__row">
        <svg class="sc__ic" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2f7c44" stroke-width="1.6" stroke-linejoin="round"><path d="M4 9 L5 4 H19 L20 9 M4 9 V20 H20 V9 M4 9 H20" /></svg>
        <span class="sc__k">门店名称：</span><span>{{ store.name }}</span>
      </div>
      <div v-if="store?.address" class="sc__row">
        <svg class="sc__ic" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2f7c44" stroke-width="1.6" stroke-linejoin="round"><path d="M12 22 C12 22 5 15 5 9 A7 7 0 0 1 19 9 C19 15 12 22 12 22 Z" /><circle cx="12" cy="9" r="2.5" /></svg>
        <span class="sc__k sc__k--addr">门店地址：</span><span class="sc__addr">{{ store.address }}</span>
      </div>
    </div>
    <!-- 店长微信二维码：门店没上传微信图就整块不出现——二维码不能用默认图兜底，扫不通比没有更糟 -->
    <div v-if="store?.managerWechatUrl" class="sc__qr">
      <img class="sc__qr-img" :src="store.managerWechatUrl" alt="店长微信二维码" />
      <i class="sc__qr-div" />
      <div class="sc__qr-side">
        <div class="sc__qr-tags">溯源｜售后｜订单</div>
        <div class="sc__qr-tip">欢迎咨询</div>
        <!-- 纯展示描边按钮：二维码本身就是给顾客扫的，这里不绑任何点击行为 -->
        <span class="sc__qr-btn">扫码联系客服</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TraceStoreVo } from '@/api/types';
import TraceSectionTitle from './TraceSectionTitle.vue';
import storeDefault from '@/assets/base/store-default.jpg';

const props = defineProps<{ store?: TraceStoreVo | null }>();

// 名称与地址都为空 = 这条追溯码没关联到门店，整卡不出现
const show = computed(() => !!props.store && (!!props.store.name || !!props.store.address));
// 门店配图：优先门店自有图（image_oss_id），无则默认门店门面图兜底
const image = computed(() => props.store?.imageUrl || storeDefault);
</script>

<style lang="scss" scoped>
/* 绿描边卡：与有机认证证书卡（TraceCert .cert-card）同一套观感 */
.sc {
  background: #fff;
  border: 2px solid #2f7c44;
  border-radius: 14px;
  padding: 6px 14px 14px;
  box-shadow: 0 4px 12px rgba(47, 124, 68, 0.12);
}
.sc__img {
  width: 100%;
  height: 150px;
  margin: 8px 0 4px;
  border-radius: 10px;
  object-fit: cover;
  display: block;
}
.sc__rows {
  margin-top: 2px;
}
.sc__row {
  display: flex;
  /* 顶对齐：地址折行成多行时，图标与 label 跟首行对齐，不被整块垂直居中 */
  align-items: flex-start;
  gap: 7px;
  padding: 5px 0;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}
.sc__ic {
  flex: 0 0 auto;
  margin-top: 2px; /* 16px 图标在 21px 行高里视觉居首行 */
}
.sc__k {
  color: #808680;
}
/* 门店地址自动换行显示全：label 不缩，地址值占满剩余宽度、超长折行不截断 */
.sc__k--addr {
  flex: 0 0 auto;
  white-space: nowrap;
}
.sc__addr {
  flex: 1;
  min-width: 0;
  white-space: normal;
  word-break: break-word;
}

/* 底部二维码块：左二维码 / 中竖分割线 / 右文案 + 描边按钮。
   三者按内容取宽、整块在卡内水平居中（右侧不再留一大片空白）。 */
.sc__qr {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eaf0ec;
}
.sc__qr-img {
  flex: 0 0 100px;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  /* contain：二维码裁掉边角就扫不出来，宁可留白 */
  object-fit: contain;
  background: #fff;
  display: block;
}
.sc__qr-div {
  flex: 0 0 1px;
  align-self: stretch;
  background: #e4ebe6;
}
/* 文案列按内容取宽（不再 flex:1 撑满剩余宽度，否则整块被顶到左边）；
   窄屏放不下时可收缩，文案照常折行 */
.sc__qr-side {
  flex: 0 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
}
.sc__qr-tags {
  font-size: 13.5px;
  font-weight: 700;
  color: #2f7c44;
  letter-spacing: 0.5px;
}
.sc__qr-tip {
  font-size: 12.5px;
  color: #808680;
}
.sc__qr-btn {
  display: inline-block;
  margin-top: 2px;
  padding: 5px 14px;
  border: 1px solid #2f7c44;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  color: #2f7c44;
  white-space: nowrap;
}
</style>
