<template>
  <div class="cert-page">
    <div class="cert-page__title">{{ pageTitle }}</div>
    <div v-if="certs.length === 0" class="t-empty">暂无有机认证证书</div>
    <div v-for="(c, idx) in certs" :key="idx" class="cert-card">
      <div v-if="c.imageUrl" class="cert-img">
        <PreviewImage :src="c.imageUrl" fit="contain" />
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
.cert-img {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
  background: #f5f7fa;
}
</style>
