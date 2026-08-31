<template>
  <!--
    养殖基地详情页（pig1）—— 猪肉追溯码点「养殖基地」下钻到这里。
    r146：admin「追溯码配置管理」为猪肉追溯码配了基地介绍页图片 → 整屏铺那张图；
    没配图 → 回落下面这套内置版式（暖棕页底 + 白卡：相册 + 简介 + 3 张特色卡），
    保证上线当天没配图也不开天窗。
  -->
  <div v-if="introImage" class="pb-page pb-page--image">
    <img class="pb-full" :src="introImage" alt="养殖基地" />
  </div>
  <div v-else class="pb-page">
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
import { computed } from 'vue';
import type { PublicTraceVo } from '@/api/types';
import TraceSectionTitle from './TraceSectionTitle.vue';
import galleryAerial from '@/assets/base/base-fields-aerial.jpg';
import galleryGreenhouse from '@/assets/base/base-greenhouses.jpg';
import featEco from '@/assets/base/pork-feat-eco.jpg';
import featBreed from '@/assets/base/pork-feat-breed.jpg';
import featSlow from '@/assets/base/pork-feat-slow.jpg';

const props = defineProps<{ trace: PublicTraceVo }>();

/** r146：后端下发的基地介绍页图片；为空则走下面的内置版式。 */
const introImage = computed(() => props.trace?.baseIntroImageUrl ?? '');
</script>

<style lang="scss" scoped>
.pb-page {
  min-height: 100vh;
  background: #754835;
  padding: 14px;
}
/* r146 配置图：整屏一张图，不套卡片不加标题 */
.pb-page--image {
  padding: 0;
}
.pb-full {
  width: 100%;
  height: auto;
  display: block;
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
