<template>
  <div class="trace-h5">
    <div class="trace-h5__container">
      <div v-if="loading" class="trace-state">加载中…</div>
      <div v-else-if="errorKey" class="trace-state trace-state--error">{{ errorText }}</div>
      <template v-else-if="trace">
        <TracePork v-if="view === 'ready'" :trace="trace" :code="produceCode" store-mode @go="goSub" />
        <!-- 门店当天没有可追溯的猪：友好空态 + 门店卡（顾客照样能看到门店信息、联系店长） -->
        <TraceLayout v-else theme="pork">
          <div class="st-empty">
            <div class="st-empty__title">今日暂无猪肉追溯信息</div>
            <div class="st-empty__sub">门店今天到店的猪肉登记后，这里会显示对应猪只的追溯信息</div>
          </div>
          <TraceStoreCard :store="trace.store" />
        </TraceLayout>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { PublicTraceVo } from '@/api/types';
import { loadStoreTrace, type StoreTraceLoadResult } from '@/api/trace';
import { storeTraceCode, storeTraceView } from '@/api/store-trace';
import TracePork from '@/components/TracePork.vue';
import TraceLayout from '@/components/TraceLayout.vue';
import TraceStoreCard from '@/components/TraceStoreCard.vue';

/**
 * 门店猪只追溯码落地页（V7 row40）：/trace/store/:storeKey。
 * 二维码固定挂在门店，展示哪头猪由后端按「门店当天到店最重的那头」动态决定。
 */
const route = useRoute();
const router = useRouter();

const loading = ref(true);
const errorKey = ref<StoreTraceLoadResult['errorKey']>('');
const trace = ref<PublicTraceVo | null>(null);

const storeKey = computed(() => String(route.params.storeKey ?? ''));
const view = computed(() => storeTraceView(trace.value));
const produceCode = computed(() => storeTraceCode(trace.value));

const ERROR_TEXT: Record<string, string> = {
  missingStore: '缺少门店标识',
  storeNotFound: '未查询到该门店',
  loadFailed: '加载失败，请稍后重试'
};
const errorText = computed(() => ERROR_TEXT[errorKey.value] ?? '加载失败，请稍后重试');
let latestRequest = 0;

async function fetchData() {
  const request = ++latestRequest;
  loading.value = true;
  document.title = '东角山猪肉追溯码';
  const res = await loadStoreTrace(storeKey.value);
  if (request !== latestRequest) return;
  trace.value = res.data;
  errorKey.value = res.errorKey;
  loading.value = false;
}

// 下钻子页（生长记录 / 养殖基地）沿用按码追溯的子页，用选中那头猪的追溯码
function goSub(target: string, query?: Record<string, string>) {
  if (!produceCode.value) return;
  router.push({ path: `/trace/${target}/${produceCode.value}`, query });
}

watch(() => route.params.storeKey, fetchData);
onMounted(fetchData);
</script>

<style lang="scss" scoped>
.trace-h5 {
  min-height: 100vh;
  background: #f4f6f5;
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
.st-empty {
  background: #fff;
  border-radius: 16px;
  padding: 36px 20px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}
.st-empty__title {
  font-size: 16px;
  font-weight: 700;
  color: #5a3020;
}
.st-empty__sub {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: #909399;
}
</style>
