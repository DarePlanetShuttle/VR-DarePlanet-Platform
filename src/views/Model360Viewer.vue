<template>
    <div>
        <div id="container"></div>
        <div class="buttons">
            <button id="removeFurnitureButton" @click="handleRemoveFurnitureButtonClick">Remove Furniture</button>
            <button id="redesignButton" @click="handleRedesignButtonClick">Redesign</button>
        </div>

        <div class="dropdown">
            <div class="select" @click="toggleDropdown">
                <span class="selected">{{ selectedScene }}</span>
                <div class="caret" :class="{ 'caret-rotate': isDropdownOpen }"></div>
            </div>
            <ul class="menu" id="imageMenu" :class="{ 'menu-open': isDropdownOpen }">
                <li v-for="(scene, index) in scenesData.scenes" :key="index" @click="changeScene(index)">
                    {{ scene.name }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import * as THREE from 'three';
import { VRButton } from '../assets/scripts/VRButton.js';
import data360 from '../assets/data/images-360-data.json';

export default {
    name: '360-model-viewer',
    data() {
        return {
            scenesData: { scenes: [] },
            currentScene: 0,
            textures: {},
            selectedScene: 'Escenas',
            isDropdownOpen: false,
        };
    },
    mounted() {
        this.init();
        window.addEventListener('resize', this.onWindowResize);
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.onWindowResize);
    },
    methods: {
        init() {
            const container = document.getElementById('container');
            this.clock = new THREE.Clock();

            // Avoid Vue reactivity by not storing in `data`
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x101010);

            const light = new THREE.AmbientLight(0xffffff, 2.3);
            this.scene.add(light);

            this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 2000);
            this.scene.add(this.camera);

            const panoSphereGeo = new THREE.SphereGeometry(6, 256, 256);
            const panoSphereMat = new THREE.MeshStandardMaterial({
                side: THREE.BackSide,
                displacementScale: -4.0,
            });

            this.sphere = new THREE.Mesh(panoSphereGeo, panoSphereMat);
            this.scene.add(this.sphere);

            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setAnimationLoop(this.animate);
            this.renderer.xr.enabled = true;
            this.renderer.xr.setReferenceSpaceType('local');
            container.appendChild(this.renderer.domElement);

            document.body.appendChild(VRButton.createButton(this.renderer));

            this.loadJSONData();
        },
        onWindowResize() {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        },
        animate() {
            if (!this.renderer.xr.isPresenting) {
                const time = this.clock.getElapsedTime();
                this.sphere.rotation.y += 0.0015;
                this.sphere.position.y = Math.cos(time) * 0.25;
            }
            this.renderer.render(this.scene, this.camera);
        },
        loadJSONData() {
            // fetch('assets/data/360-data.json')
            //     .then(response => response.json())
            //     .then(data => {
            //         this.scenesData = data;
            //         if (this.scenesData.scenes.length > 0) {
            //             this.changeScene(0);
            //         }
            //     })
            //     .catch(error => console.error('Error loading JSON data:', error));
            this.scenesData = data360;

            console.log(this.scenesData);

            if (this.scenesData.scenes.length > 0) {
                this.changeScene(0);
            }
        },
        changeScene(index) {
            this.currentScene = index;
            this.selectedScene = this.scenesData.scenes[index].name;

            const imageUrl = this.scenesData.scenes[index].image;
            console.log('Loading image from:', imageUrl);

            const loader = new THREE.TextureLoader();
            loader.load(imageUrl, texture => {
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.minFilter = THREE.NearestFilter;
                texture.generateMipmaps = false;
                this.sphere.material.map = texture;
                this.sphere.material.needsUpdate = true;

                this.textures[this.currentScene] = {
                    original: texture,
                    current: texture,
                    removeFurniture: null,
                    redesign: null,
                };

                this.loadAdditionalTextures(this.currentScene);
            });
        },
        loadAdditionalTextures(sceneIndex) {
            const loader = new THREE.TextureLoader();
            const sceneData = this.scenesData.scenes[sceneIndex];

            if (sceneData.remove_furniture) {
                loader.load(sceneData.remove_furniture, texture => {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    texture.minFilter = THREE.NearestFilter;
                    texture.generateMipmaps = false;
                    this.textures[sceneIndex].removeFurniture = texture;
                });
            }

            if (sceneData.redesign) {
                loader.load(sceneData.redesign, texture => {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    texture.minFilter = THREE.NearestFilter;
                    texture.generateMipmaps = false;
                    this.textures[sceneIndex].redesign = texture;
                });
            }
        },
        handleRemoveFurnitureButtonClick() {
            const sceneTextures = this.textures[this.currentScene];
            if (sceneTextures?.removeFurniture) {
                this.toggleTexture('removeFurniture');
            } else {
                console.error('No remove_furniture texture found for the current scene');
            }
        },
        handleRedesignButtonClick() {
            const sceneTextures = this.textures[this.currentScene];
            if (sceneTextures?.redesign) {
                this.toggleTexture('redesign');
            } else {
                console.error('No redesign texture found for the current scene');
            }
        },
        toggleTexture(type) {
            const sceneTextures = this.textures[this.currentScene];
            if (!sceneTextures) return;

            if (sceneTextures.current === sceneTextures.original) {
                this.sphere.material.map = sceneTextures[type];
                sceneTextures.current = sceneTextures[type];
            } else {
                this.sphere.material.map = sceneTextures.original;
                sceneTextures.current = sceneTextures.original;
            }
            this.sphere.material.needsUpdate = true;
        },
        toggleDropdown() {
            this.isDropdownOpen = !this.isDropdownOpen;
        },
    },
};
</script>

