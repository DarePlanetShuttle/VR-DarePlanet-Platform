import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../HomeView.vue';
import VRModelViewer from '../VRModelViewer.vue';

const routes = [
    { path: '/', component: HomeView },
    {
        path: '/scene',
        name: 'model-viewer',
        component: VRModelViewer
    }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

export default router;
