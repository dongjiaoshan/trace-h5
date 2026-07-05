<template>
  <div class="cert-page">
    <div class="cert-page__title">{{ pageTitle }}</div>
    <div v-if="certs.length === 0" class="t-empty">暂无有机认证证书</div>
    <div v-for="(c, idx) in certs" :key="idx" class="cert-card">
      <div v-if="certImages(c).length" class="cert-imgs">
        <div v-for="(img, i) in certImages(c)" :key="i" class="cert-img">
          <PreviewImage :src="img" fit="cover" />
        </div>
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

const props = defineProps<{ trace: PublicTraceVo; certType: string }>();

const certs = computed(() => (props.trace.organicCerts ?? []).filter((c) => c.certType === props.certType));
const pageTitle = computed(() => (props.certType === 'plot' ? '地块有机检验证书' : '果蔬有机检验证书'));

// row162：一证多图全展示——优先 imageUrls（多图），回落 imageUrl（旧单图，向后兼容）。
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
/* row162：一证多图自适应网格，一行 2-3 张缩略图（每张最小 96px，随屏宽自动铺满）。 */
.cert-imgs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}
.cert-img {
  border-radius: 8px;
  overflow: hidden;
  background: #f5f7fa;
  aspect-ratio: 3 / 4;
}
.cert-img :deep(img) {
  width: 100%;
  height: 100%;
}
</style>
