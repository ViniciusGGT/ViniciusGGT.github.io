import { createRouter, createWebHistory } from 'vue-router';
import PaginaInicial from '@/views/PaginaInicial.vue';
import CriacaoConta from '@/views/usuario/cadastro/CriacaoConta.vue';
import FormLogin from '@/views/usuario/login/FormLogin.vue';
import MinhasPlaylists from '@/views/MinhasPlaylists.vue';

const routes = [
  {
    path: '/',
    name: 'pagina-inicial',
    component: PaginaInicial,
  },
  {
    path: '/login',
    name: 'login',
    component: FormLogin,
  },
  {
    path: '/cadastro',
    name: 'cadastro',
    component: CriacaoConta,
  },
  {
    path:'/playlists',
    name:'playlists',
    component: MinhasPlaylists
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
