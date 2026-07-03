<template>
  <!-- 主题壳（pork/veg 扫码结果页）：hero + 信任条 + 白 sheet -->
  <div v-if="theme" class="tl" :class="`tl--${theme}`">
    <div class="tl-hero">
      <!-- 装饰纹理：pork 同心圆环 / veg 柔和波纹 -->
      <svg v-if="theme === 'pork'" class="tl-hero__patt" viewBox="0 0 400 210" preserveAspectRatio="xMaxYMin slice" fill="none" aria-hidden="true">
        <g stroke="currentColor" stroke-width="1.4">
          <circle cx="352" cy="4" r="30" /><circle cx="352" cy="4" r="58" /><circle cx="352" cy="4" r="86" />
          <circle cx="352" cy="4" r="114" /><circle cx="352" cy="4" r="142" /><circle cx="352" cy="4" r="170" />
          <circle cx="352" cy="4" r="198" /><circle cx="352" cy="4" r="226" /><circle cx="352" cy="4" r="254" /><circle cx="352" cy="4" r="282" />
        </g>
      </svg>
      <svg v-else class="tl-hero__patt" viewBox="0 0 400 210" preserveAspectRatio="xMidYMin slice" fill="none" aria-hidden="true">
        <g stroke="currentColor" stroke-width="1.4">
          <path d="M-10 24 q40 -16 80 0 t80 0 t80 0 t80 0 t80 0" />
          <path d="M-10 54 q40 -16 80 0 t80 0 t80 0 t80 0 t80 0" />
          <path d="M-10 84 q40 -16 80 0 t80 0 t80 0 t80 0 t80 0" />
          <path d="M-10 114 q40 -16 80 0 t80 0 t80 0 t80 0 t80 0" />
          <path d="M-10 144 q40 -16 80 0 t80 0 t80 0 t80 0 t80 0" />
          <path d="M-10 174 q40 -16 80 0 t80 0 t80 0 t80 0 t80 0" />
        </g>
      </svg>
      <!-- 盾牌徽标（金） -->
      <svg class="tl-hero__shield" width="52" height="59" viewBox="0 0 60 68" fill="rgba(255,255,255,.05)" aria-hidden="true">
        <path d="M30 3 L54 12 V32 C54 48 44 59 30 65 C16 59 6 48 6 32 V12 Z" stroke="currentColor" stroke-width="2.2" />
        <path d="M20 33 l7 7 14-16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <div class="tl-hero__title">{{ heroTitle }}</div>
      <div class="tl-hero__sub">{{ heroSub }}</div>
    </div>

    <!-- 信任条 -->
    <div class="tl-trust">
      <div class="tl-trust__item">
        <svg class="tl-trust__ico" width="18" height="18" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="currentColor" /><path d="M6 10.2 l2.6 2.6 5.2-5.4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>安全溯源
      </div>
      <div class="tl-trust__div" />
      <div class="tl-trust__item">
        <svg class="tl-trust__ico" width="20" height="16" viewBox="0 0 22 18" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="8" y="1" width="6" height="5" rx="1.4" /><rect x="1" y="12" width="6" height="5" rx="1.4" /><rect x="15" y="12" width="6" height="5" rx="1.4" /><path d="M11 6 V9 M4 12 V9 H18 V12" /></svg>责任可溯
      </div>
      <div class="tl-trust__div" />
      <div class="tl-trust__item">
        <svg class="tl-trust__ico" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="8.5" cy="8.5" r="5.5" /><path d="M13 13 l4.5 4.5" /></svg>质量可查
      </div>
    </div>

    <div class="tl-sheet">
      <slot />
    </div>
  </div>

  <!-- 兜底壳（grow/cert/plot-records 下钻页）：沿用 banner + 卡片体 -->
  <div v-else class="tl">
    <div class="tl-banner" :style="bannerStyle">
      <div class="tl-banner__mask">
        <div class="tl-banner__title">{{ title }}</div>
        <div v-if="traceCode" class="tl-banner__code">{{ traceCode }}</div>
      </div>
    </div>
    <div class="tl-body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  /** 业态主题：pork 棕 / veg 绿。传了走新设计壳；不传走 banner 兜底壳（下钻页） */
  theme?: 'pork' | 'veg';
  /** hero 主标题（默认「溯源安全，品质保证」） */
  heroTitle?: string;
  /** hero 副标题（不传按业态取默认） */
  heroSubtitle?: string;
  /** 兜底壳：标题 / 追溯码 / 封面 */
  title?: string;
  traceCode?: string;
  cover?: string;
}>();

