import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView';
import HomeViewFile from '../views/HomeViewFile';
import VRModelViewer from '../views/VRModelViewer';
import Model360Viewer from '../views/Model360Viewer'; 
import ModelExperienceViewer from '../views/ModelExperienceViewer';

const routes = [
    { path: '/', component: HomeView },
    {
        path: '/scene',
        name: 'model-viewer',
        component: VRModelViewer
    },
    {
        path: '/sceneFile',
        name: 'model-viewer-url',
        component: HomeViewFile
    },
    {
        path: '/360',
        name: '360-model-viewer',
        component: Model360Viewer
    },
    {
        path: '/experience',
        name: 'experience-model-viewer',
        component: ModelExperienceViewer
    }
];

const router = createRouter({
    //history: createWebHistory(process.env.BASE_URL),
    routes
});

export default router;
