<template>
  <TraceLayout theme="veg">
    <!-- 产品信息 -->
    <div class="v-card">
      <TraceSectionTitle title="产品信息" />
      <!-- 产品图用方形卡位 + fill（客户：图片显示不全，填充上去、可以有一些拉伸）：
           产品配图 85% 是 1:1 设计稿（带品牌 logo / 认证角标），方卡位下铺满且零形变零裁切；
           少数非方实拍图靠拉伸填满、整图仍完整可见（最坏约 1.57x，远低于 16:10 卡位的 2.5x）。 -->
      <TraceCarousel :images="productImages" ratio="1 / 1" fit="fill" />
      <div class="v-kvs">
        <div class="tr-kv"><span class="tr-kv__k">商品名称：</span><span>{{ product?.name || crop?.name }}</span></div>
        <div v-if="crop?.variety" class="tr-kv"><span class="tr-kv__k">品种：</span><span>{{ crop.variety }}</span></div>
        <div v-if="product?.spec" class="tr-kv"><span class="tr-kv__k">产品规格：</span><span>{{ product.spec }}</span></div>
        <div v-if="product?.weight" class="tr-kv"><span class="tr-kv__k">产品重量：</span><span>{{ weightDisplay }}</span></div>
        <div v-if="product?.produceNo" class="tr-kv"><span class="tr-kv__k">生产编号：</span><span class="tr-kv__code">{{ product.produceNo }}</span></div>
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

    <!-- 品质溯源时间线 -->
    <div class="v-card">
      <TraceSectionTitle title="品质溯源时间线" />
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
              <span class="v-tl__name">{{ traceContentLabel(node.traceContent) }}</span>
              <span v-if="node.traceTime" class="v-tl__time">{{ nodeTimeText(node) }}</span>
            </div>
            <div v-if="node.operatorName && !FARM_WORK_NODES.has(node.traceContent ?? '')" class="v-tl__op">{{ node.operatorName }}</div>
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

    <!-- 有机认证（有证书即显；有证书图展示图，无图展示证书信息 · row149） -->
    <div v-if="organicCerts.length" class="v-card v-cert">
      <div class="v-cert__head">
        <span class="v-cert__badge">
          <svg viewBox="0 0 20 20" width="18" height="18"><circle cx="10" cy="10" r="9" fill="#2f7c44" /><path d="M6 10.2 l2.6 2.6 5.2-5.4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </span>
        <div>
          <div class="v-cert__title">有机认证</div>
          <div class="v-cert__sub">已通过有机产品认证，请放心使用</div>
        </div>
      </div>
      <div v-for="(cert, i) in organicCerts" :key="i" class="v-cert__item">
        <div v-if="certImages(cert).length" class="v-cert__imgs">
          <img v-for="(img, j) in certImages(cert)" :key="j" class="v-cert__img" :src="img" alt="有机认证证书" />
        </div>
        <div class="v-cert__meta">
          <div v-if="cert.issuer" class="tr-kv"><span class="tr-kv__k">认证机构：</span><span>{{ cert.issuer }}</span></div>
          <div v-if="cert.certNo" class="tr-kv"><span class="tr-kv__k">证书编号：</span><span>{{ cert.certNo }}</span></div>
          <div v-if="cert.validTo" class="tr-kv"><span class="tr-kv__k">有效期至：</span><span>{{ cert.validTo }}</span></div>
        </div>
      </div>
    </div>

    <!-- 销售门店 -->
    <div v-if="showStore" class="v-card">
      <TraceSectionTitle title="销售门店" />
      <img class="v-store__img" :src="storeImage" alt="门店" />
      <div class="v-store">
        <div v-if="store?.name" class="v-store__row">
          <svg class="v-store__ic" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2f7c44" stroke-width="1.6" stroke-linejoin="round"><path d="M4 9 L5 4 H19 L20 9 M4 9 V20 H20 V9 M4 9 H20" /></svg>
          <span class="v-store__k">门店名称：</span><span>{{ store.name }}</span>
        </div>
        <div v-if="store?.address" class="v-store__row">
          <svg class="v-store__ic" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2f7c44" stroke-width="1.6" stroke-linejoin="round"><path d="M12 22 C12 22 5 15 5 9 A7 7 0 0 1 19 9 C19 15 12 22 12 22 Z" /><circle cx="12" cy="9" r="2.5" /></svg>
          <span class="v-store__k v-store__k--addr">门店地址：</span><span class="v-store__addr">{{ store.address }}</span>
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
import storeDefaultImg from '@/assets/base/store-default.jpg';

