<template>
  <TraceLayout theme="pork">
    <!-- 照片 -->
    <div class="tr-photo">
      <img v-if="product?.imageUrl" :src="product.imageUrl" alt="" />
      <div v-else class="tr-photo__ph">暂无图</div>
    </div>

    <!-- 猪只追溯（合并产品 + 猪只 KV） -->
    <TraceSectionTitle title="猪只追溯" />
    <div v-if="product?.name" class="tr-kv"><span class="tr-kv__k">商品名称：</span><span>{{ product.name }}</span></div>
    <div class="tr-kv"><span class="tr-kv__k">编码：</span><span class="tr-kv__code">{{ product?.produceCode || code }}</span></div>
    <div v-if="pig?.earNo" class="tr-kv"><span class="tr-kv__k">耳号：</span><span class="tr-chip">{{ pig.earNo }}</span></div>
    <div v-if="pig?.sex" class="tr-kv"><span class="tr-kv__k">性别：</span><span>{{ pigSexLabel(pig.sex) }}</span></div>
    <div v-if="pig?.breed" class="tr-kv"><span class="tr-kv__k">品种：</span><span>{{ pigBreedLabel(pig.breed) }}</span></div>
    <div v-if="pig?.farmName" class="tr-kv"><span class="tr-kv__k">农场：</span><span>{{ pig.farmName }}</span></div>
    <div v-if="pig?.barnName" class="tr-kv"><span class="tr-kv__k">栋舍：</span><span>{{ pig.barnName }}</span></div>
    <div v-if="pig?.birthDate" class="tr-kv"><span class="tr-kv__k">出生：</span><span class="tr-kv__code">{{ pig.birthDate }}</span></div>
    <div v-if="pig?.ageDays != null" class="tr-kv"><span class="tr-kv__k">日龄：</span><span>{{ pig.ageDays }} 天</span></div>
    <div v-if="pig?.marketDate" class="tr-kv"><span class="tr-kv__k">出栏：</span><span class="tr-kv__code">{{ pig.marketDate }}</span></div>

    <div class="tr-hr" />

    <!-- 流程处理时间轴（纵向） -->
    <TraceSectionTitle title="流程处理时间轴" />
    <div v-if="timeline.length === 0" class="tr-empty">暂无流程记录</div>
    <div v-else class="tr-tl">
      <div v-for="(node, idx) in timeline" :key="idx" class="tr-tl__row">
        <div class="tr-tl__dot" />
        <div class="tr-tl__body">
          <span class="tr-tl__name">{{ traceContentLabel(node.traceContent) }}</span>
          <span v-if="node.weight" class="tr-tl__wt">{{ node.weight }}kg</span>
          <span v-if="node.traceTime" class="tr-tl__time">{{ node.traceTime }}</span>
          <span v-if="node.operatorName" class="tr-tl__op">{{ node.operatorName }}</span>
        </div>
      </div>
    </div>

    <!-- 生长记录 / 疫苗保健下钻 -->
    <div v-if="hasGrowOrMed" class="tr-entry" @click="emit('go', 'grow')">
      <div class="tr-entry__main">
        <span class="tr-entry__title">生长记录 · 疫苗保健</span>
        <span class="tr-entry__sub">生长 {{ growthCount }} 次 · 疫苗保健 {{ medicationCount }} 次</span>
      </div>
      <span class="tr-entry__arrow"><IconArrow :size="16" /></span>
    </div>

    <!-- 父系 / 母系（无父母耳号 → 后端返 null → 隐藏） -->
    <template v-if="showPedigree">
      <div class="tr-hr" />
      <TraceSectionTitle title="父系 / 母系信息" />
      <div class="tr-ped">
        <div v-if="pedigree?.sireEarNo" class="tr-ped__card">
          <span class="tr-ped__head tr-ped__head--sire">父系</span>
          <div class="tr-ped__kv"><span class="tr-ped__k">耳号</span><span class="tr-ped__v tr-ped__v--code">{{ pedigree.sireEarNo }}</span></div>
          <div v-if="pedigree.sireBreed" class="tr-ped__kv"><span class="tr-ped__k">品种</span><span class="tr-ped__v">{{ pedigree.sireBreed }}</span></div>
          <div v-if="pedigree.sireAgeDays != null" class="tr-ped__kv"><span class="tr-ped__k">日龄</span><span class="tr-ped__v">{{ pedigree.sireAgeDays }} 天</span></div>
        </div>
        <div v-if="pedigree?.damEarNo" class="tr-ped__card">
          <span class="tr-ped__head tr-ped__head--dam">母系</span>
          <div class="tr-ped__kv"><span class="tr-ped__k">耳号</span><span class="tr-ped__v tr-ped__v--code">{{ pedigree.damEarNo }}</span></div>
          <div v-if="pedigree.damBreed" class="tr-ped__kv"><span class="tr-ped__k">品种</span><span class="tr-ped__v">{{ pedigree.damBreed }}</span></div>
          <div v-if="pedigree.damAgeDays != null" class="tr-ped__kv"><span class="tr-ped__k">日龄</span><span class="tr-ped__v">{{ pedigree.damAgeDays }} 天</span></div>
          <div v-if="pedigree.damParity != null" class="tr-ped__kv"><span class="tr-ped__k">胎次</span><span class="tr-ped__v">第 {{ pedigree.damParity }} 胎</span></div>
        </div>
      </div>
    </template>

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
import { traceContentLabel, pigSexLabel, pigBreedLabel } from '@/api/labels';
import TraceLayout from './TraceLayout.vue';
import TraceSectionTitle from './TraceSectionTitle.vue';
import IconArrow from './IconArrow.vue';

const props = defineProps<{ trace: PublicTraceVo; code: string }>();
const emit = defineEmits<{ (e: 'go', target: string, query?: Record<string, string>): void }>();

const product = computed(() => props.trace.product ?? null);
const pig = computed(() => props.trace.pig ?? null);
const pedigree = computed(() => props.trace.pedigree ?? null);
const timeline = computed(() => props.trace.timeline ?? []);
const store = computed(() => props.trace.store ?? null);

const growthCount = computed(() => props.trace.growthRecords?.length ?? 0);
const medicationCount = computed(() => props.trace.medications?.length ?? 0);
const hasGrowOrMed = computed(() => growthCount.value > 0 || medicationCount.value > 0);
const showPedigree = computed(() => !!pedigree.value && (!!pedigree.value.sireEarNo || !!pedigree.value.damEarNo));
const showStore = computed(() => !!store.value && (!!store.value.name || !!store.value.address));
</script>

<style lang="scss" scoped>
@use '@/styles/trace.scss';
</style>
