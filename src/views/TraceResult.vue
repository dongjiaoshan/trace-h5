<template>
  <div class="trace-h5">
    <div class="trace-h5__container">
      <div v-if="loading" class="trace-state">加载中…</div>
      <div v-else-if="errorKey" class="trace-state trace-state--error">{{ errorText }}</div>
      <template v-else-if="trace">
        <TracePork v-if="viewType === 'pork'" :trace="trace" :code="code" @go="goSub" />
        <TraceVeg v-else-if="viewType === 'veg'" :trace="trace" :code="code" @go="goSub" />
        <TraceGrow v-else-if="viewType === 'grow'" :trace="trace" />
        <TraceCert v-else-if="viewType === 'cert'" :trace="trace" :cert-type="certType" />
        <TracePlotRecords v-else-if="viewType === 'plot-records'" :trace="trace" />
        <TraceBase v-else-if="viewType === 'base'" />
        <!-- 兜底：未知 type 按业态原页渲染 -->
        <TracePork v-else-if="trace.codeType === 'pork'" :trace="trace" :code="code" @go="goSub" />
        <TraceVeg v-else :trace="trace" :code="code" @go="goSub" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { PublicTraceVo } from '@/api/types';
import { loadTrace, type TraceLoadResult } from '@/api/trace';
import TracePork from '@/components/TracePork.vue';
import TraceVeg from '@/components/TraceVeg.vue';
import TraceGrow from '@/components/TraceGrow.vue';
import TraceCert from '@/components/TraceCert.vue';
import TracePlotRecords from '@/components/TracePlotRecords.vue';
import TraceBase from '@/components/TraceBase.vue';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const errorKey = ref<TraceLoadResult['errorKey']>('');
const trace = ref<PublicTraceVo | null>(null);

// type: pork | veg | grow | cert | plot-records；code = produce_code 业务码（禁 Number()）
const code = computed(() => String(route.params.code ?? ''));
const viewType = computed(() => String(route.params.type ?? ''));
// 证书页按 ?certType=crop|plot 过滤（默认 crop）
const certType = computed(() => String(route.query.certType ?? 'crop'));

const ERROR_TEXT: Record<string, string> = {
  notFound: '未查询到该追溯码',
  missingCode: '缺少追溯码',
  loadFailed: '加载失败，请稍后重试'
};
const errorText = computed(() => ERROR_TEXT[errorKey.value] ?? '加载失败，请稍后重试');

async function fetchData() {
  loading.value = true;
  const res = await loadTrace(code.value);
  trace.value = res.data;
  errorKey.value = res.errorKey;
  loading.value = false;
  // 设置页面标题（C 端浏览器 tab）
  document.title = res.data?.codeType === 'veg' ? '蔬果追溯' : '猪肉追溯';
}

// 下钻子页：grow / cert / plot-records（同一 code，各自重新进路由拉数）
function goSub(target: string, query?: Record<string, string>) {
  router.push({ path: `/trace/${target}/${code.value}`, query });
}

watch(() => [route.params.type, route.params.code], fetchData);
onMounted(fetchData);
</script>

<style lang="scss" scoped>
.trace-h5 {
  min-height: 100vh;
  background: #f4f6f5;
  padding: 0;
}
.trace-h5__container {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f4f6f5;
}
.trace-state {
  padding: 120px 24px;
  text-align: center;
  font-size: 15px;
  color: #909399;
}
.trace-state--error {
  color: #f56c6c;
}
</style>
