import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import TraceResult from '@/views/TraceResult.vue';
import StoreTraceResult from '@/views/StoreTraceResult.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/trace/store/:storeKey/pork-base',
    name: 'StorePorkBase',
    component: StoreTraceResult
  },
  // 门店猪只追溯码（V7 row40）：一个门店一个固定码，内容按门店当天到店最重的那头猪动态取。
  // 静态段 store 比下面的 :type 动态段优先匹配，不会被当成 type=store 落进按码追溯页。
  {
    path: '/trace/store/:storeKey',
    name: 'StoreTraceResult',
    component: StoreTraceResult
  },
  // 沿用 admin 旧路由形态：/trace/:type/:code（type = pork|veg|grow|cert|plot-records）
  {
    path: '/trace/:type/:code',
    name: 'TraceResult',
    component: TraceResult
  },
  // 仅给 code 不给 type（少数二维码只编码 code）时按 pork 兜底进结果页
  {
    path: '/trace/:code',
    redirect: (to) => ({ path: `/trace/pork/${to.params.code}` })
  },
  // 兜底
  {
    path: '/:pathMatch(.*)*',
    redirect: '/trace/pork/none'
  }
];

const router = createRouter({
  // history 模式：服务器需 try_files 回退到 index.html（见 README Nginx 配置）
  history: createWebHistory(import.meta.env.VITE_APP_BASE || '/'),
  routes
});

export default router;