const props = defineProps<{ trace: PublicTraceVo; code: string }>();
const emit = defineEmits<{ (e: 'go', target: string, query?: Record<string, string>): void }>();

const product = computed(() => props.trace.product ?? null);
const crop = computed(() => props.trace.crop ?? null);
const plot = computed(() => props.trace.plot ?? null);
const timeline = computed(() => props.trace.timeline ?? []);
const plotRecords = computed(() => props.trace.plotRecords ?? []);
const organicCerts = computed(() => props.trace.organicCerts ?? []);

// row162/row24：一证多图全展示——优先 imageUrls（多图），回落 imageUrl（旧单图，向后兼容）。
// 与 TraceCert.vue 同口径：证书配置多张图（crop_image_url 逗号分隔）后端解析成 imageUrls，逐张渲染。
function certImages(c: { imageUrls?: string[]; imageUrl?: string }): string[] {
  if (c.imageUrls && c.imageUrls.length) return c.imageUrls;
  return c.imageUrl ? [c.imageUrl] : [];
}
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

/**
 * 种植 / 采摘 两个农事节点的特殊处理（它们本就是按天记的农事）：
 *  ① 时间只显示日期（精确到时分秒无意义）；其余节点（毛菜处理 / 产品生产 / 冷链发货 / 到店）保留时分秒。
 *  ② 节点下方不显示种植班组（客户 row82：去掉采摘、种植下方的种植班组）——班组以 operatorName 透传，此处隐藏。
 * 后端给的时间是 "YYYY-MM-DD HH:mm:ss"，按空格切首段取日期。
 */
const FARM_WORK_NODES = new Set(['sowing', 'harvest']);
function nodeTimeText(node: { traceContent?: string; traceTime?: string }): string {
  const t = node.traceTime ?? '';
  return FARM_WORK_NODES.has(node.traceContent ?? '') ? t.split(' ')[0] : t;
}

const showStore = computed(() => !!store.value && (!!store.value.name || !!store.value.address));
// 果蔬重量按克展示（后端给 kg 数值）；非纯数字（规格串兜底）原样显示（row146）
const weightDisplay = computed(() => {
  const w = product.value?.weight;
  if (w == null || w === '') return '';
  const n = Number(w);
  return Number.isFinite(n) ? `${Math.round(n * 1000 * 100) / 100} g` : String(w);
});
// 门店配图：优先门店自有图（image_oss_id），无则默认门店门面图兜底（与猪肉追溯同一张 store-default）。
// row82：原来兜底用基地航拍图（base-panorama），门店卡里显示成一张农田远景、被客户判为「图片显示有误」。
const storeImage = computed(() => store.value?.imageUrl || storeDefaultImg);
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
/* 一证多图：证书图横向并排 + 统一尺寸（各占等分宽 + 固定纵横比 → 三张同宽同高一样大），row34/row39 */
.v-cert__imgs {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
}
.v-cert__img {
  flex: 1 1 0;
  min-width: 0;
  width: auto;
  aspect-ratio: 1 / 1.4;
  object-fit: contain;
  background: #fafafa;
  border-radius: 10px;
  display: block;
  border: 1px solid #eef0ef;
}
.v-cert__item + .v-cert__item {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eef0ef;
}
.v-cert__meta {
  margin-top: 8px;
}
.v-cert__meta .tr-kv {
  font-size: 13.5px;
  color: #333;
}

/* 销售门店 */
.v-store__img {
  width: 100%;
  height: 150px;
  margin: 8px 0 4px;
  border-radius: 10px;
  object-fit: cover;
  display: block;
}
.v-store {
  margin-top: 2px;
}
.v-store__row {
  display: flex;
  /* 顶对齐：地址折行成多行时，图标与 label 跟首行对齐，不被整块垂直居中 */
  align-items: flex-start;
  gap: 7px;
  padding: 5px 0;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}
.v-store__ic {
  flex: 0 0 auto;
  margin-top: 2px; /* 16px 图标在 21px 行高里视觉居首行 */
}
.v-store__k {
  color: #808680;
}
/* 门店地址自动换行显示全：label 不缩，地址值占满剩余宽度、超长折行不截断 */
.v-store__k--addr {
  flex: 0 0 auto;
  white-space: nowrap;
}
.v-store__addr {
  flex: 1;
  min-width: 0;
  white-space: normal;
  word-break: break-word;
}
</style>
