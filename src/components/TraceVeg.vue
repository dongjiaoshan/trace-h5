<template>
  <TraceLayout :title="title" :trace-code="product?.produceCode || code" :cover="product?.imageUrl">
    <!-- 产品信息 -->
    <div class="t-card">
      <div class="t-section-title">产品信息</div>
      <div class="t-product-body">
        <div class="t-product-img">
          <img v-if="product?.imageUrl" :src="product.imageUrl" alt="" />
          <div v-else class="t-img-ph">暂无图</div>
        </div>
        <div class="t-product-info">
          <div class="t-product-name">{{ crop?.name || product?.name }}</div>
          <span v-if="plotTag" class="t-tag">地块编号：{{ plotTag }}</span>
          <div v-if="crop?.variety" class="t-product-meta">品种：{{ crop.variety }}</div>
          <div v-if="product?.spec" class="t-product-meta">规格：{{ product.spec }}</div>
          <div v-if="product?.weight" class="t-product-meta">重量：{{ product.weight }}</div>
          <div v-if="product?.growthDays != null" class="t-product-meta">生长天数：{{ product.growthDays }} 天</div>
          <div v-if="product?.harvestDate" class="t-product-meta">采摘日期：{{ product.harvestDate }}</div>
          <div class="t-product-meta">编码：{{ product?.produceCode || code }}</div>
          <div v-if="product?.description" class="t-product-meta">产品描述：{{ product.description }}</div>
        </div>
      </div>
      <!-- 地块简表 -->
      <template v-if="plot">
        <div class="veg-divider"></div>
        <div v-if="plot.plotName" class="t-kv">
          <span class="t-kv__label">地块</span>
          <span class="t-kv__val">{{ plot.plotName }}</span>
        </div>
        <div v-if="plot.zoneName" class="t-kv">
          <span class="t-kv__label">片区</span>
          <span class="t-kv__val">{{ plot.zoneName }}</span>
        </div>
        <div v-if="plot.area" class="t-kv">
          <span class="t-kv__label">面积</span>
          <span class="t-kv__val">{{ plot.area }} 亩</span>
        </div>
      </template>
    </div>

    <!-- 流程时间轴 -->
    <div class="t-card">
      <div class="t-section-title">流程处理时间轴</div>
      <div v-if="timeline.length === 0" class="t-empty">暂无流程记录</div>
      <div v-for="(node, idx) in timeline" :key="idx" class="t-timeline-row">
        <div class="t-timeline-dot"></div>
        <div class="t-timeline-content">
          <span class="t-timeline-name">{{ traceContentLabel(node.traceContent) }}</span>
          <span v-if="node.weight" class="t-timeline-weight">· {{ node.weight }}kg</span>
          <span v-if="node.traceTime" class="t-timeline-time">{{ node.traceTime }}</span>
          <span v-if="node.operatorName" class="t-timeline-op">{{ node.operatorName }}</span>
        </div>
      </div>
    </div>

    <!-- 下钻入口区 -->
    <div class="t-card">
      <div class="t-entry" @click="emit('go', 'plot-records')">
        <div class="t-entry__main">
          <span>作物农事记录</span>
          <span class="t-entry__sub">{{ workSummary }}</span>
        </div>
        <div class="t-entry__arrow">
          <IconArrow />
        </div>
      </div>
      <div v-if="cropCert" class="t-entry" @click="emit('go', 'cert', { certType: 'crop' })">
        <div class="t-entry__main">
          <span>果蔬有机检验证书</span>
          <span v-if="cropCert.issuer || cropCert.certNo" class="t-entry__sub">{{ cropCert.issuer || cropCert.certNo }}</span>
        </div>
        <div class="t-entry__arrow">
          <IconArrow />
        </div>
      </div>
      <div v-if="plotCert" class="t-entry" @click="emit('go', 'cert', { certType: 'plot' })">
        <div class="t-entry__main">
          <span>地块有机检验证书</span>
          <span v-if="plotCert.issuer || plotCert.certNo" class="t-entry__sub">{{ plotCert.issuer || plotCert.certNo }}</span>
        </div>
        <div class="t-entry__arrow">
          <IconArrow />
        </div>
      </div>
    </div>

    <!-- 销售门店 -->
    <div v-if="showStore" class="t-card">
      <div class="t-section-title">销售门店</div>
      <div v-if="store?.name" class="t-kv">
        <span class="t-kv__label">门店名称</span>
        <span class="t-kv__val">{{ store.name }}</span>
      </div>
      <div v-if="store?.address" class="t-kv">
        <span class="t-kv__label">门店地址</span>
        <span class="t-kv__val">{{ store.address }}</span>
      </div>
    </div>
  </TraceLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PublicTraceVo } from '@/api/types';
import { traceContentLabel, farmWorkTypeLabel } from '@/api/labels';
import TraceLayout from './TraceLayout.vue';
import IconArrow from './IconArrow.vue';

const props = defineProps<{ trace: PublicTraceVo; code: string }>();
const emit = defineEmits<{ (e: 'go', target: string, query?: Record<string, string>): void }>();

const product = computed(() => props.trace.product ?? null);
const crop = computed(() => props.trace.crop ?? null);
const plot = computed(() => props.trace.plot ?? null);
const timeline = computed(() => props.trace.timeline ?? []);
const plotRecords = computed(() => props.trace.plotRecords ?? []);
const organicCerts = computed(() => props.trace.organicCerts ?? []);
const store = computed(() => props.trace.store ?? null);

const title = computed(() => crop.value?.name || product.value?.name || '蔬果追溯');
const plotTag = computed(() => plot.value?.plotName || product.value?.plotName || '');

const workSummary = computed(() => {
  const recs = plotRecords.value;
  if (recs.length === 0) return '查看详情';
  const counts: Record<string, number> = {};
  recs.forEach((r) => {
    if (r.workType) counts[r.workType] = (counts[r.workType] ?? 0) + 1;
  });
  const parts = Object.entries(counts).map(([k, n]) => `${farmWorkTypeLabel(k)} ${n}`);
  return parts.join(' / ');
});

const cropCert = computed(() => organicCerts.value.find((c) => c.certType === 'crop') ?? null);
const plotCert = computed(() => organicCerts.value.find((c) => c.certType === 'plot') ?? null);
const showStore = computed(() => !!store.value && (!!store.value.name || !!store.value.address));
</script>

<style lang="scss" scoped>
@use '@/styles/trace.scss';

.veg-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 10px 0;
}
</style>
