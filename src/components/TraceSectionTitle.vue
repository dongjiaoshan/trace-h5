<template>
  <!-- 居中「｜ 标题 ｜」区块标题（追溯扫码结果页新设计） -->
  <div class="tr-sec">
    <i class="tr-sec__bar" />
    <span class="tr-sec__text"><slot>{{ title }}</slot></span>
    <i class="tr-sec__bar" />
  </div>
</template>

<script setup lang="ts">
defineProps<{ title?: string }>();
</script>

<style lang="scss" scoped>
.tr-sec {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  margin: 20px 0 14px;
}
.tr-sec__bar {
  width: 3px;
  height: 16px;
  border-radius: 2px;
  background: #2f7c44;
}
.tr-sec__text {
  font-size: 16px;
  font-weight: 800;
  color: #2b2b2b;
  letter-spacing: 0.5px;
}
</style>
