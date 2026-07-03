<template>
  <!-- 基地介绍详情页（追溯码27(2)-03）：深绿页底 + 白卡（相册 + 简介 + 2×2 特色格）。静态内容。 -->
  <div class="vb-page">
    <div class="vb-card">
      <TraceSectionTitle title="基地介绍" />

      <!-- 相册：2 小图 + 1 宽图 -->
      <div class="vb-gallery">
        <div class="vb-gallery__row">
          <img :src="galleryFields" alt="基地地块" />
          <img :src="galleryGreenhouses" alt="基地大棚" />
        </div>
        <img class="vb-gallery__wide" :src="galleryPanorama" alt="基地全景" />
      </div>

      <!-- 简介文案 -->
      <div class="vb-intro">
        <p>满足您全年不同季节的时令蔬菜需求</p>
        <p>3000 亩有机农场</p>
        <p>100% 自建、自营，真正品质可控</p>
      </div>

      <!-- 2×2 特色格 -->
      <div class="vb-grid">
        <div v-for="(f, i) in features" :key="i" class="vb-feat">
          <div class="vb-feat__imgwrap"><img :src="f.img" :alt="f.title" /></div>
          <div class="vb-feat__label">{{ f.title }}</div>
          <div class="vb-feat__desc">{{ f.desc }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TraceSectionTitle from './TraceSectionTitle.vue';
import galleryFields from '@/assets/base/base-fields-aerial.jpg';
import galleryGreenhouses from '@/assets/base/base-greenhouses.jpg';
import galleryPanorama from '@/assets/base/base-panorama.jpg';
import featSeedlings from '@/assets/base/base-seedlings.jpg';
import featFieldRows from '@/assets/base/base-field-rows.jpg';
import featGreenhouseInside from '@/assets/base/base-greenhouse-inside.jpg';
import featWeeding from '@/assets/base/base-weeding.jpg';

const features = [
  { title: '优选种植环境', desc: '有机生产对土壤环境要求苛刻，与其他农地相隔离，水源、大气、土壤无污染', img: featSeedlings },
  { title: '全球选种', desc: '精选全球蔬菜品种', img: featFieldRows },
  { title: '施用有机肥', desc: '不施用化学农药和生长调节剂', img: featGreenhouseInside },
  { title: '人工除草 / 物理防虫', desc: '远离化学药剂，使用色板诱杀法、昆虫性诱剂诱杀法，人工中耕除草', img: featWeeding },
];
</script>

<style lang="scss" scoped>
.vb-page {
  min-height: 100vh;
  background: #15382a;
  padding: 14px;
}
.vb-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px 16px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

/* 相册 */
.vb-gallery__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.vb-gallery__row img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 12px;
  display: block;
}
.vb-gallery__wide {
  width: 100%;
  aspect-ratio: 2 / 1;
  object-fit: cover;
  border-radius: 12px;
  display: block;
  margin-top: 10px;
}

/* 简介 */
.vb-intro {
  text-align: center;
  padding: 18px 6px 6px;
}
.vb-intro p {
  margin: 5px 0;
  font-size: 15px;
  color: #2b2b2b;
  line-height: 1.7;
}

/* 2×2 特色格 */
.vb-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 14px;
}
.vb-feat {
  border-radius: 12px;
  overflow: hidden;
  background: #f2f8f4;
}
.vb-feat__imgwrap {
  aspect-ratio: 4 / 3;
}
.vb-feat__imgwrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.vb-feat__label {
  background: #1f5430;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  text-align: center;
  padding: 9px 6px;
}
.vb-feat__desc {
  color: #3a7a52;
  font-size: 12px;
  line-height: 1.5;
  padding: 10px 12px 12px;
}
</style>
