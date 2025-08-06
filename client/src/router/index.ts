import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import HomePage from '@/views/HomePage.vue';
import LoginPage from '@/views/LoginPage.vue';
import GoalsPage from '@/views/GoalsPage.vue';
import ProfilePage from '@/views/ProfilePage.vue';
import SignupPage from '@/views/SignupPage.vue';
import AboutPage from '@/views/AboutPage.vue';

const routes: RouteRecordRaw[] = [
  { path: '/',       name: 'Home',   component: HomePage,    meta: { requiresAuth: false } },
  { path: '/about',  name: 'About',  component: AboutPage,   meta: { requiresAuth: false } },
  { path: '/login',  name: 'Login',  component: LoginPage,   meta: { requiresAuth: false } },
  { path: '/signup', name: 'Signup', component: SignupPage,  meta: { requiresAuth: false } },
  { path: '/goals',  name: 'Goals',  component: GoalsPage,   meta: { requiresAuth: true  } },
  { path: '/profile',name: 'Profile',component: ProfilePage, meta: { requiresAuth: true  } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.token) {
    return next({ name: 'Login' });
  }
  next();
});

export default router;
