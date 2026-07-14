<template>
  <TraceLayout theme="pork">
    <!-- 产品 + 猪只信息 -->
    <div class="p-card">
      <!-- 产品 header：缩略图 + KV -->
      <div class="p-prod">
        <img v-if="product?.imageUrl" class="p-prod__thumb" :src="product.imageUrl" alt="" />
        <div class="p-prod__kv">
          <div v-if="product?.name" class="tr-kv"><span class="tr-kv__k">商品名称：</span><span>{{ product.name }}</span></div>
          <div class="tr-kv"><span class="tr-kv__k">编码：</span><span class="tr-kv__code">{{ product?.produceCode || code }}</span></div>
          <div v-if="product?.spec" class="tr-kv"><span class="tr-kv__k">规格：</span><span>{{ product.spec }}</span></div>
          <div v-if="product?.weight" class="tr-kv"><span class="tr-kv__k">重量：</span><span>{{ product.weight }}</span></div>
        </div>
      </div>
      <div v-if="product?.description" class="p-desc"><span class="tr-kv__k">产品描述：</span>{{ product.description }}</div>

      <!-- 猪只照片轮播（pig.photoUrl + 生长记录照片；无则隐藏） -->
      <TraceCarousel v-if="pigImages.length" :images="pigImages" class="p-carousel" />

      <!-- 猪只追溯（耳号整行 + 两列 KV） -->
      <TraceSectionTitle title="猪只追溯" />
      <div v-if="pig?.earNo" class="p-pig__ear"><span class="tr-kv__k">耳号：</span><span class="tr-chip">{{ pig.earNo }}</span></div>
      <div class="p-pig__cols">
        <div v-if="pig?.sex || pig?.birthDate || pig?.marketDate" class="p-pig__col">
          <div v-if="pig?.sex" class="tr-kv"><span class="tr-kv__k">性别：</span><span>{{ pigSexLabel(pig.sex) }}</span></div>
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

    <!-- 流程处理时间轴 -->
    <div class="p-card">
      <TraceSectionTitle title="流程处理时间轴" />
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
              <span class="p-tl__name">{{ traceContentLabel(node.traceContent) }}<span v-if="node.weight" class="p-tl__wt"> · {{ node.weight }}kg</span></span>
              <span v-if="node.traceTime" class="p-tl__time">{{ node.traceTime }}</span>
            </div>
            <div v-if="node.operatorName" class="p-tl__op">{{ node.operatorName }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 生长记录（下钻；始终显示，无数据时详情页显示「暂无生长记录」） -->
    <div class="p-grow" @click="emit('go', 'grow')">
      <img class="p-grow__thumb" :src="growThumb" alt="" />
      <div class="p-grow__main">
        <div class="p-grow__title">生长记录</div>
        <div class="p-grow__sub">背膘测量：{{ backfatCount }} 次　生长记录：{{ growthRecords.length }} 次</div>
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

    <!-- 销售门店 -->
    <div v-if="showStore" class="p-card">
      <TraceSectionTitle title="销售门店" />
      <div class="p-store">
        <div class="p-store__info">
          <div v-if="store?.name" class="p-store__block">
            <div class="p-store__label">
              <svg class="p-store__ic" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2f7c44" stroke-width="1.6" stroke-linejoin="round"><path d="M4 9 L5 4 H19 L20 9 M4 9 V20 H20 V9 M4 9 H20" /></svg>门店名称
            </div>
            <div class="p-store__val">{{ store.name }}</div>
          </div>
          <div v-if="store?.address" class="p-store__block">
            <div class="p-store__label">
              <svg class="p-store__ic" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2f7c44" stroke-width="1.6" stroke-linejoin="round"><path d="M12 22 C12 22 5 15 5 9 A7 7 0 0 1 19 9 C19 15 12 22 12 22 Z" /><circle cx="12" cy="9" r="2.5" /></svg>门店地址
            </div>
            <div class="p-store__val">{{ store.address }}</div>
          </div>
        </div>
        <img class="p-store__img" :src="storeImage" alt="门店" />
      </div>
    </div>
  </TraceLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PublicTraceVo } from '@/api/types';
import { traceContentLabel, pigSexLabel } from '@/api/labels';
import TraceLayout from './TraceLayout.vue';
import TraceSectionTitle from './TraceSectionTitle.vue';
import TraceCarousel from './TraceCarousel.vue';
import IconArrow from './IconArrow.vue';
import porkBaseThumb from '@/assets/base/pork-base-thumb.jpg';
import porkStoreDefault from '@/assets/base/pork-store-default.jpg';

const props = defineProps<{ trace: PublicTraceVo; code: string }>();
const emit = defineEmits<{ (e: 'go', target: string, query?: Record<string, string>): void }>();

const product = computed(() => props.trace.product ?? null);
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

// 生长记录下钻入口：背膘测量次数（有背膘值的记录数）+ 生长记录总数；缩略图取首张生长照片，无则默认猪图
const growthRecords = computed(() => props.trace.growthRecords ?? []);
const backfatCount = computed(() => growthRecords.value.filter((g) => !!g.backfat).length);
const growThumb = computed(
  () => growthRecords.value.find((g) => !!g.photoUrl)?.photoUrl || porkBaseThumb
);

const showPedigree = computed(
  () => !!pedigree.value && (!!pedigree.value.sireEarNo || !!pedigree.value.damEarNo)
);
const showStore = computed(() => !!store.value && (!!store.value.name || !!store.value.address));
// 门店配图：优先门店自有图（image_oss_id），无则默认门店门面图兜底
const storeImage = computed(() => store.value?.imageUrl || porkStoreDefault);
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

/* 产品 header：缩略图 + KV */
.p-prod {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.p-prod__thumb {
  flex: 0 0 84px;
  width: 84px;
  height: 84px;
  border-radius: 10px;
  object-fit: cover;
  display: block;
}
.p-prod__kv {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.p-desc {
  margin-top: 10px;
  font-size: 13.5px;
  color: #333;
  line-height: 1.6;
}
.p-carousel {
  margin-top: 12px;
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
.p-tl__wt {
  color: #2f7c44;
  font-weight: 700;
}
.p-tl__time {
  flex: 0 0 auto;
  font-size: 12.5px;
  color: #9c5a30;
  font-variant-numeric: tabular-nums;
}
.p-tl__op {
  margin-top: 3px;
  font-size: 12.5px;
  color: #909399;
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

/* 销售门店：左文（图标+标签 / 值 堆叠）右图 */
.p-store {
  display: flex;
  gap: 14px;
  align-items: center;
}
.p-store__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.p-store__label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #808680;
}
.p-store__ic {
  flex: 0 0 auto;
}
.p-store__val {
  margin-top: 3px;
  padding-left: 22px;
  font-size: 14px;
  font-weight: 600;
  color: #2b2b2b;
  line-height: 1.5;
}
.p-store__img {
  flex: 0 0 138px;
  width: 138px;
  height: 92px;
  border-radius: 10px;
  object-fit: cover;
  display: block;
}
</style>
