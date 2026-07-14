<template>
  <!-- 生长记录详情页（pig2 image2）：pork hero（无信任条）+ 白卡 + 纵向生长时间轴 -->
  <TraceLayout theme="pork" :show-trust="false">
    <div class="g-card">
      <div class="g-title">生长记录</div>

      <div v-if="growthRecords.length === 0" class="tr-empty">暂无生长记录</div>
      <div v-else class="g-tl">
        <div
          v-for="(g, idx) in growthRecords"
          :key="idx"
          class="g-tl__row"
          :class="{ 'is-last': idx === growthRecords.length - 1 }"
        >
          <span class="g-tl__dot" />
          <div class="g-tl__body">
            <div class="g-tl__head">
              <span v-if="g.ageDays != null" class="g-tl__age">{{ g.ageDays }} 日龄</span>
              <span v-if="g.date" class="g-tl__date">{{ g.date }}</span>
              <span v-if="g.operatorName" class="g-tl__op">{{ g.operatorName }}</span>
            </div>
            <div v-if="metricOf(g)" class="g-tl__metric">{{ metricOf(g) }}</div>
            <img v-if="g.photoUrl" class="g-tl__photo" :src="g.photoUrl" alt="生长记录照片" />
          </div>
        </div>
      </div>
    </div>
  </TraceLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PublicTraceVo, TraceGrowthRecordVo } from '@/api/types';
import TraceLayout from './TraceLayout.vue';

const props = defineProps<{ trace: PublicTraceVo }>();

const growthRecords = computed(() => props.trace.growthRecords ?? []);

// 度量：体重（kg）+ 背膘（mm），有则展示，均无则不出行
function metricOf(g: TraceGrowthRecordVo): string {
  const parts: string[] = [];
  if (g.weight) parts.push(`体重 ${g.weight}kg`);
  if (g.backfat) parts.push(`背膘 ${g.backfat}mm`);
  return parts.join('　');
}
</script>

<style lang="scss" scoped>
@use '@/styles/trace.scss';

.g-card {
  background: #fff;
  border-radius: 16px;
  padding: 18px 16px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}
.g-title {
  font-size: 21px;
  font-weight: 800;
  color: #2b2b2b;
  letter-spacing: 0.5px;
  margin-bottom: 18px;
}

/* 纵向时间轴（棕点 + 连线） */
.g-tl__row {
  position: relative;
  display: flex;
  gap: 14px;
  padding-bottom: 22px;
}
.g-tl__row:last-child {
  padding-bottom: 0;
}
.g-tl__row:not(.is-last)::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 16px;
  bottom: -2px;
  width: 2px;
  background: #e0d0c5;
}
.g-tl__dot {
  flex: 0 0 14px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #7a4531;
  margin-top: 3px;
  z-index: 1;
  box-shadow: 0 0 0 3px #f3e9e2;
}
.g-tl__body {
  flex: 1;
  min-width: 0;
}
.g-tl__head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.g-tl__age {
  flex: 0 0 auto;
  background: #7a4531;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 6px;
}
.g-tl__date {
  font-size: 13px;
  color: #606266;
  font-variant-numeric: tabular-nums;
}
.g-tl__op {
  margin-left: auto;
  flex: 0 0 auto;
  background: #e8f3ec;
  color: #2f7c44;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 6px;
}
.g-tl__metric {
  margin-top: 9px;
  font-size: 16px;
  font-weight: 700;
  color: #2f3a33;
}
.g-tl__photo {
  margin-top: 9px;
  width: 180px;
  max-width: 100%;
  aspect-ratio: 3 / 2;
  border-radius: 10px;
  object-fit: cover;
  display: block;
}
</style>