<style scoped>
body {
    font-family: Helvetica, sans-serif;
    background: #23242a;
    margin: 0;
    box-sizing: border-box;
}

.dropdown {
    min-width: 15em;
    position: absolute;
    top: 0;
    right: 0;
    margin: 2em;
    z-index: 2;
}

.dropdown * {
    box-sizing: border-box;
}

.select {
    background: #2a2f3b;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px #2a2f3b solid;
    border-radius: 0.5em;
    padding: 1em;
    cursor: pointer;
    transition: background 0.3s;
}

.select-clicked {
    border: 2px #26489a solid;
    box-shadow: 0 0 0.8em #26489a;
}

.select:hover {
    background: #323741;
}

.caret {
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 6px solid #fff;
    transition: 0.3s;
    margin-left: 0.3em;
}

.caret-rotate {
    transform: rotate(180deg);
}

.menu {
    list-style: none;
    padding: 0.2em 0.5em;
    background: #323741;
    border: 1px #363a43;
    box-shadow: 0 0.5em 1em rgba(0, 0, 0, 0.2);
    border-radius: 0.5em;
    color: #9fa5b5;
    position: absolute;
    top: 3em;
    left: 7.5em;
    width: 100%;
    transform: translateX(-50%);
    opacity: 0;
    display: none;
    transition: 0.2s;
    z-index: 1;
}

.menu li {
    padding: 0.7em 0.5em;
    margin: 0.3em 0;
    border-radius: 0.5em;
    cursor: pointer;
}

.menu li:hover {
    background: #2a2d35;
}

.active {
    background: #23242a;
}

.menu-open {
    display: block;
    opacity: 1;
}

.buttons {
    display: flex;
    flex-direction: column;
    min-width: 10em;
    position: absolute;
    top: 0;
    right: 244px;
    margin: 2em;
    z-index: 2;
}

button {
    background: #2a2f3b;
    color: #fff;
    padding: 0.5em;
    margin: 0.5em;
    cursor: pointer;
    border: none;
    border-radius: 0.5em;
    transition: background 0.3s;
}

button:hover {
    background: #323741;
}

button:active {
    transform: scale(0.98);
}

button:focus {
    outline: none;
}
</style>