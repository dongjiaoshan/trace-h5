<template>
  <button class="p-base" type="button" @click="emit('click')">
    <span class="p-base__main">
      <span class="p-base__title">养殖基地</span>
      <span class="p-base__sub">点击查看<IconArrow :size="13" /></span>
    </span>
    <img class="p-base__thumb" :src="porkBaseThumb" alt="" />
  </button>
</template>

<script setup lang="ts">
import IconArrow from './IconArrow.vue';
import porkBaseThumb from '@/assets/base/pork-base-thumb.jpg';

const emit = defineEmits<{ (e: 'click'): void }>();
</script>

<style lang="scss" scoped>
.p-base {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  border: 0;
  background: #eef6f0;
  border-radius: 16px;
  padding: 12px 14px;
  text-align: left;
  font: inherit;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  cursor: pointer;
}
.p-base__main {
  flex: 1;
  min-width: 0;
}
.p-base__title {
  display: block;
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
  gap: 3px;
}
.p-base__thumb {
  flex: 0 0 96px;
  width: 96px;
  height: 60px;
  border-radius: 10px;
  object-fit: cover;
  display: block;
}
</style>
