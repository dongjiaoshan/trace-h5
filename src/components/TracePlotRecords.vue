<template>
  <div class="pr-page">
    <div class="t-card">
      <div class="t-section-title">作物农事记录</div>
      <div v-if="!showRecords" class="t-empty">暂无农事记录</div>
      <div v-for="(r, idx) in shownRecords" :key="idx" class="pr-row">
        <div class="pr-dot" :style="{ background: dotColor(r.workType) }"></div>
        <div class="pr-content">
          <div class="pr-head">
            <span class="pr-type">{{ farmWorkTypeLabel(r.workType) }}</span>
            <span v-if="r.date" class="pr-date">{{ r.date }}</span>
          </div>
          <div v-if="r.detail" class="pr-detail">{{ r.detail }}</div>
          <div v-if="r.operatorName" class="pr-op">{{ r.operatorName }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PublicTraceVo } from '@/api/types';
import { farmWorkTypeLabel } from '@/api/labels';

const props = defineProps<{ trace: PublicTraceVo }>();

const records = computed(() => props.trace.plotRecords ?? []);

// r135：门槛没到就当没有记录——入口藏了但路由还通，直接输 URL 进来
// 也不能把条数不足的记录漏出去，否则「否则不显示」只做了一半。
const showRecords = computed(
  () => records.value.length >= (props.trace.plotRecordShowMin ?? 3)
);
const shownRecords = computed(() => (showRecords.value ? records.value : []));

// 农事类型 → 圆点色（浇灌/水肥蓝 / 施肥橙 / 其他主色绿）
function dotColor(workType?: string): string {
  switch (workType) {
    case 'irrigation':
    case 'water_fertilize':
      return '#4a90d9';
    case 'fertilize':
      return '#e6791a';
    default:
      return '#2f7c44';
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/trace.scss';

.pr-page {
  padding: 12px;
}
.pr-row {
  display: flex;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}
.pr-row:last-child {
  border-bottom: none;
}
.pr-dot {
  flex: 0 0 12px;
  width: 12px;
  height: 12px;
  margin-top: 5px;
  border-radius: 50%;
}
.pr-content {
  flex: 1;
}
.pr-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.pr-type {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
.pr-date {
  font-size: 12px;
  color: #909399;
  font-variant-numeric: tabular-nums;
}
.pr-detail {
  font-size: 13px;
  color: #606266;
}
.pr-op {
  font-size: 12px;
  color: #909399;
  margin-top: 3px;
}
</style>
