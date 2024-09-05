<template>
    <a-scene>
        <!-- Assets -->
        <a-assets>
            <a-asset-item id="model" src="/models/myhouse.glb"></a-asset-item>
        </a-assets>

        <!-- Sky -->
        <a-sky color="#ECECEC"></a-sky>

        <!-- Lighting -->
        <a-entity light="type: ambient; intensity: 0.5"></a-entity>
        <a-entity light="type: directional; intensity: 0.6" position="1 1 0"></a-entity>

        <!-- 3D Model -->
        <a-entity gltf-model="/models/myhouse.glb" position="0 0 0" scale="1 1 1"></a-entity>

        <!-- Camera Rig with Teleport Controls -->
        <a-entity id="rig" position="0 1.6 0">
            <a-entity id="camera" camera look-controls position="0 -1.5 0"></a-entity>
            <a-entity id="left-hand" laser-controls="hand: left"
                teleport-controls="cameraRig: #rig; teleportOrigin: #camera; button: trigger; collisionEntities: .teleport-surface">
            </a-entity>
            <a-entity id="right-hand" laser-controls="hand: right"
                teleport-controls="cameraRig: #rig; teleportOrigin: #camera; button: trigger; collisionEntities: .teleport-surface">
            </a-entity>
        </a-entity>

        <!-- Invisible Plane for Teleportation -->
        <a-plane position="0 0 0" rotation="-90 0 0" width="100" height="100" visible="false"
            class="teleport-surface"></a-plane>
    </a-scene>
</template>

<script>
export default {
    name: 'ModelExperienceViewer',
};
</script>
