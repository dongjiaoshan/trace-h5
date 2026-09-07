<template>
  <img class="pv-thumb" :src="src" :style="thumbStyle" alt="" @click="open" />
  <!-- 遮罩挂到 body：图片可能位于轮播这类 overflow / 横向滚动容器内，就地渲染会被裁切或压在层级下面 -->
  <Teleport to="body">
    <div v-if="visible" ref="mask" class="pv" :class="{ 'pv--zoom': zoomed }" @click="close">
      <img class="pv__img" :src="current" alt="" @click.stop="toggleZoom" />
      <button class="pv__close" type="button" aria-label="关闭" @click.stop="close">×</button>
      <template v-if="sources.length > 1">
        <button class="pv__nav pv__nav--prev" type="button" aria-label="上一张" @click.stop="step(-1)">‹</button>
        <button class="pv__nav pv__nav--next" type="button" aria-label="下一张" @click.stop="step(1)">›</button>
        <div class="pv__idx">{{ idx + 1 }} / {{ sources.length }}</div>
      </template>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';

/**
 * 点击放大预览（替代 el-image preview-src-list）。
 *
 * 放大态是真全屏：不透明黑底铺满视口，整张图 contain 居中；证书这类竖版长图正文仍看不清时，
 * 再点一下图切到「按屏宽铺满 + 上下滚动」，点空白 / 右上角 × / Esc 关闭。
 */
const props = withDefaults(
  defineProps<{
    src: string;
    fit?: 'cover' | 'contain' | 'fill';
    /** 同组图片（一证多图）：传了才在全屏态出现左右切换；缺省 = 只预览 src 这一张。 */
    list?: string[];
    /** 从 list 的第几张打开 */
    index?: number;
  }>(),
  { fit: 'cover', index: 0 }
);

const visible = ref(false);
const zoomed = ref(false);
const idx = ref(0);
const mask = ref<HTMLElement | null>(null);

const sources = computed<string[]>(() => (props.list && props.list.length > 0 ? props.list : [props.src]));
const current = computed(() => sources.value[idx.value] ?? props.src);
const thumbStyle = computed(() => ({ objectFit: props.fit, cursor: 'zoom-in' }));

function open() {
  idx.value = Math.min(Math.max(props.index, 0), sources.value.length - 1);
  zoomed.value = false;
  visible.value = true;
}

function close() {
  visible.value = false;
}

function toggleZoom() {
  zoomed.value = !zoomed.value;
  resetScroll();
}

function step(delta: number) {
  const n = sources.value.length;
  idx.value = (idx.value + delta + n) % n;
  // 切到下一张回到「整张缩进一屏」，否则新图直接停在上一张的滚动位置上，看到的是半截图
  zoomed.value = false;
  resetScroll();
}

function resetScroll() {
  if (mask.value) {
    mask.value.scrollTop = 0;
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    close();
    return;
  }
  if (sources.value.length < 2) {
    return;
  }
  if (e.key === 'ArrowLeft') {
    step(-1);
  } else if (e.key === 'ArrowRight') {
    step(1);
  }
}

// 打开期间锁 body 滚动：手指在图上滑动会带着底层追溯页一起滚，关掉后落在莫名其妙的位置
let bodyOverflow = '';

function lockBody(on: boolean) {
  if (on) {
    bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeydown);
  } else {
    document.body.style.overflow = bodyOverflow;
    window.removeEventListener('keydown', onKeydown);
  }
}

watch(visible, (on) => lockBody(on));

onBeforeUnmount(() => {
  if (visible.value) {
    lockBody(false);
  }
});
</script>

<style scoped>
.pv-thumb {
  width: 100%;
  display: block;
}

/* 全屏遮罩：不透明黑底（半透明会透出下方门店卡，顾客读成"没有全屏"） */
.pv {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  overscroll-behavior: contain;
}
/* 默认态：整张图 contain 居中，宽或高先到边；图外的黑色区域点了就关 */
.pv__img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  cursor: zoom-in;
}
/* 放大态：按屏宽铺满、纵向滚动看细节（竖版证书缩进一屏后正文字号太小） */
.pv--zoom {
  display: block;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.pv--zoom .pv__img {
  width: 100%;
  height: auto;
  max-width: none;
  max-height: none;
  cursor: zoom-out;
}

/* 关闭 / 翻页按钮一律 fixed：放大滚动时也始终停在屏幕上 */
.pv__close,
.pv__nav {
  position: fixed;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}
.pv__close {
  top: calc(12px + env(safe-area-inset-top, 0px));
  right: 12px;
  width: 36px;
  height: 36px;
  font-size: 24px;
  line-height: 1;
}
.pv__nav {
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  font-size: 22px;
  line-height: 1;
}
.pv__nav--prev {
  left: 10px;
}
.pv__nav--next {
  right: 10px;
}
.pv__idx {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  pointer-events: none;
}
</style>
