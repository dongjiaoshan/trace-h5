<template>
  <img :src="src" :style="imgStyle" alt="" @click="open = true" />
  <div v-if="open" class="img-preview-mask" @click="open = false">
    <img :src="src" alt="" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

// 点击放大预览（替代 el-image preview-src-list，仅单图）。
const props = withDefaults(defineProps<{ src: string; fit?: 'cover' | 'contain' }>(), { fit: 'cover' });

const open = ref(false);
const imgStyle = computed(() => ({ objectFit: props.fit, cursor: 'zoom-in' }));
</script>

<style scoped>
img {
  width: 100%;
  display: block;
}
</style>
