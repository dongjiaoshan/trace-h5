<template>
  <div class="cert-page">
    <div class="cert-page__title">{{ pageTitle }}</div>
    <div v-if="certs.length === 0" class="t-empty">暂无有机认证证书</div>
    <div v-for="(c, idx) in certs" :key="idx" class="cert-card">
      <!-- 多图：一次显示一张、左右滑动切换（并排平铺时每张只有指甲盖大，证书正文完全看不清 · row168） -->
      <TraceCarousel
        v-if="certImages(c).length > 1"
        class="cert-carousel"
        :images="certImages(c)"
        ratio="1 / 1.4"
        fit="contain"
        bg="#fff"
        preview
      />
      <!-- 单图：维持整宽单张的原版式，同样可以点开全屏 -->
      <div v-else-if="certImages(c).length" class="cert-img">
        <PreviewImage :src="certImages(c)[0]" fit="contain" />
      </div>
      <div v-if="c.issuer" class="t-kv">
        <span class="t-kv__label">颁发机构</span>
        <span class="t-kv__val">{{ c.issuer }}</span>
      </div>
      <div v-if="c.certNo" class="t-kv">
        <span class="t-kv__label">证书编号</span>
        <span class="t-kv__val">{{ c.certNo }}</span>
      </div>
      <div v-if="c.validFrom || c.validTo" class="t-kv">
        <span class="t-kv__label">有效期</span>
        <span class="t-kv__val">{{ validityText(c.validFrom, c.validTo) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PublicTraceVo } from '@/api/types';
import PreviewImage from './PreviewImage.vue';
import TraceCarousel from './TraceCarousel.vue';

const props = defineProps<{ trace: PublicTraceVo; certType: string }>();

const certs = computed(() => (props.trace.organicCerts ?? []).filter((c) => c.certType === props.certType));
const pageTitle = computed(() => (props.certType === 'plot' ? '地块有机检验证书' : '果蔬有机检验证书'));

// 一证多图——优先 imageUrls（多图），回落 imageUrl（旧单图，向后兼容）。
function certImages(c: { imageUrls?: string[]; imageUrl?: string }): string[] {
  if (c.imageUrls && c.imageUrls.length) return c.imageUrls;
  return c.imageUrl ? [c.imageUrl] : [];
}

function validityText(from?: string, to?: string): string {
  if (from && to) return `${from} 至 ${to}`;
  return to || from || '';
}
</script>

<style lang="scss" scoped>
@use '@/styles/trace.scss';

.cert-page {
  padding: 12px;
}
.cert-page__title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}
.cert-card {
  background: #fff;
  border: 2px solid #2f7c44;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 4px 12px rgba(47, 124, 68, 0.12);
  margin-bottom: 16px;
}
/* 证书图卡位：整宽 + 竖版 A4 比例（1:1.4）+ 浅底 contain，与果蔬追溯页证书块同一形态。
   圆角跟随 TraceCarousel 自带的 12px，两个分支切换时边角不跳。 */
.cert-carousel {
  margin-bottom: 12px;
  border: 1px solid #ebeef5;
}
.cert-img {
  margin-bottom: 12px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  background: #f5f7fa;
  aspect-ratio: 1 / 1.4;
}
/* 直接子选择器：只管卡位里那张缩略图，不误伤 PreviewImage 放大后挂在遮罩里的同名 img */
.cert-img > :deep(img) {
  width: 100%;
  height: 100%;
}
</style>
