<template>
  <svg viewBox="0 0 1024 1024" :width="size" :height="size" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M340.864 149.312a30.592 30.592 0 0 0 0 42.752L652.736 512 340.864 831.872a30.592 30.592 0 0 0 0 42.752 29.12 29.12 0 0 0 41.728 0L714.24 530.752a32 32 0 0 0 0-42.752L382.592 149.312a29.12 29.12 0 0 0-41.728 0z"
    />
  </svg>
</template>

<script setup lang="ts">
// 右向箭头（替代 el-icon ArrowRight，零依赖内联 SVG）。
withDefaults(defineProps<{ size?: number | string }>(), { size: 14 });
</script>
