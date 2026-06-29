<template>
  <TraceLayout :title="product?.name || '猪肉追溯'" :trace-code="product?.produceCode || code" :cover="product?.imageUrl">
    <!-- 产品信息 -->
    <div class="t-card">
      <div class="t-section-title">产品信息</div>
      <div class="t-product-body">
        <div class="t-product-img">
          <img v-if="product?.imageUrl" :src="product.imageUrl" alt="" />
          <div v-else class="t-img-ph">暂无图</div>
        </div>
        <div class="t-product-info">
          <div class="t-product-name">{{ product?.name }}</div>
          <div v-if="product?.weight" class="t-product-meta">重量：{{ product.weight }}</div>
          <div v-if="product?.spec" class="t-product-meta">规格：{{ product.spec }}</div>
          <div class="t-product-meta">编码：{{ product?.produceCode || code }}</div>
          <div v-if="product?.description" class="t-product-meta">产品描述：{{ product.description }}</div>
        </div>
      </div>
    </div>

    <!-- 猪只追溯 -->
    <div v-if="pig" class="t-card">
      <div class="t-section-title">猪只追溯</div>
      <div v-if="pig.photoUrl" class="pig-photo">
        <img :src="pig.photoUrl" alt="" />
      </div>
      <div v-if="pig.earNo" class="t-kv">
        <span class="t-kv__label">耳号</span>
        <span class="t-chip">{{ pig.earNo }}</span>
      </div>
      <div v-if="pig.sex" class="t-kv">
        <span class="t-kv__label">性别</span>
        <span class="t-kv__val">{{ pigSexLabel(pig.sex) }}</span>
      </div>
      <div v-if="pig.weight" class="t-kv">
        <span class="t-kv__label">体重</span>
        <span class="t-kv__val">{{ pig.weight }} kg</span>
      </div>
      <div v-if="pig.breed" class="t-kv">
        <span class="t-kv__label">品种</span>
        <span class="t-kv__val">{{ pigBreedLabel(pig.breed) }}</span>
      </div>
      <div v-if="pig.farmName" class="t-kv">
        <span class="t-kv__label">农场</span>
        <span class="t-kv__val">{{ pig.farmName }}</span>
      </div>
      <div v-if="pig.barnName" class="t-kv">
        <span class="t-kv__label">栋舍</span>
        <span class="t-kv__val">{{ pig.barnName }}</span>
      </div>
      <div v-if="pig.birthDate" class="t-kv">
        <span class="t-kv__label">出生</span>
        <span class="t-kv__val">{{ pig.birthDate }}</span>
      </div>
      <div v-if="pig.ageDays != null" class="t-kv">
        <span class="t-kv__label">日龄</span>
        <span class="t-kv__val">{{ pig.ageDays }} 天</span>
      </div>
      <div v-if="pig.marketDate" class="t-kv">
        <span class="t-kv__label">出栏</span>
        <span class="t-kv__val">{{ pig.marketDate }}</span>
      </div>
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

    <!-- 生长记录入口 -->
    <div v-if="hasGrowOrMed" class="t-card">
      <div class="t-entry" @click="emit('go', 'grow')">
        <div class="t-entry__main">
          <span>生长记录：{{ growthCount }} 次</span>
          <span class="t-entry__sub">疫苗保健：{{ medicationCount }} 次</span>
        </div>
        <div class="t-entry__arrow">
          <span>查看详情</span>
          <IconArrow />
        </div>
      </div>
    </div>

    <!-- 父系 / 母系 -->
    <div v-if="showPedigree" class="t-card">
      <div class="t-section-title">父系 / 母系信息</div>
      <div class="t-pedigree-cards">
        <div v-if="pedigree?.sireEarNo" class="t-pedigree-card">
          <div class="t-pedigree-head t-pedigree-head--sire">父系</div>
          <div class="t-kv">
            <span class="t-kv__label">耳号</span>
            <span class="t-chip">{{ pedigree.sireEarNo }}</span>
          </div>
          <div v-if="pedigree.sireBreed" class="t-kv">
            <span class="t-kv__label">品种</span>
            <span class="t-kv__val">{{ pedigree.sireBreed }}</span>
          </div>
          <div v-if="pedigree.sireAgeDays != null" class="t-kv">
            <span class="t-kv__label">日龄</span>
            <span class="t-kv__val">{{ pedigree.sireAgeDays }} 天</span>
          </div>
        </div>
        <div v-if="pedigree?.damEarNo" class="t-pedigree-card">
          <div class="t-pedigree-head t-pedigree-head--dam">母系</div>
          <div class="t-kv">
            <span class="t-kv__label">耳号</span>
            <span class="t-chip">{{ pedigree.damEarNo }}</span>
          </div>
          <div v-if="pedigree.damBreed" class="t-kv">
            <span class="t-kv__label">品种</span>
            <span class="t-kv__val">{{ pedigree.damBreed }}</span>
          </div>
          <div v-if="pedigree.damAgeDays != null" class="t-kv">
            <span class="t-kv__label">日龄</span>
            <span class="t-kv__val">{{ pedigree.damAgeDays }} 天</span>
          </div>
          <div v-if="pedigree.damParity != null" class="t-kv">
            <span class="t-kv__label">胎次</span>
            <span class="t-kv__val">第 {{ pedigree.damParity }} 胎</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 检验检疫（V1 数据源缺口恒空 → 隐藏） -->
    <div v-if="showQuarantine" class="t-card">
      <div class="t-section-title">检验检疫</div>
      <div v-if="quarantine?.certNo" class="t-kv">
        <span class="t-kv__label">检疫证号</span>
        <span class="t-kv__val">{{ quarantine.certNo }}</span>
      </div>
      <div v-if="quarantine?.agency" class="t-kv">
        <span class="t-kv__label">检疫机构</span>
        <span class="t-kv__val">{{ quarantine.agency }}</span>
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
import { traceContentLabel, pigSexLabel, pigBreedLabel } from '@/api/labels';
import TraceLayout from './TraceLayout.vue';
import IconArrow from './IconArrow.vue';

const props = defineProps<{ trace: PublicTraceVo; code: string }>();
const emit = defineEmits<{ (e: 'go', target: string, query?: Record<string, string>): void }>();

const product = computed(() => props.trace.product ?? null);
const pig = computed(() => props.trace.pig ?? null);
const pedigree = computed(() => props.trace.pedigree ?? null);
const timeline = computed(() => props.trace.timeline ?? []);
const quarantine = computed(() => props.trace.quarantine ?? null);
const store = computed(() => props.trace.store ?? null);

const growthCount = computed(() => props.trace.growthRecords?.length ?? 0);
const medicationCount = computed(() => props.trace.medications?.length ?? 0);
const hasGrowOrMed = computed(() => growthCount.value > 0 || medicationCount.value > 0);
const showPedigree = computed(() => !!pedigree.value && (!!pedigree.value.sireEarNo || !!pedigree.value.damEarNo));
const showQuarantine = computed(() => !!quarantine.value && (!!quarantine.value.certNo || !!quarantine.value.agency));
const showStore = computed(() => !!store.value && (!!store.value.name || !!store.value.address));
</script>

<style lang="scss" scoped>
@use '@/styles/trace.scss';

.pig-photo {
  width: 100%;
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
}
.pig-photo img {
  width: 100%;
  display: block;
  border-radius: 8px;
}
</style>
