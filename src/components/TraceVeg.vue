<template>
  <TraceLayout theme="veg">
    <!-- 照片 -->
    <div class="tr-photo">
      <img v-if="product?.imageUrl" :src="product.imageUrl" alt="" />
      <div v-else class="tr-photo__ph">暂无图</div>
    </div>

    <!-- 产品信息（合并产品 + 地块 KV） -->
    <TraceSectionTitle title="产品信息" />
    <div class="tr-kv"><span class="tr-kv__k">商品名称：</span><span>{{ product?.name || crop?.name }}</span></div>
    <div v-if="crop?.variety" class="tr-kv"><span class="tr-kv__k">品种：</span><span>{{ crop.variety }}</span></div>
    <div v-if="product?.spec" class="tr-kv"><span class="tr-kv__k">规格：</span><span>{{ product.spec }}</span></div>
    <div v-if="product?.weight" class="tr-kv"><span class="tr-kv__k">重量：</span><span>{{ product.weight }} kg</span></div>
    <div class="tr-kv"><span class="tr-kv__k">编码：</span><span class="tr-kv__code">{{ product?.produceCode || code }}</span></div>
    <div v-if="product?.description" class="tr-kv"><span class="tr-kv__k">产品描述：</span><span>{{ product.description }}</span></div>
    <div v-if="plotTag" class="tr-kv"><span class="tr-chip tr-chip--block">地块编号：{{ plotTag }}</span></div>
    <div v-if="plot?.zoneName" class="tr-kv"><span class="tr-kv__k">片区：</span><span>{{ plot.zoneName }}</span></div>
    <div v-if="plot?.area" class="tr-kv"><span class="tr-kv__k">面积：</span><span>{{ plot.area }} 亩</span></div>

    <div class="tr-hr" />

    <!-- 流程处理时间轴（横向） -->
    <TraceSectionTitle title="流程处理时间轴" />
    <div v-if="timeline.length === 0" class="tr-empty">暂无流程记录</div>
    <div v-else class="tr-htl">
      <div
        v-for="(node, idx) in timeline"
        :key="idx"
        class="tr-htl__step"
        :class="{ 'is-last': idx === timeline.length - 1 }"
      >
        <span class="tr-htl__name">{{ traceContentLabel(node.traceContent) }}</span>
        <div class="tr-htl__track"><span class="tr-htl__dot" /></div>
        <span v-if="node.weight" class="tr-htl__wt">{{ node.weight }}kg</span>
        <span v-if="node.traceTime" class="tr-htl__date">{{ node.traceTime }}</span>
      </div>
    </div>

    <div class="tr-hr" />

    <!-- 下钻入口（作物农事 / 果蔬证 / 地块证） -->
    <div class="tr-entry" @click="emit('go', 'plot-records')">
      <div class="tr-entry__main">
        <span class="tr-entry__title">作物农事记录</span>
        <span class="tr-entry__sub">{{ workSummary }}</span>
      </div>
      <span class="tr-entry__arrow"><IconArrow :size="16" /></span>
    </div>
    <div v-if="cropCert" class="tr-entry" @click="emit('go', 'cert', { certType: 'crop' })">
      <div class="tr-entry__main">
        <span class="tr-entry__title">果蔬有机检验证书</span>
        <span v-if="cropCert.issuer || cropCert.certNo" class="tr-entry__sub">{{ cropCert.issuer || cropCert.certNo }}</span>
      </div>
      <span class="tr-entry__arrow"><IconArrow :size="16" /></span>
    </div>
    <div v-if="plotCert" class="tr-entry" @click="emit('go', 'cert', { certType: 'plot' })">
      <div class="tr-entry__main">
        <span class="tr-entry__title">地块有机检验证书</span>
        <span v-if="plotCert.issuer || plotCert.certNo" class="tr-entry__sub">{{ plotCert.issuer || plotCert.certNo }}</span>
      </div>
      <span class="tr-entry__arrow"><IconArrow :size="16" /></span>
    </div>

    <!-- 销售门店 -->
    <template v-if="showStore">
      <div class="tr-hr" />
      <TraceSectionTitle title="销售门店" />
      <div class="tr-store">
        <div v-if="store?.name" class="tr-store__row"><span class="tr-store__k">门店名称</span><span class="tr-store__v">{{ store.name }}</span></div>
        <div v-if="store?.address" class="tr-store__row"><span class="tr-store__k">门店地址</span><span class="tr-store__v">{{ store.address }}</span></div>
      </div>
    </template>
  </TraceLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PublicTraceVo } from '@/api/types';
import { traceContentLabel, farmWorkTypeLabel } from '@/api/labels';
import TraceLayout from './TraceLayout.vue';
import TraceSectionTitle from './TraceSectionTitle.vue';
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

const plotTag = computed(() => plot.value?.plotName || product.value?.plotName || '');

const workSummary = computed(() => {
  const recs = plotRecords.value;
  if (recs.length === 0) return '查看农事详情';
  const counts: Record<string, number> = {};
  recs.forEach((r) => {
    if (r.workType) counts[r.workType] = (counts[r.workType] ?? 0) + 1;
  });
  const parts = Object.entries(counts).map(([k, n]) => `${farmWorkTypeLabel(k)} ${n} 次`);
  return parts.length ? parts.join(' / ') : `共 ${recs.length} 条`;
});

const cropCert = computed(() => organicCerts.value.find((c) => c.certType === 'crop') ?? null);
const plotCert = computed(() => organicCerts.value.find((c) => c.certType === 'plot') ?? null);
const showStore = computed(() => !!store.value && (!!store.value.name || !!store.value.address));
</script>

<style lang="scss" scoped>
@use '@/styles/trace.scss';
</style>
