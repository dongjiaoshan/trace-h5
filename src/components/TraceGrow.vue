<template>
  <div class="grow-page">
    <div class="grow-tabs">
      <button class="grow-tab" :class="{ 'is-active': activeTab === 'growth' }" @click="activeTab = 'growth'">生长记录</button>
      <button class="grow-tab" :class="{ 'is-active': activeTab === 'medication' }" @click="activeTab = 'medication'">疫苗保健记录</button>
    </div>

    <template v-if="activeTab === 'growth'">
      <div v-if="growthRecords.length === 0" class="t-empty">暂无生长记录</div>
      <div v-for="(g, idx) in growthRecords" :key="idx" class="t-card grow-row">
        <div class="grow-row__head">
          <div class="t-timeline-dot"></div>
          <span class="grow-date">{{ g.date }}</span>
        </div>
        <div class="grow-metrics">
          <span v-if="g.ageDays != null">日龄 {{ g.ageDays }} 天</span>
          <span v-if="g.weight">体重 {{ g.weight }} kg</span>
          <span v-if="g.backfat">背膘 {{ g.backfat }} mm</span>
        </div>
        <div v-if="g.operatorName" class="grow-op">操作人：{{ g.operatorName }}</div>
        <div v-if="g.photoUrl" class="grow-photo">
          <PreviewImage :src="g.photoUrl" fit="cover" />
        </div>
      </div>
    </template>

    <template v-else>
      <div v-if="medications.length === 0" class="t-empty">暂无疫苗保健记录</div>
      <div v-for="(m, idx) in medications" :key="idx" class="t-card grow-row">
        <div class="grow-row__head">
          <div class="t-timeline-dot"></div>
          <span class="grow-date">{{ m.date }}</span>
        </div>
        <div class="med-name-row">
          <span class="med-type">{{ medicationTypeLabel(m.type) }}</span>
          <span class="med-name">{{ m.name }}</span>
        </div>
        <div class="grow-metrics">
          <span v-if="m.ageDays != null">日龄 {{ m.ageDays }} 天</span>
          <span v-if="m.operatorName">操作人 {{ m.operatorName }}</span>
        </div>
        <div v-if="m.reason" class="grow-op">原因：{{ m.reason }}</div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { PublicTraceVo } from '@/api/types';
import { medicationTypeLabel } from '@/api/labels';
import PreviewImage from './PreviewImage.vue';

const props = defineProps<{ trace: PublicTraceVo }>();

const activeTab = ref<'growth' | 'medication'>('growth');
const growthRecords = computed(() => props.trace.growthRecords ?? []);
const medications = computed(() => props.trace.medications ?? []);
</script>

<style lang="scss" scoped>
@use '@/styles/trace.scss';

.grow-page {
  padding: 12px;
}
.grow-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 12px;
}
.grow-tab {
  appearance: none;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #606266;
  padding: 10px 4px;
  margin-bottom: -1px;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}
.grow-tab.is-active {
  color: #2f7c44;
  border-bottom-color: #2f7c44;
  font-weight: 600;
}
.grow-row {
  margin-bottom: 12px;
}
.grow-row__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.grow-date {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  font-variant-numeric: tabular-nums;
}
.grow-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 13px;
  color: #606266;
  margin-bottom: 6px;
}
.grow-op {
  font-size: 12px;
  color: #909399;
}
.grow-photo {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  margin-top: 8px;
  overflow: hidden;
}
.med-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.med-type {
  display: inline-block;
  background: #e8f3ec;
  color: #2f7c44;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 6px;
}
.med-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}
</style>
