<template>
  <TraceLayout theme="pork">
    <!-- 产品 + 猪只信息 -->
    <div class="p-card">
      <TraceSectionTitle title="产品信息" />
      <!-- 产品图独立整块显示，版式与果蔬追溯（TraceVeg）一致：方形卡位 + fill
           （产品配图 85% 是 1:1 设计稿，方卡位下铺满零裁切；少数非方实拍图靠拉伸填满、整图仍完整可见）。
           部位抠图兜底走另一套卡位参数，见 cutFallback。 -->
      <TraceCarousel
        :images="productImages"
        :ratio="productRatio"
        :fit="productFit"
        :bg="productBg"
      />
      <div class="p-kvs">
        <div v-if="product?.name" class="tr-kv"><span class="tr-kv__k">商品名称：</span><span>{{ product.name }}</span></div>
        <div v-if="product?.produceNo" class="tr-kv"><span class="tr-kv__k">生产编号：</span><span class="tr-kv__code">{{ product.produceNo }}</span></div>
        <div v-if="product?.spec" class="tr-kv"><span class="tr-kv__k">产品规格：</span><span>{{ product.spec }}</span></div>
        <div v-if="product?.weight" class="tr-kv"><span class="tr-kv__k">实际重量：</span><span>{{ product.weight }}</span></div>
        <div v-if="product?.description" class="tr-kv"><span class="tr-kv__k">产品描述：</span><span>{{ product.description }}</span></div>
      </div>

      <!-- 猪只追溯（照片轮播 + 耳号整行 + 两列 KV）。
           照片轮播放在本区块标题之下：归属清晰（是这头猪的照片，不是产品图），
           且与上方 1:1 产品图隔开，避免两张整宽大图连排把首屏顶掉。 -->
      <TraceSectionTitle title="猪只追溯" />
      <TraceCarousel v-if="pigImages.length" :images="pigImages" class="p-carousel" />
      <div v-if="pig?.earNo" class="p-pig__ear"><span class="tr-kv__k">耳号：</span><span class="tr-chip">{{ pig.earNo }}</span></div>
      <div class="p-pig__cols">
        <div v-if="pig?.birthDate || pig?.marketDate" class="p-pig__col">
          <div v-if="pig?.birthDate" class="tr-kv"><span class="tr-kv__k">出生日：</span><span class="tr-kv__code">{{ pig.birthDate }}</span></div>
          <div v-if="pig?.marketDate" class="tr-kv"><span class="tr-kv__k">出栏日：</span><span class="tr-kv__code">{{ pig.marketDate }}</span></div>
        </div>
        <div
          v-if="pig?.ageDays != null || pig?.birthWeight || pig?.marketWeight"
          class="p-pig__col p-pig__col--r"
        >
          <div v-if="pig?.ageDays != null" class="tr-kv"><span class="tr-kv__k">日龄：</span><span>{{ pig.ageDays }} 天</span></div>
          <div v-if="pig?.birthWeight" class="tr-kv"><span class="tr-kv__k">出生重：</span><span>{{ pig.birthWeight }}kg</span></div>
          <div v-if="pig?.marketWeight" class="tr-kv"><span class="tr-kv__k">出栏重：</span><span>{{ pig.marketWeight }}kg</span></div>
        </div>
      </div>
    </div>

    <!-- 品质溯源时间线 -->
    <div class="p-card">
      <TraceSectionTitle title="品质溯源时间线" />
      <div v-if="timeline.length === 0" class="tr-empty">暂无流程记录</div>
      <div v-else class="p-tl">
        <div
          v-for="(node, idx) in timeline"
          :key="idx"
          class="p-tl__row"
          :class="{ 'is-last': idx === timeline.length - 1 }"
        >
          <span class="p-tl__icon">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#fff" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"><path d="M3 8 L12 3 L21 8 V17 L12 22 L3 17 Z" /><path d="M3 8 L12 13 L21 8 M12 13 V22" /></svg>
          </span>
          <div class="p-tl__body">
            <div class="p-tl__head">
              <span class="p-tl__name">{{ traceContentLabel(node.traceContent) }}</span>
              <span v-if="node.traceTime" class="p-tl__time">{{ node.traceTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 生长记录（下钻；r134：记录数没到字典门槛就整块不显示） -->
    <div v-if="showGrowth" class="p-grow" @click="emit('go', 'grow')">
      <img class="p-grow__thumb" :src="growThumb" alt="" />
      <div class="p-grow__main">
        <div class="p-grow__title">生长记录</div>
        <div class="p-grow__sub">生长记录：{{ growthRecords.length }} 次</div>
      </div>
      <span class="p-grow__chev"><IconArrow :size="16" /></span>
    </div>

    <!-- 父系 / 母系信息（无父母耳号 → 后端返 null → 隐藏） -->
    <div v-if="showPedigree" class="p-card">
      <TraceSectionTitle title="父系 / 母系信息" />
      <div class="tr-ped">
        <div v-if="pedigree?.sireEarNo" class="tr-ped__card">
          <span class="tr-ped__head tr-ped__head--sire">父系</span>
          <div class="tr-ped__kv"><span class="tr-ped__k">耳号</span><span class="tr-ped__v tr-ped__v--code">{{ pedigree.sireEarNo }}</span></div>
          <div v-if="pedigree.sireAgeDays != null" class="tr-ped__kv"><span class="tr-ped__k">日龄</span><span class="tr-ped__v">{{ pedigree.sireAgeDays }} 天</span></div>
        </div>
        <div v-if="pedigree?.damEarNo" class="tr-ped__card">
          <span class="tr-ped__head tr-ped__head--dam">母系</span>
          <div class="tr-ped__kv"><span class="tr-ped__k">耳号</span><span class="tr-ped__v tr-ped__v--code">{{ pedigree.damEarNo }}</span></div>
          <div v-if="pedigree.damAgeDays != null" class="tr-ped__kv"><span class="tr-ped__k">日龄</span><span class="tr-ped__v">{{ pedigree.damAgeDays }} 天</span></div>
          <div v-if="pedigree.damParity != null" class="tr-ped__kv"><span class="tr-ped__k">胎次</span><span class="tr-ped__v">第 {{ pedigree.damParity }} 胎</span></div>
        </div>
      </div>
    </div>

    <!-- 养殖基地（下钻） -->
    <div class="p-base" @click="emit('go', 'pork-base')">
      <div class="p-base__main">
        <div class="p-base__title">养殖基地</div>
        <div class="p-base__sub">点击查看<IconArrow class="p-base__chev" :size="13" /></div>
      </div>
      <img class="p-base__thumb" :src="porkBaseThumb" alt="" />
    </div>

    <!-- 销售门店（row61：样式与果蔬追溯一致——上图片，下门店名称/地址） -->
    <div v-if="showStore" class="p-card">
      <TraceSectionTitle title="销售门店" />
      <img class="p-store__img" :src="storeImage" alt="门店" />
      <div class="p-store">
        <div v-if="store?.name" class="p-store__row">
          <svg class="p-store__ic" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2f7c44" stroke-width="1.6" stroke-linejoin="round"><path d="M4 9 L5 4 H19 L20 9 M4 9 V20 H20 V9 M4 9 H20" /></svg>
          <span class="p-store__k">门店名称：</span><span>{{ store.name }}</span>
        </div>
        <div v-if="store?.address" class="p-store__row">
          <svg class="p-store__ic" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2f7c44" stroke-width="1.6" stroke-linejoin="round"><path d="M12 22 C12 22 5 15 5 9 A7 7 0 0 1 19 9 C19 15 12 22 12 22 Z" /><circle cx="12" cy="9" r="2.5" /></svg>
          <span class="p-store__k p-store__k--addr">门店地址：</span><span class="p-store__addr">{{ store.address }}</span>
        </div>
      </div>
    </div>
  </TraceLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PublicTraceVo } from '@/api/types';
import { traceContentLabel } from '@/api/labels';
import TraceLayout from './TraceLayout.vue';
import TraceSectionTitle from './TraceSectionTitle.vue';
import TraceCarousel from './TraceCarousel.vue';
import IconArrow from './IconArrow.vue';
import porkBaseThumb from '@/assets/base/pork-base-thumb.jpg';
import storeDefault from '@/assets/base/store-default.jpg';
import cutFrontLeg from '@/assets/pork-cut/front-leg.png';
import cutPorkBelly from '@/assets/pork-cut/pork-belly.png';
import cutRibs from '@/assets/pork-cut/ribs.png';
import cutElbow from '@/assets/pork-cut/elbow.png';
import cutPorkChop from '@/assets/pork-cut/pork-chop.png';

const props = defineProps<{ trace: PublicTraceVo; code: string }>();
const emit = defineEmits<{ (e: 'go', target: string, query?: Record<string, string>): void }>();

const product = computed(() => props.trace.product ?? null);

/**
 * 部位中文名 → 本地抠图（与 admin 门店猪肉打包面板 LOCAL_CUT_IMG 同一套图，保持两端一致）。
 * 门店现场生码在客户未把部位配成「门店打包间」产品时，商品名取自部位字典 djs_pork_cut_product，
 * 后端反查不到产品图 → 用这里的部位图兜底，避免产品卡无图。
 */
const CUT_IMG: Record<string, string> = {
  前腿肉: cutFrontLeg,
  五花肉: cutPorkBelly,
  排骨: cutRibs,
  肘子: cutElbow,
  大排: cutPorkChop
};

/**
 * 产品图（轮播入参，与果蔬追溯同一个 TraceCarousel）：后端解析出的配置图优先，无则按部位名回落本地抠图。
 * 必须先判自有属性再取值，不能裸下标——商品名是客户在 admin 自由填的，
 * 取到 `toString` / `constructor` 这类原型成员会当成图片 URL 渲染出一张碎图。
 */
const productImages = computed(() => {
  const p = product.value;
  if (p?.imageUrl) return [p.imageUrl];
  const name = p?.name;
  return name && Object.prototype.hasOwnProperty.call(CUT_IMG, name) ? [CUT_IMG[name]] : [];
});

/** 当前展示的是本地部位抠图兜底（而非客户在 admin 配的产品图）。 */
const cutFallback = computed(() => !product.value?.imageUrl && productImages.value.length > 0);

/**
 * 产品图卡位参数，两条路径分别取值：
 *  - 配置产品图（常规）→ `1 / 1` + `fill`，与果蔬追溯完全一致（配图多为 1:1 设计稿，铺满零裁切）。
 *  - 部位抠图兜底 → `16 / 10` + `contain` + 白底。这几张源图只有 156x140（比例 1.114 的白底实拍横图），
 *    套 1:1 铺满会纵向多拉伸 11% 把肉块拉变形，且 2.4x 上采样在 DPR2 上糊成一团；
 *    16:10 卡位下 contain 只放大 1.47x、零形变，白底与白卡无缝（灰底会露出两条灰柱）。
 */
const productRatio = computed(() => (cutFallback.value ? '16 / 10' : '1 / 1'));
const productFit = computed<'cover' | 'fill' | 'contain'>(() => (cutFallback.value ? 'contain' : 'fill'));
const productBg = computed(() => (cutFallback.value ? '#fff' : '#f0f2f1'));
const pig = computed(() => props.trace.pig ?? null);
const pedigree = computed(() => props.trace.pedigree ?? null);
const timeline = computed(() => props.trace.timeline ?? []);
const store = computed(() => props.trace.store ?? null);

// 猪只照片轮播：pig.photoUrl + 生长记录照片（无则隐藏；product.imageUrl 已作产品缩略图，不重复入轮播）
const pigImages = computed(() =>
  [pig.value?.photoUrl, ...(props.trace.growthRecords ?? []).map((g) => g.photoUrl)].filter(
    (s): s is string => !!s
  )
);

// 生长记录下钻入口：生长记录总数；缩略图取首张生长照片，无则默认猪图
const growthRecords = computed(() => props.trace.growthRecords ?? []);
const growThumb = computed(
  () => growthRecords.value.find((g) => !!g.photoUrl)?.photoUrl || porkBaseThumb
);
// r134：生长记录入口的显示门槛由后端下发（字典 djs_trace_grow_show_min，客户可改），
// 记录数不足门槛整块不出现——不是显示成「0 次」。后端没给（老接口）时按 3 兜底。
const showGrowth = computed(() => growthRecords.value.length >= (props.trace.growthShowMin ?? 3));

// r131：时间轴每行只有「节点名 + 时间」，重量与操作人都不显示
// （重量在顶部产品卡已有，操作人对顾客没有意义）。

const showPedigree = computed(
  () => !!pedigree.value && (!!pedigree.value.sireEarNo || !!pedigree.value.damEarNo)
);
const showStore = computed(() => !!store.value && (!!store.value.name || !!store.value.address));
// 门店配图：优先门店自有图（image_oss_id），无则默认门店门面图兜底
const storeImage = computed(() => store.value?.imageUrl || storeDefault);
</script>

<style lang="scss" scoped>
@use '@/styles/trace.scss';

/* 白卡 */
.p-card {
  background: #fff;
  border-radius: 16px;
  padding: 14px 16px 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

/* 产品信息 KV 块（产品图整块在上，KV 列在下 —— 与果蔬追溯 .v-kvs 同版式） */
.p-kvs {
  margin-top: 10px;
}
/* 猪只照片轮播贴在「猪只追溯」标题下（标题自带 14px 下边距），只需与下方耳号行留白 */
.p-carousel {
  margin-bottom: 12px;
}

/* 猪只追溯：耳号整行 + 两列 KV（左列含出栏日 datetime，右列短值，两端对齐） */
.p-pig__ear {
  margin-bottom: 6px;
}
/* 左列含出栏日 datetime（flex 撑开保证单行不折），右列短值贴右 */
.p-pig__cols {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.p-pig__col {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}
.p-pig__col:first-child {
  flex: 1 1 auto;
}
.p-pig__col--r {
  flex: 0 0 auto;
}
.p-pig__cols .tr-kv {
  font-size: 13.5px;
}

/* 生长记录下钻入口（左图右文 + 箭头） */
.p-grow {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 16px;
  padding: 12px 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  cursor: pointer;
}
.p-grow__thumb {
  flex: 0 0 60px;
  width: 60px;
  height: 60px;
  border-radius: 10px;
  object-fit: cover;
  display: block;
}
.p-grow__main {
  flex: 1;
  min-width: 0;
}
.p-grow__title {
  font-size: 15px;
  font-weight: 700;
  color: #2b2b2b;
}
.p-grow__sub {
  margin-top: 4px;
  font-size: 13px;
  color: #2f7c44;
}
.p-grow__chev {
  flex: 0 0 auto;
  display: flex;
  color: #c0c4cc;
}

/* 纵向时间轴（绿方块图标 + 右对齐棕色时间） */
.p-tl {
  padding: 4px 0 2px;
}
.p-tl__row {
  position: relative;
  display: flex;
  gap: 12px;
  padding-bottom: 16px;
}
.p-tl__row:last-child {
  padding-bottom: 0;
}
.p-tl__row:not(.is-last)::before {
  content: '';
  position: absolute;
  left: 16px;
  top: 34px;
  bottom: -2px;
  width: 2px;
  background: #e2e8e4;
}
.p-tl__icon {
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
.p-tl__body {
  flex: 1;
  min-width: 0;
  padding-top: 1px;
}
.p-tl__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.p-tl__name {
  font-size: 15px;
  font-weight: 700;
  color: #2f3a33;
}
.p-tl__time {
  flex: 0 0 auto;
  font-size: 12.5px;
  color: #9c5a30;
  font-variant-numeric: tabular-nums;
}
/* 养殖基地入口（浅绿底 · 左文右图） */
.p-base {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #eef6f0;
  border-radius: 16px;
  padding: 12px 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  cursor: pointer;
}
.p-base__main {
  flex: 1;
  min-width: 0;
}
.p-base__title {
  font-size: 15px;
  font-weight: 700;
  color: #26543a;
}
.p-base__sub {
  margin-top: 4px;
  font-size: 13px;
  color: #2f7c44;
  display: flex;
  align-items: center;
}
.p-base__chev {
  margin-left: 3px;
}
.p-base__thumb {
  flex: 0 0 96px;
  width: 96px;
  height: 60px;
  border-radius: 10px;
  object-fit: cover;
  display: block;
}

/* 销售门店（row61：与果蔬追溯一致——上图片，下门店名称/地址） */
.p-store__img {
  width: 100%;
  height: 150px;
  margin: 8px 0 4px;
  border-radius: 10px;
  object-fit: cover;
  display: block;
}
.p-store {
  margin-top: 2px;
}
.p-store__row {
  display: flex;
  /* 顶对齐：地址折行成多行时，图标与 label 跟首行对齐，不被整块垂直居中 */
  align-items: flex-start;
  gap: 7px;
  padding: 5px 0;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}
.p-store__ic {
  flex: 0 0 auto;
  margin-top: 2px; /* 16px 图标在 21px 行高里视觉居首行 */
}
.p-store__k {
  color: #808680;
}
/* 门店地址自动换行显示全：label 不缩，地址值占满剩余宽度、超长折行不截断 */
.p-store__k--addr {
  flex: 0 0 auto;
  white-space: nowrap;
}
.p-store__addr {
  flex: 1;
  min-width: 0;
  white-space: normal;
  word-break: break-word;
}
</style>
