<template>
  <TraceLayout theme="veg">
    <!-- 产品信息 -->
    <div class="v-card">
      <TraceSectionTitle title="产品信息" />
      <TraceCarousel :images="productImages" />
      <div class="v-kvs">
        <div class="tr-kv"><span class="tr-kv__k">商品名称：</span><span>{{ product?.name || crop?.name }}</span></div>
        <div v-if="crop?.variety" class="tr-kv"><span class="tr-kv__k">品种：</span><span>{{ crop.variety }}</span></div>
        <div v-if="product?.spec" class="tr-kv"><span class="tr-kv__k">规格：</span><span>{{ product.spec }}</span></div>
        <div v-if="product?.weight" class="tr-kv"><span class="tr-kv__k">重量：</span><span>{{ product.weight }} kg</span></div>
        <div class="tr-kv"><span class="tr-kv__k">编码：</span><span class="tr-kv__code">{{ product?.produceCode || code }}</span></div>
        <div v-if="product?.description" class="tr-kv"><span class="tr-kv__k">产品描述：</span><span>{{ product.description }}</span></div>
      </div>
      <!-- 地块 mini-row -->
      <div v-if="plot || plotTag" class="v-plot">
        <img class="v-plot__thumb" :src="plotThumb" alt="" />
        <div class="v-plot__info">
          <div v-if="plot?.zoneName" class="v-plot__line"><span class="v-plot__k">片区：</span>{{ plot.zoneName }}</div>
          <div v-if="plot?.area" class="v-plot__line"><span class="v-plot__k">面积：</span>{{ plot.area }} 亩</div>
          <span v-if="plotTag" class="tr-chip v-plot__chip">地块编号：{{ plotTag }}</span>
        </div>
      </div>
    </div>

    <!-- 流程时间轴 -->
    <div class="v-card">
      <TraceSectionTitle title="流程时间轴" />
      <div v-if="timeline.length === 0" class="tr-empty">暂无流程记录</div>
      <div v-else class="v-tl">
        <div
          v-for="(node, idx) in timeline"
          :key="idx"
          class="v-tl__row"
          :class="{ 'is-last': idx === timeline.length - 1 }"
        >
          <span class="v-tl__icon">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#fff" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"><path d="M3 8 L12 3 L21 8 V17 L12 22 L3 17 Z" /><path d="M3 8 L12 13 L21 8 M12 13 V22" /></svg>
          </span>
          <div class="v-tl__body">
            <div class="v-tl__head">
              <span class="v-tl__name">{{ traceContentLabel(node.traceContent) }}<span v-if="node.weight" class="v-tl__wt"> · {{ node.weight }}kg</span></span>
              <span v-if="node.traceTime" class="v-tl__time">{{ node.traceTime }}</span>
            </div>
            <div v-if="node.operatorName" class="v-tl__op">{{ node.operatorName }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 作物农事记录（下钻） -->
    <div class="v-entry" @click="emit('go', 'plot-records')">
      <div class="v-entry__main">
        <div class="v-entry__title">作物农事记录</div>
        <div class="v-entry__sub">{{ workSummary }}<IconArrow class="v-entry__chev" :size="13" /></div>
      </div>
      <img class="v-entry__thumb" :src="thumbWeeding" alt="" />
    </div>

    <!-- 有机认证（有证书才显；证书图内联展示） -->
    <div v-if="certImages.length" class="v-card v-cert">
      <div class="v-cert__head">
        <span class="v-cert__badge">
          <svg viewBox="0 0 20 20" width="18" height="18"><circle cx="10" cy="10" r="9" fill="#2f7c44" /><path d="M6 10.2 l2.6 2.6 5.2-5.4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </span>
        <div>
          <div class="v-cert__title">有机认证</div>
          <div class="v-cert__sub">已通过有机产品认证，请放心使用</div>
        </div>
      </div>
      <img v-for="(img, i) in certImages" :key="i" class="v-cert__img" :src="img" alt="有机认证证书" />
    </div>

    <!-- 销售门店 -->
    <div v-if="showStore" class="v-card">
      <TraceSectionTitle title="销售门店" />
      <div class="v-store">
        <div v-if="store?.name" class="v-store__row">
          <svg class="v-store__ic" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2f7c44" stroke-width="1.6" stroke-linejoin="round"><path d="M4 9 L5 4 H19 L20 9 M4 9 V20 H20 V9 M4 9 H20" /></svg>
          <span class="v-store__k">门店名称：</span><span>{{ store.name }}</span>
        </div>
        <div v-if="store?.address" class="v-store__row">
          <svg class="v-store__ic" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2f7c44" stroke-width="1.6" stroke-linejoin="round"><path d="M12 22 C12 22 5 15 5 9 A7 7 0 0 1 19 9 C19 15 12 22 12 22 Z" /><circle cx="12" cy="9" r="2.5" /></svg>
          <span class="v-store__k">门店地址：</span><span>{{ store.address }}</span>
        </div>
      </div>
    </div>

    <!-- 基地介绍（下钻） -->
    <div class="v-entry" @click="emit('go', 'base')">
      <div class="v-entry__main">
        <div class="v-entry__title">基地介绍</div>
        <div class="v-entry__sub">3000 亩有机农场<IconArrow class="v-entry__chev" :size="13" /></div>
      </div>
      <img class="v-entry__thumb" :src="thumbPanorama" alt="" />
    </div>
  </TraceLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PublicTraceVo } from '@/api/types';
