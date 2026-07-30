<template>
  <!-- 产品图轮播（scroll-snap 原生滑动 + 圆点；单图时静态无点/无箭头） -->
  <div class="tc">
    <div ref="vp" class="tc__vp" @scroll="onScroll">
      <template v-if="images.length">
        <div v-for="(src, i) in images" :key="i" class="tc__slide" :style="{ aspectRatio: ratio }">
          <img :src="src" alt="" :style="{ objectFit: fit }" />
        </div>
      </template>
      <!-- 无图占位不吃 ratio：ratio 是为「让产品设计稿方图铺满」设的，占位是一块纯灰底，
           跟着变方只会让灰面积白白变大（无图产品比有图的还多），固定用扁卡位。 -->
      <div v-else class="tc__slide tc__slide--ph">
        <div class="tc__ph">暂无图</div>
      </div>
    </div>
    <template v-if="images.length > 1">
      <button class="tc__arrow tc__arrow--l" aria-label="上一张" @click="go(-1)">‹</button>
      <button class="tc__arrow tc__arrow--r" aria-label="下一张" @click="go(1)">›</button>
      <div class="tc__dots">
        <span v-for="(_, i) in images" :key="i" :class="{ on: i === idx }" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(
  defineProps<{
    images: string[];
    /**
     * 图片填充方式。默认 `cover`（等比裁切，猪只照片等实拍图用）。
     * `contain` 配合方形卡位给产品图用：整张图完整可见、零形变。
     */
    fit?: 'cover' | 'fill' | 'contain';
    /**
     * 卡位宽高比（CSS aspect-ratio 值）。默认 `16 / 10` 适合实拍横图。
     * 产品图传 `1 / 1`：产品配图绝大多数是 1:1 设计稿，方形卡位下正好铺满不留边。
     */
    ratio?: string;
  }>(),
  { fit: 'cover', ratio: '16 / 10' }
);
const vp = ref<HTMLElement | null>(null);
const idx = ref(0);

function onScroll() {
  const el = vp.value;
  if (!el) return;
  idx.value = Math.round(el.scrollLeft / el.clientWidth);
}
function go(dir: number) {
  const el = vp.value;
  if (!el) return;
  const next = Math.min(Math.max(idx.value + dir, 0), props.images.length - 1);
  el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
}
</script>

<style lang="scss" scoped>
.tc {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}
.tc__vp {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.tc__vp::-webkit-scrollbar {
  display: none;
}
.tc__slide {
  flex: 0 0 100%;
  scroll-snap-align: center;
  background: #f0f2f1; /* aspect-ratio 由 ratio prop 内联控制 */
}
.tc__slide--ph {
  aspect-ratio: 16 / 10;
}
.tc__slide img {
  width: 100%;
  height: 100%;
  display: block; /* object-fit 由 fit prop 内联控制 */
}
.tc__ph {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b7bbc0;
  font-size: 12px;
}
.tc__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.82);
  color: #2f7c44;
  font-size: 20px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}
.tc__arrow--l {
  left: 8px;
}
.tc__arrow--r {
  right: 8px;
}
.tc__dots {
  position: absolute;
  bottom: 8px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 5px;
}
.tc__dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
}
.tc__dots span.on {
  background: #fff;
  width: 16px;
  border-radius: 3px;
}
</style>
