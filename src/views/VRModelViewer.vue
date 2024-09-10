<template>
  <div>
    <a-scene environment="preset: default;" renderer="antialias: true;">
      <a-assets>
        <img id="gradient" src="/images/gradient-fade.png" />
        <!-- El modelo no se carga de inmediato -->
      </a-assets>

      <a-sky color="#000337"></a-sky>

      <a-plane
        width="100"
        height="100"
        rotation="-90 0 0"
        position="0 0.01 0"
        visible="false"
        class="groundPlane"
        raycaster-target
      ></a-plane>

      <a-entity
        id="player"
        position="0 0.4 0"
        player-move="controllerListenerId: #controller-data; navigationMeshClass: groundPlane;"
      >
        <a-camera></a-camera>

        <a-entity
          id="controller-data"
          controller-listener="leftControllerId: #left-controller; rightControllerId: #right-controller;"
        ></a-entity>

        <a-entity
          id="left-controller"
          oculus-touch-controls="hand: left"
        ></a-entity>

        <a-entity
          id="right-controller"
          oculus-touch-controls="hand: right"
          raycaster="objects: .raycaster-target; interval: 0;"
          raycaster-extras="controllerListenerId: #controller-data; beamImageSrc: #gradient; beamLength: 0.5;"
        ></a-entity>
      </a-entity>

      <!-- El modelo será añadido después -->
      <a-entity
        v-if="modelLoaded"
        gltf-model="#model"
        position="0 1.7 0"
        scale="1 1 1"
        raycaster-target
      ></a-entity>
    </a-scene>
  </div>
</template>

<script>
export default {
  name: "VRModelViewer",
  data() {
    return {
      modelLoaded: false, // Controlar cuando el modelo ha sido cargado
    };
  },
  mounted() {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    loadScript("/js/aframe-environment-component.min.js");
    loadScript("/js/controller-listener.js");
    loadScript("/js/player-move.js");
    loadScript("/js/raycaster-extras.js");

    // Asegúrate de que la escena de A-Frame esté completamente cargada
    document.querySelector("a-scene").addEventListener("loaded", () => {
      console.log("A-Frame scene is fully loaded");

      // Agregar el asset del modelo dinámicamente después de que la escena esté cargada
      const assets = document.querySelector("a-assets");
      const modelAsset = document.createElement("a-asset-item");
      modelAsset.setAttribute("id", "model");
      modelAsset.setAttribute("src", "/models/1623327307.glb");
      assets.appendChild(modelAsset);

      // Espera un momento para asegurarte de que el modelo ha sido añadido
      setTimeout(() => {
        this.modelLoaded = true;
        console.log("Model asset dynamically added and loaded");
      }, 1000);
    });
  },
};
</script>

<style scoped>
/* Puedes agregar estilos personalizados si lo necesitas */
</style>
