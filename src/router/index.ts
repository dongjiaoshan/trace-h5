import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import TraceResult from '@/views/TraceResult.vue';

const routes: RouteRecordRaw[] = [
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