import { traceContentLabel, farmWorkTypeLabel } from '@/api/labels';
import TraceLayout from './TraceLayout.vue';
import TraceSectionTitle from './TraceSectionTitle.vue';
import TraceCarousel from './TraceCarousel.vue';
import IconArrow from './IconArrow.vue';
import thumbFieldRows from '@/assets/base/thumb-field-rows.jpg';
import thumbWeeding from '@/assets/base/thumb-weeding.jpg';
import thumbPanorama from '@/assets/base/thumb-panorama.jpg';

const props = defineProps<{ trace: PublicTraceVo; code: string }>();
const emit = defineEmits<{ (e: 'go', target: string, query?: Record<string, string>): void }>();

const product = computed(() => props.trace.product ?? null);
const crop = computed(() => props.trace.crop ?? null);
const plot = computed(() => props.trace.plot ?? null);
const timeline = computed(() => props.trace.timeline ?? []);
const plotRecords = computed(() => props.trace.plotRecords ?? []);
const organicCerts = computed(() => props.trace.organicCerts ?? []);
const store = computed(() => props.trace.store ?? null);

// 产品图轮播：目前后端一张产品图（多图时轮播自动生效）
const productImages = computed(() => [product.value?.imageUrl].filter((s): s is string => !!s));
// 地块缩略图：无地块专属图，用基地环境图代表（thumb-field-rows）
const plotThumb = thumbFieldRows;
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

// 有机认证证书图（果蔬 + 地块证，有图才展示）
const certImages = computed(() => organicCerts.value.map((c) => c.imageUrl).filter((s): s is string => !!s));
const showStore = computed(() => !!store.value && (!!store.value.name || !!store.value.address));
</script>

<style lang="scss" scoped>
@use '@/styles/trace.scss';

/* 白卡 */
.v-card {
  background: #fff;
  border-radius: 16px;
  padding: 14px 16px 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}
.v-kvs {
  margin-top: 10px;
}

/* 地块 mini-row */
.v-plot {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f2f1;
}
.v-plot__thumb {
  flex: 0 0 78px;
  width: 78px;
  height: 78px;
  border-radius: 10px;
  object-fit: cover;
  display: block;
}
.v-plot__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
  justify-content: center;
}
.v-plot__line {
  font-size: 14px;
  color: #333;
}
.v-plot__k {
  color: #808680;
}
.v-plot__chip {
  align-self: flex-start;
  margin-top: 2px;
}

/* 纵向时间轴（绿方块图标 + 右对齐绿时间） */
.v-tl {
  padding: 4px 0 2px;
}
.v-tl__row {
  position: relative;
  display: flex;
  gap: 12px;
  padding-bottom: 16px;
}
.v-tl__row:last-child {
  padding-bottom: 0;
}
.v-tl__row:not(.is-last)::before {
  content: '';
  position: absolute;
  left: 16px;
  top: 34px;
  bottom: -2px;
  width: 2px;
  background: #e2e8e4;
}
.v-tl__icon {
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: #2f7c44;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}
.v-tl__body {
  flex: 1;
  min-width: 0;
  padding-top: 1px;
}
.v-tl__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.v-tl__name {
  font-size: 15px;
  font-weight: 700;
  color: #2f3a33;
}
.v-tl__wt {
  color: #2f7c44;
  font-weight: 700;
}
.v-tl__time {
  flex: 0 0 auto;
  font-size: 12.5px;
  color: #2f7c44;
  font-variant-numeric: tabular-nums;
}
.v-tl__op {
  margin-top: 3px;
  font-size: 12.5px;
  color: #909399;
}

/* 下钻入口（左文右图） */
.v-entry {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 16px;
  padding: 12px 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  cursor: pointer;
}
.v-entry__main {
  flex: 1;
  min-width: 0;
}
.v-entry__title {
  font-size: 15px;
  font-weight: 700;
  color: #2b2b2b;
}
.v-entry__sub {
  margin-top: 4px;
  font-size: 13px;
  color: #2f7c44;
  display: flex;
  align-items: center;
}
.v-entry__chev {
  margin-left: 3px;
}
.v-entry__thumb {
  flex: 0 0 92px;
  width: 92px;
  height: 60px;
  border-radius: 10px;
  object-fit: cover;
  display: block;
}

/* 有机认证 */
.v-cert__head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 2px 12px;
}
.v-cert__badge {
  flex: 0 0 auto;
  display: flex;
}
.v-cert__title {
  font-size: 15px;
  font-weight: 700;
  color: #26543a;
}
.v-cert__sub {
  margin-top: 2px;
  font-size: 12.5px;
  color: #7a9a85;
}
.v-cert__img {
  width: 100%;
  border-radius: 10px;
  display: block;
  border: 1px solid #eef0ef;
}
.v-cert__img + .v-cert__img {
  margin-top: 10px;
}

/* 销售门店 */
.v-store {
  margin-top: 2px;
}
.v-store__row {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 0;
  font-size: 14px;
  color: #333;
}
.v-store__ic {
  flex: 0 0 auto;
}
.v-store__k {
  color: #808680;
}
</style>
