<template>
    <div ref="vrContainer" class="vr-container"></div>
</template>

<script>
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

export default {
    name: 'VRModelViewer',
    data() {
        return {
            modelUrl: null
        };
    },
    mounted() {
        this.modelUrl = localStorage.getItem('modelUrl');
        console.log("VRModelViewer:", this.modelUrl);
        if (this.modelUrl) {
            this.initVRScene();
        } else {
            console.error('No model URL found.');
        }
    },
    methods: {
        initVRScene() {
            const container = this.$refs.vrContainer;

            // Set up the scene, camera, and renderer
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.xr.enabled = true;
            container.appendChild(renderer.domElement);
            container.appendChild(VRButton.createButton(renderer));

            // Add lighting
            const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
            light.position.set(0.5, 1, 0.25);
            scene.add(light);

            // Load the GLB model
            const loader = new GLTFLoader();
            loader.load(
                this.modelUrl,
                (gltf) => {
                    const model = gltf.scene;
                    scene.add(model);
                    model.position.set(0, 1.6, -3);
                },
                undefined,
                (error) => {
                    console.error('An error occurred while loading the GLB model:', error);
                }
            );

            // Animate the scene
            const animate = () => {
                renderer.setAnimationLoop(() => {
                    renderer.render(scene, camera);
                });
            };

            animate();

            // Handle window resizing
            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
        }
    }
};
</script>

<style scoped>
.vr-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
    position: relative;
}
</style>