const heroTitle = computed(() => props.heroTitle ?? '溯源安全，品质保证');
const heroSub = computed(
  () => props.heroSubtitle ?? (props.theme === 'pork' ? '追溯猪肉源头，品味自然馈赠' : '追溯蔬菜源头，品味自然馈赠')
);
const bannerStyle = computed(() => (props.cover ? { backgroundImage: `url(${props.cover})` } : {}));
</script>

<style lang="scss" scoped>
/* ===== 新设计主题壳（pork/veg） ===== */
.tl--pork,
.tl--veg {
  min-height: 100vh;
}
.tl--pork {
  background: #fff;
  --tl-hero: linear-gradient(155deg, #7a472f 0%, #5a3020 100%);
  --tl-patt: rgba(233, 200, 162, 0.22);
  --tl-trust-ico: #7a4531;
}
/* veg 新设计（追溯码27(2)）：深绿页底 + 白卡；信任条内联描边、图标浅色 */
.tl--veg {
  background: #15382a;
  --tl-hero: linear-gradient(155deg, #2a6247 0%, #153c2b 100%);
  --tl-patt: rgba(206, 230, 211, 0.2);
  --tl-trust-ico: #cdecd6;
}

.tl-hero {
  position: relative;
  padding: 26px 22px 40px;
  background: var(--tl-hero);
  color: #fdf7ee;
  overflow: hidden;
}
.tl-hero__patt {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  color: var(--tl-patt);
  pointer-events: none;
}
.tl-hero__shield {
  position: absolute;
  top: 18px;
  right: 18px;
  color: #e7d6b2;
  opacity: 0.7;
}
.tl-hero__title {
  position: relative;
  font-size: 23px;
  font-weight: 800;
  letter-spacing: 0.5px;
}
.tl-hero__sub {
  position: relative;
  margin-top: 8px;
  font-size: 13px;
  opacity: 0.9;
  letter-spacing: 0.3px;
}

.tl-trust {
  position: relative;
  z-index: 2;
  margin: -20px 16px 0;
  padding: 14px 6px;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}
.tl-trust__item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 600;
  color: #3a3a3a;
}
.tl-trust__ico {
  color: var(--tl-trust-ico);
  flex: 0 0 auto;
}
.tl-trust__div {
  flex: 0 0 auto;
  width: 1px;
  height: 18px;
  background: #ececec;
}

.tl-sheet {
  padding: 16px 18px 28px;
}

/* veg 新设计覆盖：信任条内联描边（深绿上）+ 内容区改白卡纵向堆叠 */
.tl--veg .tl-trust {
  margin: 14px 14px 0;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.24);
  box-shadow: none;
}
.tl--veg .tl-trust__item {
  color: #eaf5ee;
}
.tl--veg .tl-trust__div {
  background: rgba(255, 255, 255, 0.22);
}
.tl--veg .tl-sheet {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ===== 兜底 banner 壳（下钻页，沿用原样式） ===== */
.tl-banner {
  height: 180px;
  background-color: #2f7c44;
  background-size: cover;
  background-position: center;
  position: relative;
}
.tl-banner__mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(47, 124, 68, 0.2) 0%, rgba(47, 124, 68, 0.78) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
  color: #fff;
}
.tl-banner__title {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
}
.tl-banner__code {
  margin-top: 6px;
  font-size: 13px;
  opacity: 0.92;
  letter-spacing: 0.5px;
  font-variant-numeric: tabular-nums;
}
.tl-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
