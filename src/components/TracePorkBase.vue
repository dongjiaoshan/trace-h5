<template>
  <!-- 养殖基地详情页（pig1）：暖棕页底 + 白卡（相册 + 简介 + 3 张特色卡）。静态内容。 -->
  <div class="pb-page">
    <div class="pb-card">
      <TraceSectionTitle title="养殖基地" />

      <!-- 相册：基地航拍 + 大棚 -->
      <div class="pb-gallery">
        <img :src="galleryAerial" alt="养殖基地航拍" />
        <img :src="galleryGreenhouse" alt="养殖基地大棚" />
      </div>

      <!-- 简介文案 -->
      <div class="pb-intro">
        <p>养殖基地占地百亩，仅饲养两千头黑猪，</p>
        <p>单头享有 10㎡独立活动空间；</p>
        <p>自产有机果蔬，搭配熟食饲喂。</p>
      </div>

      <!-- 特色卡（成品图，含标题 + 描述） -->
      <div class="pb-feats">
        <img class="pb-feat" :src="featEco" alt="优境优食·天然饲喂" />
        <img class="pb-feat" :src="featBreed" alt="良种宽养·肉质出众" />
        <img class="pb-feat" :src="featSlow" alt="足期慢养·当日鲜供" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TraceSectionTitle from './TraceSectionTitle.vue';
import galleryAerial from '@/assets/base/base-fields-aerial.jpg';
import galleryGreenhouse from '@/assets/base/base-greenhouses.jpg';
import featEco from '@/assets/base/pork-feat-eco.jpg';
import featBreed from '@/assets/base/pork-feat-breed.jpg';
import featSlow from '@/assets/base/pork-feat-slow.jpg';
</script>

<style lang="scss" scoped>
.pb-page {
  min-height: 100vh;
  background: #754835;
  padding: 14px;
}
.pb-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px 16px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

/* 相册 */
.pb-gallery {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.pb-gallery img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 12px;
  display: block;
}

/* 简介 */
.pb-intro {
  text-align: center;
  padding: 18px 6px 8px;
}
.pb-intro p {
  margin: 5px 0;
  font-size: 15px;
  color: #2b2b2b;
  line-height: 1.7;
}

/* 特色卡（成品图纵向堆叠） */
.pb-feats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 6px;
}
.pb-feat {
  width: 100%;
  border-radius: 12px;
  display: block;
}
</style>
