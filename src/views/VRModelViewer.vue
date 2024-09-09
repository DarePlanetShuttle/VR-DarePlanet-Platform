<template>
  <div>
    <!-- Loading indicator -->
    <div v-if="isLoading" class="loading-indicator">
      <div class="spinner-border" role="status">
        <span class="sr-only"></span>
      </div>
    </div>
    
    <!-- 3D VR container -->
    <div v-show="!isLoading" ref="vrContainer" class="vr-container"></div>
  </div>
</template>

<script>
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; // Import OrbitControls

export default {
    name: 'VRModelViewer',
    data() {
        return {
            modelUrl: null,
            isLoading: true // Agregamos un estado para controlar la carga
        };
    },
    mounted() {
        this.modelUrl = localStorage.getItem('modelUrl');
        console.log(this.modelUrl);
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

            // Position the camera
            camera.position.set(0, 10, 10);

            // Add lighting
            const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 2);
            light.position.set(0.5, 1, 0.25);
            scene.add(light);

            // Load the GLB model
            const loader = new GLTFLoader();
            loader.load(
                this.modelUrl,
                (gltf) => {
                    const model = gltf.scene;
                    model.position.set(0, 1.6, 0);
                    scene.add(model);
                    this.isLoading = false; // Ocultamos el indicador de carga cuando el modelo se ha cargado
                },
                undefined,
                (error) => {
                    console.error('An error occurred while loading the GLB model:', error);
                    this.isLoading = false; // Ocultar indicador aunque ocurra un error
                }
            );

            // Initialize OrbitControls
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.25;
            controls.enableZoom = true;

            // Animate the scene
            const animate = () => {
                renderer.setAnimationLoop(() => {
                    controls.update(); // Update controls
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
.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  /*transform: translate(-50%, -50%);
  font-size: 1.5rem;
  color: #ffffff;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 10px;*/
}
</style>
