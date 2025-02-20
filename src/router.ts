import { createRouter, createWebHistory } from 'vue-router';
import Chat from './views/Chat.vue';

const routes = [
  { path: '/', component: Chat },
  { path: '/imprint', component: () => import('./views/Imprint.vue') },
  { path: '/contact', component: () => import('./views/Contact.vue') },
  { path: '/:pathMatch(.*)*', component: () => import('./views/NotFound.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
