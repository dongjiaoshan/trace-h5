<template>
  <img :src="src" :style="imgStyle" alt="" @click="open = true" />
  <!-- 遮罩挂到 body：图片可能位于轮播这类 overflow / 横向滚动容器内，就地渲染会被裁切或压在层级下面 -->
  <Teleport to="body">
    <div v-if="open" class="img-preview-mask" :class="{ 'is-fit-width': fitWidth }" @click="open = false">
      <img :src="src" alt="" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

// 点击放大预览（替代 el-image preview-src-list，仅单图）。
const props = withDefaults(
  defineProps<{
    src: string;
    fit?: 'cover' | 'contain' | 'fill';
    /**
     * 放大后按宽度铺满屏幕、纵向可滚动；默认 false = 整张图缩进一屏。
     * 证书这类竖版长图缩进一屏后正文字号太小仍然看不清，放大就失去意义，必须按宽度铺满再上下翻。
     */
    fitWidth?: boolean;
  }>(),
  { fit: 'cover', fitWidth: false }
);

const open = ref(false);
const imgStyle = computed(() => ({ objectFit: props.fit, cursor: 'zoom-in' }));
</script>

<style scoped>
img {
  width: 100%;
  display: block;
}
/* 按宽度铺满 + 纵向滚动：遮罩由「居中 flex」改成「可滚动块」，图片等比放大到屏宽、高度自然撑开 */
.img-preview-mask.is-fit-width {
  display: block;
  padding: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.img-preview-mask.is-fit-width img {
  width: 100%;
  height: auto;
  max-width: none;
  max-height: none;
}
</style>
